export type ProductType = "digital" | "coaching" | "course" | "lead" | "link" | "membership";

export type Lesson = { title: string; content: string; videoUrl: string };

export type Availability = { days: number[]; start: string; end: string };

export type Product = {
  id: string;
  userId: string;
  type: ProductType;
  title: string;
  subtitle: string;
  description: string;
  price: number; // cents; 0 = free
  image: string;
  buttonLabel: string;
  url: string; // external link or file to deliver
  duration: number; // minutes, coaching only
  availability: Availability;
  lessons: Lesson[];
  published: boolean;
  position: number;
  createdAt: string;
};

export type Socials = {
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  website: string;
};

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  theme: string;
  socials: Socials;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash" | "email">;

export type Order = {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  type: ProductType;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  booking?: { date: string; time: string };
  createdAt: string;
};

export type TrackEvent = {
  id: string;
  userId: string;
  kind: "view" | "click";
  productId?: string;
  createdAt: string;
};

export type Session = { token: string; userId: string; expiresAt: string };

export type DB = {
  users: User[];
  products: Product[];
  orders: Order[];
  events: TrackEvent[];
  sessions: Session[];
};

export const PRODUCT_TYPES: Record<
  ProductType,
  { label: string; description: string; icon: string; defaultButton: string }
> = {
  digital: {
    label: "Digital Product",
    description: "Sell e-books, templates, presets or any downloadable file.",
    icon: "📦",
    defaultButton: "Get it now",
  },
  coaching: {
    label: "1:1 Coaching Call",
    description: "Let fans book and pay for time on your calendar.",
    icon: "📅",
    defaultButton: "Book a call",
  },
  course: {
    label: "Online Course",
    description: "Package lessons and videos into a self-paced course.",
    icon: "🎓",
    defaultButton: "Enroll now",
  },
  lead: {
    label: "Email Lead Magnet",
    description: "Give away a freebie in exchange for an email address.",
    icon: "🧲",
    defaultButton: "Send it to me",
  },
  membership: {
    label: "Membership",
    description: "Charge a monthly fee for a private community or content.",
    icon: "⭐",
    defaultButton: "Join now",
  },
  link: {
    label: "External Link",
    description: "Point to your YouTube, podcast, affiliate or any URL.",
    icon: "🔗",
    defaultButton: "Visit",
  },
};
