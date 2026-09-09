import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Product,
  ProductImage,
  Order,
  Review,
  UserManualData,
  SiteSettings,
  DashboardStats,
  OrderStatus,
} from '../src/types.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  product: Product;
  orders: Order[];
  reviews: Review[];
  manual: UserManualData;
  siteSettings: SiteSettings;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? '/tmp/kitchease-data' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.resolve(process.cwd(), 'data', 'db.json');

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const reHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return reHash === hash;
}

const initialImages: ProductImage[] = [
  {
    id: 'img-1',
    url: '/images/hero.jpg',
    caption: 'KitchEase 2-in-1 Dispenser & Sprayer - Matte Black & Borosilicate Glass',
    alt: 'KitchEase oil dispenser bottle with golden cooking oil, ergonomic handle, and dual spout mechanism',
    order: 1,
    isMain: true,
  },
  {
    id: 'img-2',
    url: '/images/spray.jpg',
    caption: 'Micro-Fine Atomized Spray - Press quickly for uniform healthy misting',
    alt: 'Hand spraying fine mist of oil onto fresh food ingredients',
    order: 2,
    isMain: false,
  },
  {
    id: 'img-3',
    url: '/images/pour.jpg',
    caption: 'Controlled Drip-Free Pour - Tilt to drizzle steady oil into hot pans',
    alt: 'Tilting KitchEase dispenser to pour golden oil smoothly into a hot skillet',
    order: 3,
    isMain: false,
  },
  {
    id: 'img-4',
    url: '/images/accessories.jpg',
    caption: 'Full Culinary Kit - Dispenser, cleaning brushes, basting brush & gift box',
    alt: 'KitchEase dispenser shown with bottle cleaning brushes, silicone basting brush, and retail package',
    order: 4,
    isMain: false,
  },
  {
    id: 'img-5',
    url: '/images/kitchen.jpg',
    caption: 'Modern Lifestyle Design - Sits cleanly on any contemporary countertop',
    alt: 'KitchEase dispenser resting on kitchen marble counter with fresh cooking ingredients',
    order: 5,
    isMain: false,
  },
];

const initialProduct: Product = {
  id: 'prod-kitchease-01',
  name: 'KitchEase Oil Dispenser / Sprayer',
  description:
    'The revolutionary 2-in-1 kitchen essential that seamlessly switches between a micro-atomized fine oil spray and a smooth, drip-free pour. Engineered with high-grade borosilicate glass, an ergonomic pressurized pump, and dual flow control for healthier, smarter everyday cooking.',
  price: 29.99,
  originalPrice: 49.99,
  discount: 40,
  stock: 135,
  specifications: {
    material: 'High Borosilicate Glass & Food-Grade BPA-Free PP',
    capacity: '470 ml (16 oz)',
    dimensions: '18.5 cm × 8.2 cm (7.3" × 3.2")',
    weight: '320g (empty)',
    packageContents:
      '1× KitchEase 2-in-1 Dispenser/Sprayer, 1× Long Bottle Cleaning Brush, 1× Silicone Basting Brush, 1× Instruction Manual',
  },
  features: [
    'Controlled Oil Dispensing (Smooth, drip-free pour for pans and sauteing)',
    'Fine Oil Spray (Instant micro-mist atomization for air fryers and salads)',
    'Easy Refilling (Generous wide-mouth carafe, zero funnel required)',
    'Reusable & Eco-Friendly Design (Eliminates single-use aerosol cans)',
    'Easy Cleaning (Disassembles in seconds, bottle brushes included)',
    'Kitchen Friendly & Heat-Resistant (Durable thermal shock-resistant glass)',
    'Compact Ergonomic Grip (Comfortable one-hand control lever)',
    'Multiple Cooking Uses (Air frying, roasting, baking, salads, searing, grilling)',
  ],
  images: initialImages,
};

