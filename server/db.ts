import fs from 'fs';
import path from 'path';
import { Product, Order, MemeItem, BakerStats, BakeryLocationSettings } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'biscuit_db.json');

const DEFAULT_SETTINGS: BakeryLocationSettings = {
  kitchenName: 'The Biscuit Plug - Gqeberha Kitchen',
  address: '9th Avenue, Walmer',
  suburb: 'Walmer',
  city: 'Gqeberha',
  province: 'Eastern Cape',
  postalCode: '6070',
  pickupHours: 'Mon - Sat: 10:00 - 16:00',
  pickupInstructions: 'Collection from our bakery kitchen in Walmer, Gqeberha. Buzzer at gate, warm cookies handed straight to you!',
  localDeliveryZoneName: 'Gqeberha Door Courier (Nelson Mandela Bay)',
  localDeliveryCoverage: 'Walmer, Summerstrand, Mill Park, Newton Park & Gqeberha surrounds (1-2 days)',
  localDeliveryFee: 70,
  pudoLockerLocationDefault: 'Engen 10th Ave Walmer Locker, Gqeberha',
  phone: '+27 82 894 2011',
  whatsappNumber: '27828942011',
  nationwideComingSoon: true,
};

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  memes: MemeItem[];
  settings: BakeryLocationSettings;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'nyc-choc-chip',
    name: 'Classic NYC Thicc Choc Chip',
    tagline: '160g of pure serotonin, gooey center with 70% dark Belgian chocolate',
    description: 'Our viral signature cookie. Golden, crisp exterior with a warm molten center packed with double Belgian chocolate chunks and sprinkled with Maldon sea salt flakes. Heat for 15s in the microwave and prepare to see God.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    category: 'stuffed-cookies',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: 'Emotional Support Cookie',
    badgeColor: '#ec4899',
    inStock: true,
    stockCount: 28,
    weightGrams: 160,
    rating: 4.9,
    reviewCount: 142,
    ingredientsSnippet: 'Stone-ground flour, pasture butter, Belgian 70% chocolate, brown sugar, organic eggs, Maldon salt'
  },
  {
    id: 'biscoff-lava-bomb',
    name: 'Lotus Biscoff Molten Cookie',
    tagline: 'Stuffed with molten Biscoff spread and topped with caramelized lotus crumb',
    description: 'She is that girl. Rich spiced brown butter cookie dough injected with a generous tablespoon of creamy Biscoff spread, crowned with a crunchy Speculoos biscuit. Zero regrets, 100% main character energy.',
    price: 52,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    category: 'stuffed-cookies',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: 'Main Character Energy',
    badgeColor: '#d97706',
    inStock: true,
    stockCount: 19,
    weightGrams: 165,
    rating: 5.0,
    reviewCount: 98,
    ingredientsSnippet: 'Brown butter, Belgian flour, Lotus Speculoos cream, vanilla bean paste, brown sugar'
  },
  {
    id: 'mzansi-milktart-cookie',
    name: 'The Mzansi Milk Tart Cookie',
    tagline: 'Cinnamon spiced velvet custard encased in a golden buttery biscuit',
    description: 'A love letter to South Africa. Traditional melktert reimagined as an artisan cookie. A crumbly, rich butter biscuit base cupping a silky cooked cinnamon & nutmeg custard core. Lekker doesn’t even begin to cover it.',
    price: 48,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    category: 'mzansi-heritage',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: 'Proudly SA 🇿🇦',
    badgeColor: '#10b981',
    inStock: true,
    stockCount: 15,
    weightGrams: 150,
    rating: 4.9,
    reviewCount: 84,
    ingredientsSnippet: 'Real milk tart custard, pure Ceylon cinnamon, nutmeg, butter shortcrust'
  },
  {
    id: 'hertzoggie-remix-blondie',
    name: 'Hertzoggie Apricot Blondie',
    tagline: 'Toasted coconut meringue cloud, tangy apricot jam, brown butter dough',
    description: 'Your Ouma could never (respectfully). Fudgy brown sugar blondie base with a generous swirl of home-made Robertson apricot preserve, topped with a crisp, toasted golden coconut meringue cap.',
    price: 46,
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    category: 'mzansi-heritage',
    dietary: ['Halal Friendly'],
    memeBadge: "Chef's Kiss",
    badgeColor: '#f59e0b',
    inStock: true,
    stockCount: 22,
    weightGrams: 140,
    rating: 4.8,
    reviewCount: 63,
    ingredientsSnippet: 'Toasted desiccated coconut, free-range egg white meringue, apricot preserve, brown butter'
  },
  {
    id: 'custom-savage-box-4',
    name: 'Savage Message Biscuits (Pack of 4)',
    tagline: 'Hand-stamped butter cookies with your custom petty or sweet message',
    description: 'Say it with carbs. 4 thick, pastel pink vanilla sugar biscuits with crisp royal icing and your custom stamped text. Great for birthdays, breakups, promotions, or reminding your bestie she’s that girl.',
    price: 180,
    originalPrice: 200,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    category: 'custom-message',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: '100% Unhinged',
    badgeColor: '#f43f5e',
    inStock: true,
    stockCount: 12,
    isCustomizable: true,
    customPlaceholder: 'e.g. DUMP HIM / IT’S GIVING BIRTHDAY / CERTIFIED BABE',
    rating: 5.0,
    reviewCount: 119,
    ingredientsSnippet: 'Madagascar vanilla bean, organic flour, butter, lemon-infused sugar fondant'
  },
  {
    id: 'triple-nutella-bomb',
    name: 'Midnight Nutella Lava Bomb',
    tagline: 'Double dark cocoa dough with an oozing molten hazelnut core',
    description: 'Warning: High risk of eating this in the dark in your pyjamas. Extra dark Dutch cocoa dough packed with roasted hazelnuts and stuffed with liquid Nutella that pours out when warm.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1618923834413-2770b904ee10?auto=format&fit=crop&w=800&q=80',
    category: 'stuffed-cookies',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: 'Girl Dinner Approved',
    badgeColor: '#8b5cf6',
    inStock: true,
    stockCount: 18,
    weightGrams: 160,
    rating: 4.9,
    reviewCount: 104,
    ingredientsSnippet: 'Dutch black cocoa, Ferrero hazelnut cream, semi-sweet Belgian callets'
  },
  {
    id: 'the-plug-box-6',
    name: 'The Plug Box (Best Seller 6-Pack)',
    tagline: 'The ultimate sampler box packed in signature hot pink with ribbons',
    description: 'Cannot decide? We got you. Contains: 2x Classic NYC Choc, 1x Biscoff Molten, 1x Mzansi Milk Tart, 1x Nutella Lava, 1x Red Velvet Cream Cheese. Comes in our keepsake pink bakery box with stickers and handwritten note.',
    price: 270,
    originalPrice: 300,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    category: 'bundles',
    dietary: ['Halal Friendly'],
    memeBadge: 'Best Value Deal',
    badgeColor: '#db2777',
    inStock: true,
    stockCount: 15,
    rating: 5.0,
    reviewCount: 231,
    ingredientsSnippet: 'Full assortment of our top fresh-baked goodies'
  },
  {
    id: 'red-velvet-cheesecake',
    name: 'Red Velvet Cheesecake Core',
    tagline: 'Ruby cocoa cookie with a tangy vanilla bean cream cheese centre',
    description: 'Velvety, soft-baked red cocoa dough enveloping a chilled, tangy cream cheese core. Topped with white chocolate drizzle. It is giving high society tea party in Houghton.',
    price: 52,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    category: 'stuffed-cookies',
    dietary: ['Halal Friendly', 'Vegetarian'],
    memeBadge: 'Certified Lover Girl',
    badgeColor: '#ec4899',
    inStock: true,
    stockCount: 14,
    weightGrams: 160,
    rating: 4.8,
    reviewCount: 77,
    ingredientsSnippet: 'Red velvet dough, Philadelphia cream cheese, Madagascar vanilla, Belgian white chips'
  },
  {
    id: 'smores-fudge-brownie',
    name: 'Campfire S’mores Brownie Slab',
    tagline: 'Dense fudge brownie, toasted golden marshmallow, biscuit crumb',
    description: 'Crispy edges, ridiculously fudgy center, melted Hershey-style chocolate shards, and real blow-torched campfire marshmallows that stretch for days.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'brownies',
    dietary: ['Halal Friendly'],
    memeBadge: 'Drool Worthy',
    badgeColor: '#0ea5e9',
    inStock: true,
    stockCount: 16,
    weightGrams: 170,
    rating: 4.9,
    reviewCount: 52,
    ingredientsSnippet: 'Valrhona cocoa powder, 70% dark chocolate, toasted gelatin-free marshmallows'
  }
];

