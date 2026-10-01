export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  isCustomizable: boolean;
  variants: { name: string; options: string[] }[];
  colors: string[];
  stock: number;
  featured: boolean;
  isNew: boolean;
  isPopular: boolean;
}

export const CATEGORIES = [
  { id: "all", name: "All", icon: "✨" },
  { id: "keychains", name: "Keychains", icon: "🔑" },
  { id: "custom-keychains", name: "Custom Keychains", icon: "🎨" },
  { id: "sticker-packs", name: "Sticker Packs", icon: "⭐" },
  { id: "art-stationery", name: "Art & Stationery", icon: "📝" },
  { id: "limited-edition", name: "Limited Edition", icon: "💎" },
  { id: "bundles", name: "Bundles", icon: "🎁" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Team Meeting Presentation Keychain",
    slug: "team-meeting-presentation-keychain",
    description: "Gantungan kunci akrilik imut bergambar tim diskusi & presentasi kerja kelompok. Dibuat dengan akrilik tebal berkualitas tinggi.",
    price: 10000,
    images: ["/catalog/team-meeting-keychain.jpg"],
    category: "keychains",
    tags: ["team", "meeting", "presentation", "cute", "best-seller"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Team Presentation"] }],
    colors: ["#4776B9", "#F5A03A"],
    stock: 50,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 2,
    name: "Study & Work Grind Keychain",
    slug: "study-work-grind-keychain",
    description: "Gantungan kunci akrilik karakter manis dengan headphone, laptop, dan boba tea. Pas buat nemenin suasana belajar & kerja kamu!",
    price: 10000,
    images: ["/catalog/study-work-keychain.jpg"],
    category: "keychains",
    tags: ["study", "work", "laptop", "boba", "cute"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Study Grind"] }],
    colors: ["#4776B9", "#F472B6"],
    stock: 100,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 3,
    name: "Nailong Dino Cute Keychain",
    slug: "nailong-dino-cute-keychain",
    description: "Gantungan kunci akrilik karakter Nailong si naga kuning imut lagi santai rebahan di bantal empuk.",
    price: 10000,
    images: ["/catalog/nailong-dino-keychain.jpg"],
    category: "keychains",
    tags: ["nailong", "dino", "yellow", "cute"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Nailong Sleepy"] }],
    colors: ["#FBBF24", "#F5A03A"],
    stock: 80,
    featured: true,
    isNew: false,
    isPopular: true,
  },
  {
    id: 4,
    name: "Tuxedo Cat & Pink Fish Keychain",
    slug: "tuxedo-cat-pink-fish-keychain",
    description: "Gantungan kunci akrilik kucing hitam-putih imut memeluk ikan pink kesayangan dengan penuh cinta.",
    price: 10000,
    images: ["/catalog/cat-fish-keychain.jpg"],
    category: "keychains",
    tags: ["cat", "fish", "tuxedo-cat", "cute"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Cat Hug Fish"] }],
    colors: ["#1C1917", "#F472B6"],
    stock: 60,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 5,
    name: "Good Day Coffee & Toast Keychain",
    slug: "good-day-coffee-toast-keychain",
    description: "Gantungan kunci akrilik es kopi boba Good Day, roti tawar tersenyum, dan pesan positif Better Things Ahead.",
    price: 10000,
    images: ["/catalog/good-day-coffee-keychain.jpg"],
    category: "keychains",
    tags: ["coffee", "toast", "boba", "good-day", "positive"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Good Day Coffee"] }],
    colors: ["#92400E", "#FBBF24"],
    stock: 75,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 6,
    name: "Tooth Fairy Crown Sticker (5x5 cm)",
    slug: "tooth-fairy-crown-sticker",
    description: "Stiker peri gigi imut bermahkota emas dengan tongkat bintang (Ukuran: 5 cm x 5 cm). Bahan vinil tebal & tahan air!",
    price: 10000,
    images: ["/catalog/tooth-fairy-sticker.jpg"],
    category: "sticker-packs",
    tags: ["tooth", "fairy", "dental", "sticker", "waterproof"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 200,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 7,
    name: "I'm a Dentist Sticker (7x3.5 cm)",
    slug: "im-a-dentist-sticker",
    description: "Stiker typography I'm a Dentist dengan ilustrasi sikat gigi & pasta gigi (Ukuran: 7 cm x 3.5 cm). Tahan air & tidak gampang mengelupas.",
    price: 10000,
    images: ["/catalog/dentist-title-sticker.jpg"],
    category: "sticker-packs",
    tags: ["dentist", "dental", "sticker", "waterproof"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 150,
    featured: false,
    isNew: true,
    isPopular: false,
  },
  {
    id: 8,
    name: "Dental Tools Love Sticker (6x4.2 cm)",
    slug: "dental-tools-love-sticker",
    description: "Stiker kreatif kata LOVE berbentuk alat-alat dokter gigi & gigi imut (Ukuran: 6 cm x 4.2 cm).",
    price: 10000,
    images: ["/catalog/dental-love-sticker.jpg"],
    category: "sticker-packs",
    tags: ["dental", "tools", "love", "sticker"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 180,
    featured: false,
    isNew: true,
    isPopular: true,
  },
  {
    id: 9,
    name: "Oral Hy-Jean Tooth Sticker (4.5x5.5 cm)",
    slug: "oral-hyjean-tooth-sticker",
    description: "Stiker menggemaskan ORAL HY-JEAN karakter gigi ceria memakai celana jeans (Ukuran: 4.5 cm x 5.5 cm).",
    price: 10000,
    images: ["/catalog/oral-hyjean-sticker.jpg"],
    category: "sticker-packs",
    tags: ["oral-hygiene", "jeans", "dental", "sticker"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 120,
    featured: true,
    isNew: true,
    isPopular: false,
  },
  {
    id: 10,
    name: "Custom Doodaily Acrylic Keychain",
    slug: "custom-doodaily-acrylic-keychain",
    description: "Buat gantungan kunci akrilik custom impianmu! Pilih karakter, warna, dan cetak nama kamu sendiri.",
    price: 10000,
    images: ["/catalog/study-work-keychain.jpg"],
    category: "custom-keychains",
    tags: ["custom", "acrylic", "personalized"],
    isCustomizable: true,
    variants: [{ name: "Character", options: ["Team Meeting", "Study Grind", "Nailong Dino", "Cat & Fish"] }],
    colors: ["#4776B9", "#F5A03A", "#F472B6", "#34D399", "#A78BFA"],
    stock: 100,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 11,
    name: "Doodaily Dental Sticker Pack",
    slug: "doodaily-dental-sticker-pack",
    description: "Paket stiker lengkap isi 4 desain dental (Peri Gigi, Dentist, Dental Tools Love, & Oral Hy-Jean).",
    price: 10000,
    images: ["/catalog/tooth-fairy-sticker.jpg"],
    category: "sticker-packs",
    tags: ["stickers", "dental", "pack", "bundle"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 150,
    featured: false,
    isNew: true,
    isPopular: true,
  },
  {
    id: 12,
    name: "Doodaily Special Combo Bundle",
    slug: "doodaily-special-combo-bundle",
    description: "Paket hemat spesial Doodaily! Dapatkan 1 Gantungan Kunci Pilihan + 1 Sticker Pack favorit hanya 10.000.",
    price: 10000,
    images: ["/catalog/good-day-coffee-keychain.jpg"],
    category: "bundles",
    tags: ["bundle", "combo", "value", "special"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 50,
    featured: true,
    isNew: true,
    isPopular: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(categoryId: string): Product[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.category === categoryId);
}