const initialManual: UserManualData = {
  id: 'manual-01',
  title: 'KitchEase 2-in-1 Oil Dispenser & Sprayer Care & Instruction Guide',
  steps: [
    {
      stepNumber: 1,
      title: 'Open the Carafe',
      description:
        'Firmly grip the glass base and twist the top matte black cap counter-clockwise to unlock and remove the dispenser head.',
      image: '/images/hero.jpg',
    },
    {
      stepNumber: 2,
      title: 'Fill with Your Preferred Cooking Oil',
      description:
        'Pour up to 470ml of olive oil, avocado oil, sesame oil, or canola oil into the wide-mouth opening. Leave 1.5 cm of space at the top for optimal air pressure.',
      image: '/images/pour.jpg',
    },
    {
      stepNumber: 3,
      title: 'Close Securely',
      description:
        'Align the dispenser cap threads with the glass bottle and twist clockwise until firmly sealed. Ensure the silicone gasket sits flat to prevent leaks.',
      image: '/images/accessories.jpg',
    },
    {
      stepNumber: 4,
      title: 'Spray or Dispense with Ease',
      description:
        'For a fine, wide atomized mist, press the top lever briskly and fully down. For a smooth, steady stream pour, simply tilt the bottle over your pan.',
      image: '/images/spray.jpg',
    },
    {
      stepNumber: 5,
      title: 'Cleaning the Dispenser',
      description:
        'Fill the glass carafe with warm water and a drop of mild dish soap. Use the provided long-neck bottle brush. Pump soapy water through the nozzle 3-4 times, then rinse thoroughly.',
      image: '/images/accessories.jpg',
    },
    {
      stepNumber: 6,
      title: 'Storage Recommendations',
      description:
        'Store in a cool, dry cupboard or on your countertop away from direct stovetop flames or prolonged intense sun exposure.',
      image: '/images/kitchen.jpg',
    },
  ],
  dos: [
    'Use standard cooking oils (olive oil, canola, vegetable, avocado, sesame)',
    'Press the spray lever with quick, firm motion to achieve the finest atomization',
    'Clean the glass carafe and suction tube regularly to prevent oil buildup',
    'Ensure the silicone seal is seated flat when closing the dispenser',
    'Store upright on countertops, pantries, or dining tables',
  ],
  donts: [
    'Do not fill with viscous liquids containing solid particles, sediment, or sugar syrups',
    'Do not microwave or place over open direct flames or hot electric coils',
    'Do not force the pump lever if the nozzle is obstructed',
    'Do not use harsh abrasive steel wool pads on the glass or matte exterior',
    'Do not freeze liquids inside the glass bottle',
  ],
  cleaningInstructions: [
    'Disassemble the top pump lid from the glass bottle.',
    'Add warm water and a small drop of non-citrus dish detergent.',
    'Scrub the inside of the bottle with the included flexible bottle brush.',
    'Pump warm water through the spray mechanism 4-5 times to flush the internal valve.',
    'Rinse with fresh clear water and allow all components to air-dry completely before refilling.',
  ],
  careInstructions: [
    'Glass bottle is dishwasher safe on top rack (max 65°C / 150°F). Hand washing the pump head is recommended.',
    'If spray mist pattern becomes uneven over time, run warm water through the pump to clear oil residue.',
    'Avoid dropping onto hard tile surfaces.',
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'How does the KitchEase dual-action mechanism work?',
      answer:
        'The engineered pump head features two dedicated channels: an automatic gravity-assisted pour valve that opens when the bottle is tilted, and a high-pressure atomizing pump triggered by depressing the top lever for a fine, uniform mist.',
      category: 'Operation',
    },
    {
      id: 'faq-2',
      question: 'How do I get the finest mist instead of a stream?',
      answer:
        'A quick, decisive press of the lever creates maximum pneumatic pressure, atomizing the oil into a wide, uniform cloud. A slow, gentle press will produce a heavier droplet stream.',
      category: 'Operation',
    },
    {
      id: 'faq-3',
      question: 'What types of oils can I use in KitchEase?',
      answer:
        'KitchEase works with any pure cooking oil: extra virgin olive oil, avocado oil, peanut oil, canola, sunflower, and sesame oil. Do not use oils infused with herbs or garlic cloves that could clog the fine nozzle.',
      category: 'Usage',
    },
    {
      id: 'faq-4',
      question: 'How do I clean and unclog the spray nozzle?',
      answer:
        'Fill the reservoir halfway with warm water and a pump of liquid dish soap. Swirl and pump 5-8 times through the nozzle into the sink. Then flush with clean warm water. We also include a custom cleaning brush in every box.',
      category: 'Cleaning',
    },
    {
      id: 'faq-5',
      question: 'How long does shipping take?',
      answer:
        'Orders are processed within 24 hours. Domestic standard shipping takes 2-4 business days. Priority expedited shipping takes 1-2 business days. Tracking numbers are emailed immediately upon dispatch.',
      category: 'Shipping',
    },
    {
      id: 'faq-6',
      question: 'What is your return and warranty policy?',
      answer:
        'We offer a 30-day no-questions-asked money-back guarantee and a 1-year manufacturer warranty against defects. If you are not 100% delighted, our support team will replace or refund your order.',
      category: 'Policy',
    },
  ],
};

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    userName: 'Chef Julian Martinez',
    userEmail: 'julian.m@culinarydaily.com',
    rating: 5,
    title: 'Replaced all my aerosol spray cans instantly!',
    comment:
      'I use this every day for my air fryer and cast iron skillets. The mist is remarkably even without any chemical propellants. Being able to both pour and spray from one bottle is a kitchen game changer.',
    isApproved: true,
    createdAt: '2026-08-28T14:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    userName: 'Elena Rostova',
    userEmail: 'elena.r@lifestylehome.org',
    rating: 5,
    title: 'Gorgeous aesthetic and feels solid in the hand',
    comment:
      'The thick borosilicate glass and matte black handle look very high end on my kitchen island. It does not leak or drip oil down the sides when pouring like cheaper bottles always do.',
    isApproved: true,
    createdAt: '2026-08-31T09:15:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    userName: 'David Miller',
    userEmail: 'david.miller99@gmail.com',
    rating: 5,
    title: 'Cut my oil usage in half while eating healthier',
    comment:
      'A light spray coats an entire pan of roast vegetables or salmon with just 1-2 pumps. Very satisfied with the build quality and the included cleaning brush made washing effortless.',
    isApproved: true,
    createdAt: '2026-09-02T18:40:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-4',
    userName: 'Sophia Chen',
    userEmail: 'sophia.chen@foodiehub.net',
    rating: 5,
    title: 'The dual spray and pour feature works like magic',
    comment:
      'No need to unscrew or switch caps. When I need a tablespoon for sautéing, I just tilt and pour. When I need a quick spray on avocado toast or air fryer fries, I press the lever. Excellent product!',
    isApproved: true,
    createdAt: '2026-09-04T11:05:00Z',
    verifiedPurchase: true,
  },
];