const DEFAULT_MEMES: MemeItem[] = [
  {
    id: 'meme-1',
    title: 'Self-Care in Mzansi',
    caption: 'My therapist: "And what did we do instead of texting him?" Me: "Ordered 6 stuffed cookies from The Biscuit Plug at 11:42pm and tipped the courier."',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    likes: 428,
    author: '@thando_vibes',
    tag: 'Relatable',
    vibeCookieRecommendation: 'Lotus Biscoff Molten Cookie'
  },
  {
    id: 'meme-2',
    title: 'The "Girl Dinner" Formula',
    caption: 'One iced matcha latte, two cigarettes (metaphorical), and one 160g warm NYC chocolate chip cookie eaten over the kitchen sink.',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
    likes: 312,
    author: '@jess_cpt',
    tag: 'Girl Dinner',
    vibeCookieRecommendation: 'Classic NYC Thicc Choc Chip'
  },
  {
    id: 'meme-3',
    title: 'Corporate Burnout Survival Pack',
    caption: 'Outlook notification: "Per my last email..." Me opening the biscuit tin: "Per my last mouthful, I do not care."',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    likes: 589,
    author: '@sandton_survivor',
    tag: 'Work Life',
    vibeCookieRecommendation: 'Midnight Nutella Lava Bomb'
  },
  {
    id: 'meme-4',
    title: 'Loadshedding Romance',
    caption: 'Stage 6 loadshedding hits, candles are lit, microwave does not work... eating the cookie cold like an unhinged Victorian child.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    likes: 674,
    author: '@biscuitplug_official',
    tag: 'Mzansi Realness',
    vibeCookieRecommendation: 'The Mzansi Milk Tart Cookie'
  },
  {
    id: 'meme-5',
    title: 'Stamped Biscuit Savage Energy',
    caption: 'Customer ordered: "HAPPY 30TH YOU ANCIENT RELIC" stamped on 4 heart biscuits for her brother. We love to see family love.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    likes: 819,
    author: '@theplug_kitchen',
    tag: 'Custom Bakes',
    vibeCookieRecommendation: 'Savage Message Biscuits'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'TBP-4892',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      name: 'Lerato Khumalo',
      email: 'lerato@gmail.com',
      phone: '082 459 2810'
    },
    delivery: {
      method: 'courier',
      cost: 95,
      address: '14 Atholl Oaklands Rd',
      suburb: 'Melrose',
      city: 'Johannesburg',
      postalCode: '2196',
      notes: 'Please ring unit 4B buzzer twice'
    },
    items: [
      {
        productId: 'the-plug-box-6',
        name: 'The Plug Box (Best Seller 6-Pack)',
        quantity: 1,
        price: 270,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'biscoff-lava-bomb',
        name: 'Lotus Biscoff Molten Cookie',
        quantity: 2,
        price: 52,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 374,
    discount: 37.4,
    deliveryFee: 95,
    total: 431.6,
    promoCode: 'BABES10',
    paymentMethod: 'snapscan',
    paymentStatus: 'paid',
    status: 'baking',
    statusUpdated: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'TBP-3901',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    customer: {
      name: 'Chloe van der Merwe',
      email: 'chloe.vdm@outlook.com',
      phone: '071 902 3841'
    },
    delivery: {
      method: 'pudo',
      cost: 60,
      address: 'PUDO Locker at Engen Kloof',
      suburb: 'Gardens',
      city: 'Cape Town',
      postalCode: '8001',
      pudoLockerLocation: 'Engen Kloof Street Locker'
    },
    items: [
      {
        productId: 'custom-savage-box-4',
        name: 'Savage Message Biscuits (Pack of 4)',
        quantity: 1,
        price: 180,
        customMessage: 'CONGRATS ON LEAVING THAT TOXIC JOB BESTIE',
        image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 180,
    discount: 0,
    deliveryFee: 60,
    total: 240,
    paymentMethod: 'instant-eft',
    paymentStatus: 'paid',
    status: 'boxed',
    statusUpdated: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'TBP-2180',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    customer: {
      name: 'Nandi Sithole',
      email: 'nandi.s@gmail.com',
      phone: '083 555 1928'
    },
    delivery: {
      method: 'pickup',
      cost: 0,
      address: 'Collection at The Biscuit Plug Kitchen (Stanley St)',
      suburb: 'Richmond Hill',
      city: 'Port Elizabeth',
      postalCode: '6001'
    },
    items: [
      {
        productId: 'nyc-choc-chip',
        name: 'Classic NYC Thicc Choc Chip',
        quantity: 4,
        price: 45,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'mzansi-milktart-cookie',
        name: 'The Mzansi Milk Tart Cookie',
        quantity: 2,
        price: 48,
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 276,
    discount: 20,
    deliveryFee: 0,
    total: 256,
    promoCode: 'GIRLDINNER',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'delivered',
    statusUpdated: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || DEFAULT_PRODUCTS,
          orders: parsed.orders || DEFAULT_ORDERS,
          memes: parsed.memes || DEFAULT_MEMES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };
      }
    } catch (err) {
      console.warn('Could not read persistent DB file, using defaults:', err);
    }

    const initial: DatabaseSchema = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      memes: DEFAULT_MEMES,
      settings: DEFAULT_SETTINGS
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write DB to file:', err);
    }
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const id = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const newProduct: Product = { ...product, id };
    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.saveData(this.data);
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Orders
  getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  }

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusUpdated'>): Order {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TBP-${randomCode}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      status: 'received',
      statusUpdated: now
    };

    // Deduct stock for ordered items
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
        if (prod.stockCount === 0) {
          prod.inStock = false;
        }
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id.toUpperCase() === orderId.toUpperCase());
    if (!order) return null;
    order.status = status;
    order.statusUpdated = new Date().toISOString();
    this.saveData(this.data);
    return order;
  }

  // Memes
  getMemes(): MemeItem[] {
    return this.data.memes;
  }

  likeMeme(id: string): MemeItem | null {
    const meme = this.data.memes.find(m => m.id === id);
    if (!meme) return null;
    meme.likes += 1;
    this.saveData(this.data);
    return meme;
  }

  addMeme(meme: Omit<MemeItem, 'id' | 'likes'>): MemeItem {
    const newMeme: MemeItem = {
      ...meme,
      id: `meme-${Date.now()}`,
      likes: 1
    };
    this.data.memes.unshift(newMeme);
    this.saveData(this.data);
    return newMeme;
  }

  // Stats
  getStats(): BakerStats {
    const totalRevenue = this.data.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordersCount = this.data.orders.length;
    const totalCookiesBaked = this.data.orders.reduce((sum, o) => {
      return sum + o.items.reduce((s, it) => s + (it.quantity || 1), 0);
    }, 0);
    const activeOrders = this.data.orders.filter(o => o.status !== 'delivered').length;
    const lowStockItems = this.data.products.filter(p => p.stockCount < 10).length;

    return {
      totalRevenue,
      ordersCount,
      totalCookiesBaked,
      activeOrders,
      lowStockItems
    };
  }

  // Settings
  getSettings(): BakeryLocationSettings {
    return { ...DEFAULT_SETTINGS, ...(this.data.settings || {}) };
  }

  updateSettings(newSettings: Partial<BakeryLocationSettings>): BakeryLocationSettings {
    this.data.settings = {
      ...DEFAULT_SETTINGS,
      ...(this.data.settings || {}),
      ...newSettings
    };
    this.saveData(this.data);
    return this.data.settings;
  }

  // Reset database to default
  resetToDefaults() {
    this.data = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      memes: DEFAULT_MEMES,
      settings: DEFAULT_SETTINGS
    };
    this.saveData(this.data);
  }
}

export const db = new Database();
