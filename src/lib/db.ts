import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { randomUUID, randomBytes, scryptSync } from "crypto";
import type { DB, Product, User, PublicUser } from "./types";

/*
 * Storage: Cloudflare D1 (SQLite). Each collection is a table of JSON documents
 * (id, data). readDB() loads everything; mutate() diffs the in-memory copy and
 * writes only the rows that changed. Fine for a single creator platform at
 * small scale; move hot paths (events, orders) to real columns + queries as it grows.
 */

const TABLES = ["users", "products", "orders", "events", "sessions"] as const;
type Table = (typeof TABLES)[number];
type Row = { id?: string; token?: string };

const rowKey = (table: Table, row: Row) => (table === "sessions" ? row.token! : row.id!);

let schemaReady: Promise<void> | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function d1() {
  return (await getCloudflareContext({ async: true })).env.DB;
}

async function runChunked(db: D1Database, stmts: D1PreparedStatement[]) {
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50));
}

function upserts(db: D1Database, data: DB) {
  return TABLES.flatMap((t) =>
    (data[t] as Row[]).map((row) =>
      db.prepare(`INSERT OR REPLACE INTO ${t} (id, data) VALUES (?, ?)`).bind(rowKey(t, row), JSON.stringify(row)),
    ),
  );
}

async function ensureSchema(db: D1Database) {
  await db.batch(TABLES.map((t) => db.prepare(`CREATE TABLE IF NOT EXISTS ${t} (id TEXT PRIMARY KEY, data TEXT NOT NULL)`)));
  const row = await db.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
  if (!row?.n) await runChunked(db, upserts(db, seed()));
}

async function load(): Promise<{ db: D1Database; data: DB }> {
  const db = await d1();
  schemaReady ??= ensureSchema(db).catch((e) => {
    schemaReady = null;
    throw e;
  });
  await schemaReady;
  const results = await db.batch(TABLES.map((t) => db.prepare(`SELECT data FROM ${t}`)));
  const data = Object.fromEntries(
    TABLES.map((t, i) => [t, (results[i]!.results as { data: string }[]).map((r) => JSON.parse(r.data))]),
  ) as DB;
  return { db, data };
}

export async function readDB(): Promise<DB> {
  await queue;
  return (await load()).data;
}

/** Read-modify-write: runs `fn` on a fresh copy, then persists only changed/added/removed rows. */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const { db, data } = await load();
    const before = new Map(TABLES.map((t) => [t, new Map((data[t] as Row[]).map((r) => [rowKey(t, r), JSON.stringify(r)]))]));
    const result = fn(data);
    const stmts: D1PreparedStatement[] = [];
    for (const t of TABLES) {
      const prev = before.get(t)!;
      const seen = new Set<string>();
      for (const row of data[t] as Row[]) {
        const k = rowKey(t, row);
        const json = JSON.stringify(row);
        seen.add(k);
        if (prev.get(k) !== json) stmts.push(db.prepare(`INSERT OR REPLACE INTO ${t} (id, data) VALUES (?, ?)`).bind(k, json));
      }
      for (const k of prev.keys()) if (!seen.has(k)) stmts.push(db.prepare(`DELETE FROM ${t} WHERE id = ?`).bind(k));
    }
    await runChunked(db, stmts);
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
  const userId = "demo-user";
  const user: User = {
    id: userId,
    email: "demo@inf.link",
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
      id: "demo-p0",
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
      id: "demo-p1",
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
      id: "demo-p2",
      position: 2,
    }),
    newProduct(userId, {
      type: "lead",
      title: "Free: 7 High-Protein Breakfasts",
      subtitle: "Recipe cards delivered to your inbox",
      price: 0,
      url: "https://example.com/breakfasts.pdf",
      buttonLabel: "Send it to me",
      id: "demo-p3",
      position: 3,
    }),
    newProduct(userId, {
      type: "link",
      title: "Watch my latest YouTube video",
      url: "https://youtube.com",
      buttonLabel: "Watch",
      id: "demo-p4",
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