const initialOrders: Order[] = [
  {
    id: 'ORD-98214',
    userId: 'user-customer-demo',
    productId: 'prod-kitchease-01',
    productName: 'KitchEase Oil Dispenser / Sprayer',
    productImage: '/images/hero.jpg',
    quantity: 2,
    unitPrice: 29.99,
    discount: 5.0,
    shipping: 0,
    total: 54.98,
    customerInformation: {
      fullName: 'Sarah Cooks',
      email: 'sarah.cooks@example.com',
      phone: '+1 (555) 234-8890',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
    },
    status: 'Shipped',
    createdAt: '2026-09-04T10:14:00Z',
    updatedAt: '2026-09-05T08:30:00Z',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-04T10:14:00Z', note: 'Order placed online' },
      { status: 'Confirmed', timestamp: '2026-09-04T10:18:00Z', note: 'Payment verified' },
      { status: 'Processing', timestamp: '2026-09-04T14:30:00Z', note: 'Package prepared and inspected' },
      { status: 'Shipped', timestamp: '2026-09-05T08:30:00Z', note: 'Dispatched via Express Courier. Tracking #KE-8849102' },
    ],
  },
  {
    id: 'ORD-98215',
    productId: 'prod-kitchease-01',
    productName: 'KitchEase Oil Dispenser / Sprayer',
    productImage: '/images/hero.jpg',
    quantity: 1,
    unitPrice: 29.99,
    discount: 0,
    shipping: 0,
    total: 29.99,
    customerInformation: {
      fullName: 'Marcus Vance',
      email: 'marcus.vance@techcorp.io',
      phone: '+1 (555) 891-2309',
      address: '1088 Harrison St Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
    },
    status: 'Processing',
    createdAt: '2026-09-05T14:22:00Z',
    updatedAt: '2026-09-05T15:00:00Z',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-05T14:22:00Z', note: 'Order received' },
      { status: 'Confirmed', timestamp: '2026-09-05T14:25:00Z', note: 'Payment approved' },
      { status: 'Processing', timestamp: '2026-09-05T15:00:00Z', note: 'Sent to packing facility' },
    ],
  },
  {
    id: 'ORD-98216',
    productId: 'prod-kitchease-01',
    productName: 'KitchEase Oil Dispenser / Sprayer',
    productImage: '/images/hero.jpg',
    quantity: 3,
    unitPrice: 29.99,
    discount: 10.0,
    shipping: 0,
    total: 79.97,
    customerInformation: {
      fullName: 'Jennifer Lin',
      email: 'jennifer.lin@bistrochef.com',
      phone: '+1 (555) 441-9012',
      address: '220 Mercer Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10012',
    },
    status: 'Delivered',
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-04T16:45:00Z',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-02T11:00:00Z', note: 'Order placed' },
      { status: 'Confirmed', timestamp: '2026-09-02T11:05:00Z', note: 'Order confirmed' },
      { status: 'Processing', timestamp: '2026-09-02T15:00:00Z', note: 'Packed at distribution center' },
      { status: 'Shipped', timestamp: '2026-09-03T09:00:00Z', note: 'Shipped via FedEx Priority' },
      { status: 'Delivered', timestamp: '2026-09-04T16:45:00Z', note: 'Handed directly to resident' },
    ],
  },
  {
    id: 'ORD-98217',
    productId: 'prod-kitchease-01',
    productName: 'KitchEase Oil Dispenser / Sprayer',
    productImage: '/images/hero.jpg',
    quantity: 1,
    unitPrice: 29.99,
    discount: 0,
    shipping: 0,
    total: 29.99,
    customerInformation: {
      fullName: 'Robert Gable',
      email: 'robert.gable@yahoo.com',
      phone: '+1 (555) 782-9901',
      address: '405 Pine Valley Way',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
    },
    status: 'Pending',
    createdAt: '2026-09-06T01:30:00Z',
    updatedAt: '2026-09-06T01:30:00Z',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-06T01:30:00Z', note: 'Order created, awaiting confirmation' },
    ],
  },
];

