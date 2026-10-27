import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID, randomBytes, scryptSync } from "crypto";
import type { DB, Product, User, PublicUser } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

let cache: DB | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function load(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(DB_PATH, "utf8")) as DB;
  } catch {
    cache = seed();
    await persist(cache);
  }
  return cache;
}

async function persist(db: DB) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_PATH);
}

export async function readDB(): Promise<DB> {
  await queue;
  return load();
}

/** Serialized read-modify-write so concurrent requests never clobber each other. */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = fn(db);
    await persist(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, email, ...rest } = user;
  void passwordHash;
  void email;
  return rest;
}

export function newProduct(userId: string, partial: Partial<Product>): Product {
  return {
    id: randomUUID(),
    userId,
    type: "digital",
    title: "",
    subtitle: "",
    description: "",
    price: 0,
    image: "",
    buttonLabel: "",
    url: "",
    duration: 30,
    availability: { days: [1, 2, 3, 4, 5], start: "09:00", end: "17:00" },
    lessons: [],
    published: true,
    position: 0,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function seed(): DB {
  const userId = randomUUID();
  const user: User = {
    id: userId,
    email: "demo@vitrine.app",
    passwordHash: hashPassword("demo1234"),
    username: "demo",
    name: "Maya Laurent",
    bio: "Fitness coach & content creator. Helping busy people get strong in 30 minutes a day. 💪",
    avatar: "",
    theme: "violet",
    socials: { instagram: "maya.fit", tiktok: "mayafit", youtube: "", x: "", website: "" },
    createdAt: new Date().toISOString(),
  };

  const products: Product[] = [
    newProduct(userId, {
      type: "coaching",
      title: "1:1 Strategy Call",
      subtitle: "45 minutes to build your custom training plan",
      description:
        "We'll review your goals, schedule and current routine, then design a plan you can actually stick to. You'll leave the call with a written 4-week program.",
      price: 9900,
      duration: 45,
      buttonLabel: "Book a call",
      position: 0,
    }),
    newProduct(userId, {
      type: "digital",
      title: "30-Day Home Workout Guide",
      subtitle: "No gym, no equipment, real results",
      description:
        "A printable PDF with 30 progressive workouts, a meal-prep cheat sheet and a habit tracker.",
      price: 2900,
      url: "https://example.com/workout-guide.pdf",
      buttonLabel: "Get the guide",
      position: 1,
    }),
    newProduct(userId, {
      type: "course",
      title: "Strong in 30: The Course",
      subtitle: "6 video lessons on strength fundamentals",
      description: "Learn proper form, progressive overload and recovery from the ground up.",
      price: 14900,
      buttonLabel: "Enroll now",
      lessons: [
        { title: "Welcome & mindset", content: "Why consistency beats intensity.", videoUrl: "" },
        { title: "The 5 movement patterns", content: "Squat, hinge, push, pull, carry.", videoUrl: "" },
        { title: "Building your weekly split", content: "How to plan 3 sessions per week.", videoUrl: "" },
      ],
      position: 2,
    }),
    newProduct(userId, {
      type: "lead",
      title: "Free: 7 High-Protein Breakfasts",
      subtitle: "Recipe cards delivered to your inbox",
      price: 0,
      url: "https://example.com/breakfasts.pdf",
      buttonLabel: "Send it to me",
      position: 3,
    }),
    newProduct(userId, {
      type: "link",
      title: "Watch my latest YouTube video",
      url: "https://youtube.com",
      buttonLabel: "Watch",
      position: 4,
    }),
  ];

  // Synthetic history so the dashboard has something to show on first run.
  const db: DB = { users: [user], products, orders: [], events: [], sessions: [] };
  const buyers = ["Alex Kim", "Sam Rivera", "Jordan Lee", "Priya Shah", "Chris Moreau", "Lena Fischer", "Omar Haddad"];
  const now = Date.now();
  for (let d = 29; d >= 0; d--) {
    const day = now - d * 86400000;
    const views = 20 + Math.floor(Math.random() * 40);
    for (let i = 0; i < views; i++) {
      db.events.push({ id: randomUUID(), userId, kind: "view", createdAt: new Date(day - i * 60000).toISOString() });
    }
    const sales = Math.floor(Math.random() * 4);
    for (let i = 0; i < sales; i++) {
      const p = products[Math.floor(Math.random() * 4)]!;
      const buyer = buyers[Math.floor(Math.random() * buyers.length)]!;
      db.events.push({ id: randomUUID(), userId, kind: "click", productId: p.id, createdAt: new Date(day).toISOString() });
      db.orders.push({
        id: randomUUID(),
        userId,
        productId: p.id,
        productTitle: p.title,
        type: p.type,
        amount: p.price,
        buyerName: buyer,
        buyerEmail: `${buyer.split(" ")[0]!.toLowerCase()}@example.com`,
        createdAt: new Date(day - i * 3600000).toISOString(),
      });
    }
  }
  return db;
}
