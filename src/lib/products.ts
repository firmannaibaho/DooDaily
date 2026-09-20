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
    name: "Sleepy Cat Keychain",
    slug: "sleepy-cat-keychain",
    description: "The classic Doodaily sleepy cat companion. Perfect for your keys, bag, or anywhere you need a little smile. Made with high-quality acrylic and lots of love.",
    price: 45000,
    images: ["/logo.jpg"],
    category: "keychains",
    tags: ["cat", "cute", "best-seller"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Sleepy Cat", "Happy Cat"] }],
    colors: ["#4776B9", "#F5A03A"],
    stock: 50,
    featured: true,
    isNew: false,
    isPopular: true,
  },
  {
    id: 2,
    name: "Custom Doodaily Cat Keychain",
    slug: "custom-doodaily-cat-keychain",
    description: "Design your own unique Doodaily cat! Pick your colors, add your name, and choose a cute charm. This one is truly yours.",
    price: 55000,
    images: ["/logo.jpg"],
    category: "custom-keychains",
    tags: ["cat", "custom", "personalized"],
    isCustomizable: true,
    variants: [{ name: "Character", options: ["Doodaily Cat", "Sleepy Bear", "Bouncy Bunny"] }],
    colors: ["#4776B9", "#F5A03A", "#F472B6", "#34D399", "#A78BFA"],
    stock: 100,
    featured: true,
    isNew: true,
    isPopular: true,
  },
  {
    id: 3,
    name: "Bouncy Bunny Keychain",
    slug: "bouncy-bunny-keychain",
    description: "A cheerful bunny ready to hop onto your bag! Lightweight, colorful, and always smiling.",
    price: 45000,
    images: ["/logo.jpg"],
    category: "keychains",
    tags: ["bunny", "cute"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Bouncy Bunny"] }],
    colors: ["#F472B6", "#A78BFA"],
    stock: 35,
    featured: true,
    isNew: true,
    isPopular: false,
  },
  {
    id: 4,
    name: "Doodaily Sticker Pack Vol. 1",
    slug: "doodaily-sticker-pack-vol-1",
    description: "A pack of 10 cute, waterproof Doodaily stickers featuring all your favorite characters. Perfect for laptops, bottles, and notebooks.",
    price: 25000,
    images: ["/logo.jpg"],
    category: "sticker-packs",
    tags: ["stickers", "pack", "waterproof"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 200,
    featured: true,
    isNew: false,
    isPopular: true,
  },
  {
    id: 5,
    name: "Custom Bunny Keychain",
    slug: "custom-bunny-keychain",
    description: "Create your very own bunny companion with custom colors and your name engraved.",
    price: 55000,
    images: ["/logo.jpg"],
    category: "custom-keychains",
    tags: ["bunny", "custom", "personalized"],
    isCustomizable: true,
    variants: [{ name: "Character", options: ["Bouncy Bunny"] }],
    colors: ["#F472B6", "#A78BFA", "#34D399", "#FBBF24"],
    stock: 80,
    featured: false,
    isNew: true,
    isPopular: false,
  },
  {
    id: 6,
    name: "Sleepy Bear Keychain",
    slug: "sleepy-bear-keychain",
    description: "This cozy bear just wants to nap on your backpack. Adorable and huggable (well, almost).",
    price: 45000,
    images: ["/logo.jpg"],
    category: "keychains",
    tags: ["bear", "cute", "cozy"],
    isCustomizable: false,
    variants: [{ name: "Design", options: ["Sleepy Bear"] }],
    colors: ["#F5A03A", "#92400E"],
    stock: 40,
    featured: false,
    isNew: false,
    isPopular: true,
  },
  {
    id: 7,
    name: "Doodaily Notebook",
    slug: "doodaily-notebook",
    description: "A cute A5 notebook with Doodaily illustrations on the cover. 80 pages of dot-grid goodness for all your doodles.",
    price: 35000,
    images: ["/logo.jpg"],
    category: "art-stationery",
    tags: ["notebook", "stationery", "doodle"],
    isCustomizable: false,
    variants: [{ name: "Cover", options: ["Cat", "Bunny", "Bear"] }],
    colors: [],
    stock: 60,
    featured: false,
    isNew: true,
    isPopular: false,
  },
  {
    id: 8,
    name: "Limited Edition Gold Cat Keychain",
    slug: "limited-edition-gold-cat-keychain",
    description: "A special gold-plated version of the iconic Doodaily cat. Limited to 50 pieces only!",
    price: 85000,
    images: ["/logo.jpg"],
    category: "limited-edition",
    tags: ["cat", "gold", "limited", "premium"],
    isCustomizable: false,
    variants: [],
    colors: ["#FBBF24"],
    stock: 12,
    featured: true,
    isNew: true,
    isPopular: false,
  },
  {
    id: 9,
    name: "Doodaily Starter Bundle",
    slug: "doodaily-starter-bundle",
    description: "The perfect starter kit! Includes 1 keychain, 1 sticker pack, and 1 notebook at a special bundled price.",
    price: 89000,
    images: ["/logo.jpg"],
    category: "bundles",
    tags: ["bundle", "starter", "value"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 30,
    featured: true,
    isNew: false,
    isPopular: true,
  },
  {
    id: 10,
    name: "Doodaily Sticker Pack Vol. 2",
    slug: "doodaily-sticker-pack-vol-2",
    description: "10 brand new sticker designs! Features seasonal themes and all-new characters.",
    price: 25000,
    images: ["/logo.jpg"],
    category: "sticker-packs",
    tags: ["stickers", "pack", "new"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 150,
    featured: false,
    isNew: true,
    isPopular: false,
  },
  {
    id: 11,
    name: "Custom Bear Keychain",
    slug: "custom-bear-keychain",
    description: "Create a one-of-a-kind bear keychain with your favorite colors and your name.",
    price: 55000,
    images: ["/logo.jpg"],
    category: "custom-keychains",
    tags: ["bear", "custom", "personalized"],
    isCustomizable: true,
    variants: [{ name: "Character", options: ["Sleepy Bear"] }],
    colors: ["#F5A03A", "#4776B9", "#34D399"],
    stock: 70,
    featured: false,
    isNew: false,
    isPopular: false,
  },
  {
    id: 12,
    name: "Doodaily Pencil Set",
    slug: "doodaily-pencil-set",
    description: "A set of 6 pastel-colored pencils with tiny Doodaily character toppers. Cute and functional!",
    price: 30000,
    images: ["/logo.jpg"],
    category: "art-stationery",
    tags: ["pencil", "stationery", "set"],
    isCustomizable: false,
    variants: [],
    colors: [],
    stock: 45,
    featured: false,
    isNew: false,
    isPopular: false,
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
