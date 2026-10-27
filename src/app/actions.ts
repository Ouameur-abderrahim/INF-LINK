"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hashPassword, mutate, newProduct, readDB } from "@/lib/db";
import { createSession, destroySession, requireUser, verifyPassword } from "@/lib/auth";
import type { Availability, Lesson, Product, ProductType, Socials } from "@/lib/types";
import { PRODUCT_TYPES } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | undefined;

const RESERVED = new Set(["dashboard", "login", "signup", "logout", "api", "learn", "go", "admin", "settings", "_next"]);
const USERNAME_RE = /^[a-z0-9_.-]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

// ---------- Auth ----------

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const name = str(fd, "name");
  const username = str(fd, "username").toLowerCase();

  if (!name) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!USERNAME_RE.test(username) || RESERVED.has(username))
    return { error: "Username must be 3–30 characters: letters, numbers, dot, dash or underscore." };

  const result = await mutate((db) => {
    if (db.users.some((u) => u.email === email)) return { error: "An account with this email already exists." };
    if (db.users.some((u) => u.username === username)) return { error: "That username is taken." };
    const id = randomUUID();
    db.users.push({
      id,
      email,
      passwordHash: hashPassword(password),
      username,
      name,
      bio: "",
      avatar: "",
      theme: "violet",
      socials: { instagram: "", tiktok: "", youtube: "", x: "", website: "" },
      createdAt: new Date().toISOString(),
    });
    return { id };
  });
  if ("error" in result) return result;
  await createSession(result.id);
  redirect("/dashboard/store");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const db = await readDB();
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Invalid email or password." };
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

// ---------- Profile ----------

export type ProfileInput = {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  theme: string;
  socials: Socials;
};

export async function saveProfile(input: ProfileInput): Promise<FormState> {
  const user = await requireUser();
  const username = input.username.trim().toLowerCase();
  if (!input.name.trim()) return { error: "Name is required." };
  if (!USERNAME_RE.test(username) || RESERVED.has(username)) return { error: "Invalid username." };

  const result = await mutate((db) => {
    if (db.users.some((u) => u.username === username && u.id !== user.id)) return { error: "That username is taken." };
    const u = db.users.find((x) => x.id === user.id)!;
    u.name = input.name.trim().slice(0, 80);
    u.username = username;
    u.bio = input.bio.slice(0, 300);
    u.avatar = input.avatar;
    u.theme = input.theme;
    u.socials = input.socials;
    return { ok: true };
  });
  revalidatePath("/", "layout");
  return result;
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (!verifyPassword(current, user.passwordHash)) return { error: "Current password is incorrect." };
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  await mutate((db) => {
    db.users.find((u) => u.id === user.id)!.passwordHash = hashPassword(next);
  });
  return { ok: true };
}

// ---------- Products ----------

export type ProductInput = {
  id?: string;
  type: ProductType;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  buttonLabel: string;
  url: string;
  duration: number;
  availability: Availability;
  lessons: Lesson[];
  published: boolean;
};

export async function saveProduct(input: ProductInput): Promise<FormState> {
  const user = await requireUser();
  if (!PRODUCT_TYPES[input.type]) return { error: "Unknown product type." };
  if (!input.title.trim()) return { error: "Title is required." };
  if (input.type === "link" && !/^https?:\/\//.test(input.url)) return { error: "Enter a valid URL starting with http(s)://" };
  if (input.type === "lead") input.price = 0;
  if (input.type === "link") input.price = 0;
  if (input.price < 0 || !Number.isFinite(input.price)) return { error: "Invalid price." };
  if (input.type === "coaching" && input.availability.start >= input.availability.end)
    return { error: "Availability end time must be after start time." };

  const fields: Partial<Product> = {
    type: input.type,
    title: input.title.trim().slice(0, 120),
    subtitle: input.subtitle.trim().slice(0, 200),
    description: input.description.slice(0, 5000),
    price: Math.round(input.price),
    image: input.image,
    buttonLabel: input.buttonLabel.trim().slice(0, 40),
    url: input.url.trim(),
    duration: Math.max(15, Math.min(240, Math.round(input.duration) || 30)),
    availability: input.availability,
    lessons: input.lessons.filter((l) => l.title.trim()),
    published: input.published,
  };

  const result = await mutate((db) => {
    if (input.id) {
      const p = db.products.find((x) => x.id === input.id && x.userId === user.id);
      if (!p) return { error: "Product not found." };
      Object.assign(p, fields);
    } else {
      const mine = db.products.filter((p) => p.userId === user.id);
      const position = mine.length ? Math.max(...mine.map((p) => p.position)) + 1 : 0;
      db.products.push(newProduct(user.id, { ...fields, position }));
    }
    return { ok: true };
  });
  if (result.error) return result;
  revalidatePath("/", "layout");
  redirect("/dashboard/store");
}

export async function deleteProduct(id: string) {
  const user = await requireUser();
  await mutate((db) => {
    db.products = db.products.filter((p) => !(p.id === id && p.userId === user.id));
  });
  revalidatePath("/", "layout");
}

export async function togglePublished(id: string) {
  const user = await requireUser();
  await mutate((db) => {
    const p = db.products.find((x) => x.id === id && x.userId === user.id);
    if (p) p.published = !p.published;
  });
  revalidatePath("/", "layout");
}

export async function reorderProducts(ids: string[]) {
  const user = await requireUser();
  await mutate((db) => {
    ids.forEach((id, i) => {
      const p = db.products.find((x) => x.id === id && x.userId === user.id);
      if (p) p.position = i;
    });
  });
  revalidatePath("/", "layout");
}

// ---------- Checkout (public) ----------

export async function checkout(_: FormState, fd: FormData): Promise<FormState> {
  const productId = str(fd, "productId");
  const buyerName = str(fd, "name");
  const buyerEmail = str(fd, "email").toLowerCase();
  const date = str(fd, "date");
  const time = str(fd, "time");

  if (!buyerName) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(buyerEmail)) return { error: "Please enter a valid email." };

  const result = await mutate((db) => {
    const product = db.products.find((p) => p.id === productId && p.published);
    if (!product || product.type === "link") return { error: "This product is no longer available." };
    const creator = db.users.find((u) => u.id === product.userId)!;

    if (product.type === "coaching") {
      if (!date || !time) return { error: "Please pick a date and time." };
      const taken = db.orders.some(
        (o) => o.productId === product.id && o.booking?.date === date && o.booking?.time === time,
      );
      if (taken) return { error: "Sorry, that slot was just booked. Please pick another." };
    }

    if (product.price > 0) {
      // Demo payment: accept any 16-digit card number. Swap for Stripe Checkout in production.
      const card = str(fd, "card").replace(/\s/g, "");
      if (!/^\d{16}$/.test(card)) return { error: "Enter a 16-digit card number (test mode: 4242 4242 4242 4242)." };
    }

    const order = {
      id: randomUUID(),
      userId: product.userId,
      productId: product.id,
      productTitle: product.title,
      type: product.type,
      amount: product.price,
      buyerName,
      buyerEmail,
      booking: product.type === "coaching" ? { date, time } : undefined,
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);
    return { orderId: order.id, username: creator.username };
  });

  if ("error" in result) return { error: result.error };
  revalidatePath("/dashboard", "layout");
  redirect(`/${result.username}/order/${result.orderId}`);
}