const initialSiteSettings: SiteSettings = {
  announcement: '✨ Limited Time Offer: 40% OFF + FREE Worldwide Shipping Today Only!',
  supportEmail: 'support@kitchease.com',
  supportPhone: '+1 (800) 548-2432',
  freeShippingThreshold: 0,
  currencySymbol: '$',
  allowGuestCheckout: true,
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
      // Ignore if directory creation fails in restricted environments
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db.json, reinitializing default data', err);
        this.data = this.getDefaultData();
        this.save();
      }
    } else if (isServerless && fs.existsSync(SEED_FILE)) {
      try {
        const raw = fs.readFileSync(SEED_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.save();
      } catch {
        this.data = this.getDefaultData();
        this.save();
      }
    } else {
      this.data = this.getDefaultData();
      this.save();
    }
  }

  private getDefaultData(): DatabaseSchema {
    const adminPass = hashPassword('admin123');
    const customerPass = hashPassword('customer123');

    const adminUser: User & { passwordHash: string; salt: string } = {
      id: 'user-admin-owner',
      name: 'KitchEase Store Owner',
      email: 'admin@kitchease.com',
      phone: '+1 (800) 548-2432',
      role: 'ADMIN',
      createdAt: '2026-08-01T00:00:00Z',
      passwordHash: adminPass.hash,
      salt: adminPass.salt,
    };

    const customerUser: User & { passwordHash: string; salt: string } = {
      id: 'user-customer-demo',
      name: 'Sarah Cooks',
      email: 'sarah.cooks@example.com',
      phone: '+1 (555) 234-8890',
      role: 'CUSTOMER',
      createdAt: '2026-08-15T00:00:00Z',
      addresses: [
        {
          id: 'addr-1',
          fullName: 'Sarah Cooks',
          phone: '+1 (555) 234-8890',
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62704',
          isDefault: true,
        },
      ],
      wishlist: ['prod-kitchease-01'],
      passwordHash: customerPass.hash,
      salt: customerPass.salt,
    };

    return {
      users: [adminUser, customerUser],
      product: initialProduct,
      orders: initialOrders,
      reviews: initialReviews,
      manual: initialManual,
      siteSettings: initialSiteSettings,
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  getAllUsers() {
    return this.data.users.map(({ passwordHash, salt, ...u }) => u);
  }

  createUser(name: string, email: string, password: string, role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER', phone?: string) {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const { hash, salt } = hashPassword(password);
    const newUser: User & { passwordHash: string; salt: string } = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role,
      createdAt: new Date().toISOString(),
      addresses: [],
      wishlist: [],
      passwordHash: hash,
      salt,
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, salt: _, ...safeUser } = newUser;
    return safeUser;
  }

  updateUserProfile(userId: string, updates: Partial<User>) {
    const index = this.data.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      id: userId,
    };
    this.save();
    const { passwordHash, salt, ...safeUser } = this.data.users[index];
    return safeUser;
  }

  addUserAddress(userId: string, address: Omit<import('../src/types.js').UserAddress, 'id'>) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    const newAddr: import('../src/types.js').UserAddress = {
      ...address,
      id: `addr-${crypto.randomUUID().slice(0, 8)}`,
    };
    if (!user.addresses) user.addresses = [];
    if (newAddr.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(newAddr);
    this.save();
    return newAddr;
  }

  deleteUserAddress(userId: string, addressId: string) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user || !user.addresses) return false;
    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    this.save();
    return true;
  }

  authenticate(email: string, password: string) {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const valid = verifyPassword(password, user.passwordHash, user.salt);
    if (!valid) return null;
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  // Product
  getProduct(): Product {
    return this.data.product;
  }

  updateProduct(updates: Partial<Product>): Product {
    this.data.product = {
      ...this.data.product,
      ...updates,
      id: this.data.product.id,
    };
    this.save();
    return this.data.product;
  }

  // Images
  getImages(): ProductImage[] {
    return this.data.product.images.sort((a, b) => a.order - b.order);
  }

  addImage(img: Omit<ProductImage, 'id'>): ProductImage {
    const newImg: ProductImage = {
      ...img,
      id: `img-${crypto.randomUUID().slice(0, 8)}`,
      order: img.order || this.data.product.images.length + 1,
    };
    if (newImg.isMain) {
      this.data.product.images.forEach((i) => (i.isMain = false));
    }
    this.data.product.images.push(newImg);
    this.save();
    return newImg;
  }

  updateImage(id: string, updates: Partial<ProductImage>) {
    const img = this.data.product.images.find((i) => i.id === id);
    if (!img) return null;
    if (updates.isMain) {
      this.data.product.images.forEach((i) => (i.isMain = false));
    }
    Object.assign(img, updates);
    this.save();
    return img;
  }

  reorderImages(orderedIds: string[]) {
    orderedIds.forEach((id, index) => {
      const img = this.data.product.images.find((i) => i.id === id);
      if (img) img.order = index + 1;
    });
    this.save();
    return this.getImages();
  }

  deleteImage(id: string) {
    this.data.product.images = this.data.product.images.filter((i) => i.id !== id);
    if (this.data.product.images.length > 0 && !this.data.product.images.some((i) => i.isMain)) {
      this.data.product.images[0].isMain = true;
    }
    this.save();
    return true;
  }

  replaceAllImages(newImages: ProductImage[]) {
    this.data.product.images = newImages;
    this.save();
    return this.getImages();
  }

  // Orders
  getAllOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrdersByUser(userId: string): Order[] {
    return this.getAllOrders().filter((o) => o.userId === userId);
  }

  getOrderById(id: string): Order | null {
    return this.data.orders.find((o) => o.id === id) || null;
  }

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): Order {
    const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Order successfully placed by customer',
        },
      ],
    };

    // Deduct stock safely
    if (this.data.product.stock >= newOrder.quantity) {
      this.data.product.stock -= newOrder.quantity;
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const now = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = now;
    order.timeline.push({
      status: newStatus,
      timestamp: now,
      note: note || `Order status updated to ${newStatus}`,
    });

    this.save();
    return order;
  }

  // Reviews
  getApprovedReviews(): Review[] {
    return this.data.reviews
      .filter((r) => r.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllReviews(): Review[] {
    return [...this.data.reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createReview(rev: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
    const newRev: Review = {
      ...rev,
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      isApproved: true, // auto approve or allow admin moderation
    };
    this.data.reviews.unshift(newRev);
    this.save();
    return newRev;
  }

  updateReviewStatus(id: string, isApproved: boolean) {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return null;
    rev.isApproved = isApproved;
    this.save();
    return rev;
  }

  deleteReview(id: string) {
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    this.save();
    return true;
  }

  // Manual
  getManual(): UserManualData {
    return this.data.manual;
  }

  updateManual(updates: Partial<UserManualData>): UserManualData {
    this.data.manual = {
      ...this.data.manual,
      ...updates,
      id: this.data.manual.id,
    };
    this.save();
    return this.data.manual;
  }

  // Settings
  getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...updates,
    };
    this.save();
    return this.data.siteSettings;
  }

  // Stats
  getDashboardStats(): DashboardStats {
    const orders = this.data.orders;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const totalOrders = orders.length;
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const processingOrders = orders.filter((o) => o.status === 'Processing').length;
    const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;

    // Last 7 days orders and revenue aggregation
    const daysMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      daysMap.set(ds, { orders: 0, revenue: 0 });
    }

    orders.forEach((o) => {
      const dateStr = o.createdAt.slice(0, 10);
      if (daysMap.has(dateStr)) {
        const item = daysMap.get(dateStr)!;
        item.orders += 1;
        if (o.status !== 'Cancelled') {
          item.revenue += o.total;
        }
      }
    });

    const ordersOverTime = Array.from(daysMap.entries()).map(([date, val]) => ({
      date: date.slice(5), // MM-DD
      orders: val.orders,
      revenue: Math.round(val.revenue * 100) / 100,
    }));

    const statusDistribution: { status: OrderStatus; count: number }[] = [
      { status: 'Pending', count: pendingOrders },
      { status: 'Confirmed', count: orders.filter((o) => o.status === 'Confirmed').length },
      { status: 'Processing', count: processingOrders },
      { status: 'Shipped', count: shippedOrders },
      { status: 'Delivered', count: deliveredOrders },
      { status: 'Cancelled', count: cancelledOrders },
    ];

    return {
      totalOrders,
      todayOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      currentStock: this.data.product.stock,
      ordersOverTime,
      statusDistribution,
    };
  }
}

export const db = new Database();
