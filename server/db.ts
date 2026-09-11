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
  CustomerInformation,
  PaymentSummary,
  AuditLogItem,
  SettlementStatusType,
  ShipmentStatusType,
} from '../src/types.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string; salt: string })[];
  product: Product;
  orders: Order[];
  reviews: Review[];
  manual: UserManualData;
  siteSettings: SiteSettings;
  auditLogs?: AuditLogItem[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? '/tmp/kitchease-data' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.resolve(process.cwd(), 'data', 'db.json');

function hashPassword(password: string, salt?: string, iterations = 100000) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, iterations, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

function verifyPassword(password: string, hash: string, salt: string) {
  // Check standard 100,000 iterations
  const hash100k = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  try {
    if (crypto.timingSafeEqual(Buffer.from(hash100k, 'hex'), Buffer.from(hash, 'hex'))) {
      return true;
    }
  } catch {
    // Proceed to fallback
  }

  // Fallback check for legacy 1,000 iterations
  const hash1k = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash1k, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
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
  {
    id: 'img-6',
    url: '/images/oil_spray_action_1788685889614.jpg',
    caption: 'Pneumatic Atomizing Mist - Broad, even coverage for cooking surfaces',
    alt: 'Spraying fine mist of cooking oil onto cooking pan',
    order: 6,
    isMain: false,
  },
  {
    id: 'img-7',
    url: '/images/oil_pour_action_1788685906571.jpg',
    caption: 'Precision Controlled Pour - Clean flow for sauteing and dressings',
    alt: 'Pouring cooking oil into pan smoothly without drips',
    order: 7,
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
      question: 'What is KitchEase?',
      answer:
        'KitchEase is an authentic 2-in-1 kitchen oil bottle designed for both controlled pouring and fine atomized spraying. Made with high-grade thermal borosilicate glass and food-safe BPA-free materials, it helps you cook with better oil control and zero chemical propellants.',
      category: 'About',
    },
    {
      id: 'faq-2',
      question: 'How does the spray function work?',
      answer:
        'A firm, decisive press of the top ergonomic lever pressurizes the mechanical pump chamber to create a wide, ultra-fine mist. It requires no batteries and no chemical aerosol propellants, making it ideal for air fryers, roasting vegetables, and coating skillets.',
      category: 'Operation',
    },
    {
      id: 'faq-3',
      question: 'How does the pouring function work?',
      answer:
        'Simply tilt the bottle over your pan or bowl. The gravity-assisted pour valve automatically opens to release a smooth, measured drizzle. The anti-drip rim prevents oily runs down the side of the carafe.',
      category: 'Operation',
    },
    {
      id: 'faq-4',
      question: 'What type of oil can I use?',
      answer:
        'KitchEase works seamlessly with any standard cooking oil, including olive oil, avocado oil, canola, vegetable, sesame, and sunflower oil. Avoid viscous liquids with heavy sediment or whole herb particles that could obstruct the fine nozzle.',
      category: 'Usage',
    },
    {
      id: 'faq-5',
      question: 'How do I clean it?',
      answer:
        'All components twist apart in seconds. For regular maintenance, add warm water and a drop of dish soap to the glass bottle, use the included flexible bottle brush, and pump warm soapy water through the nozzle 4–5 times to flush the valve. Rinse thoroughly with clear water and air dry.',
      category: 'Cleaning',
    },
    {
      id: 'faq-6',
      question: 'How do I place an order?',
      answer:
        'Click "BUY NOW" anywhere on the website, select your desired quantity, enter your delivery address and contact details on our simple checkout form, and confirm your order. You will receive an instant order receipt and tracking link.',
      category: 'Ordering',
    },
    {
      id: 'faq-7',
      question: 'How long does delivery take?',
      answer:
        'Orders are processed within 24 hours. Standard domestic shipping takes 2 to 4 business days with direct tracking. We offer free shipping on all orders.',
      category: 'Shipping',
    },
    {
      id: 'faq-8',
      question: 'What is your return/refund policy?',
      answer:
        'We offer a 30-day no-hassle money-back guarantee and a 1-year manufacturer warranty. If you are not completely satisfied with your KitchEase bottle, contact our support team at support@kitchease.com for an immediate replacement or refund.',
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

export const defaultPrivacyPolicy = `KitchEase Privacy Policy & Customer Data Protection

Last Updated: September 2026

At KitchEase, we respect and safeguard the private personal information of every customer who purchases our 2-in-1 kitchen oil dispenser and sprayer. This Privacy Policy details how customer information is collected, processed, and protected under strict privacy safeguards.

1. Information We Collect
When placing an order on KitchEase, we only collect the essential information required to process fulfillment and dispatch delivery:
• Recipient Full Name
• Delivery Street Address, City, State, and Postal Code / Pincode
• Contact Phone Number (used exclusively for courier delivery coordination and SMS delivery updates)
• Email Address (used exclusively for sending order receipts and live tracking links)

We do NOT collect, process, or store payment card numbers, CVVs, net banking credentials, or government identification numbers.

2. Purpose and Use of Customer Data
Your personal data is used solely for legitimate order fulfillment purposes:
• Processing and assembling your KitchEase order
• Generating accurate courier shipping labels and manifests
• Transmitting automated dispatch notifications and tracking updates
• Providing customer service assistance, returns, or warranty replacements (1-year manufacturer warranty)

3. Strict Address & Phone Privacy Safeguards
• Zero Public Address Exposure: Customer delivery addresses and phone numbers are strictly confidential and are never published or made searchable to the public or other customers.
• Masked Order Tracking: Public self-service tracking requires dual verification (Order ID and customer email address). To prevent reconnaissance, delivery street addresses and contact phone numbers are automatically masked on tracking screens.
• Role-Based Access Control: Full delivery addresses can only be accessed by authenticated and authorized store administrators for order fulfillment.

4. Third-Party Disclosures
We never sell, rent, monetize, or trade your personal information with advertising brokers or data aggregators. Customer shipping data is disclosed strictly to:
• Licensed domestic logistics and courier delivery partners solely for completing door-to-door physical parcel delivery.
• Transaction notification service providers for sending delivery milestone alerts.

5. Data Retention & Customer Rights
Order records are retained securely in encrypted storage for warranty verification and transaction accounting. You have the right to request access to, correction of, or deletion of your personal data at any time.

6. Contact Our Privacy Officer
For any privacy inquiries, data deletion requests, or questions regarding our security protocols, please contact our support team at privacy@kitchease.com or support@kitchease.com.`;

const initialSiteSettings: SiteSettings = {
  announcement: '✨ Limited Time Offer: 40% OFF + FREE Worldwide Shipping Today Only!',
  supportEmail: 'support@kitchease.com',
  supportPhone: '+1 (800) 548-2432',
  freeShippingThreshold: 0,
  currencySymbol: '$',
  allowGuestCheckout: true,
  privacyPolicy: defaultPrivacyPolicy,
};

export function maskCustomerInformation(info: CustomerInformation): CustomerInformation {
  if (!info) {
    return {
      fullName: 'Customer',
      email: '***@kitchease.com',
      phone: '***',
      address: '*** (Street Address Hidden for Customer Privacy)',
      city: '',
      state: '',
      postalCode: '***',
    };
  }

  const nameParts = (info.fullName || 'Customer').trim().split(' ');
  const maskedName = nameParts
    .map((p) => (p.length > 1 ? p[0] + '*'.repeat(Math.min(3, p.length - 1)) : p))
    .join(' ');

  const emailParts = (info.email || '').split('@');
  const userPart = emailParts[0] || '';
  const domainPart = emailParts[1] || 'customer.com';
  const maskedEmail =
    userPart.length > 2
      ? userPart[0] + '***' + userPart[userPart.length - 1] + '@' + domainPart
      : '***@' + domainPart;

  const rawPhone = (info.phone || '').trim();
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const last4 = digitsOnly.slice(-4);
  const maskedPhone = digitsOnly.length >= 4 ? `+1 (***) ***-${last4}` : '***';

  const rawZip = (info.postalCode || '').trim();
  const maskedZip = rawZip.length > 2 ? rawZip.slice(0, 2) + '***' : '***';

  return {
    fullName: maskedName,
    email: maskedEmail,
    phone: maskedPhone,
    address: '*** (Street Address Hidden for Customer Privacy)',
    city: info.city,
    state: info.state,
    postalCode: maskedZip,
  };
}

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

    // Security Migration & Integrity Check: Ensure store owner initial password and privacy policy exist
    let modified = false;
    const adminUser = this.data.users.find((u) => u.role === 'ADMIN');
    if (adminUser) {
      if (adminUser.mustChangePassword === undefined) {
        const initialPass = hashPassword('9297348');
        adminUser.passwordHash = initialPass.hash;
        adminUser.salt = initialPass.salt;
        adminUser.mustChangePassword = true;
        modified = true;
      }
    } else {
      // Seed admin if missing
      const initialPass = hashPassword('9297348');
      this.data.users.unshift({
        id: 'user-admin-owner',
        name: 'KitchEase Store Owner',
        email: 'admin@kitchease.com',
        phone: '+1 (800) 548-2432',
        role: 'ADMIN',
        createdAt: '2026-08-01T00:00:00Z',
        passwordHash: initialPass.hash,
        salt: initialPass.salt,
        mustChangePassword: true,
      });
      modified = true;
    }

    if (!this.data.siteSettings.privacyPolicy) {
      this.data.siteSettings.privacyPolicy = defaultPrivacyPolicy;
      modified = true;
    }

    if (!Array.isArray(this.data.auditLogs)) {
      this.data.auditLogs = [];
      modified = true;
    }

    // Ensure all existing orders have proper COD / Settlement / OrderId structure
    for (const ord of this.data.orders) {
      if (!ord.orderId) {
        ord.orderId = ord.id;
        modified = true;
      }
      const isCod = !ord.paymentMethod || ord.paymentMethod.toUpperCase().includes('COD') || ord.paymentMethod.toUpperCase().includes('CASH');
      if (!ord.paymentMethod) {
        ord.paymentMethod = isCod ? 'COD' : 'ONLINE';
        modified = true;
      }
      if (!ord.paymentStatus) {
        ord.paymentStatus = isCod ? 'COD_PENDING' : 'PAID';
        modified = true;
      }
      if (!ord.settlementStatus) {
        ord.settlementStatus = isCod ? (ord.paymentStatus === 'PAID' ? 'SETTLED' : 'PENDING') : 'NOT_APPLICABLE';
        modified = true;
      }
      if (!ord.paymentAmount) {
        ord.paymentAmount = ord.totalAmount ?? ord.total;
        modified = true;
      }
    }

    if (modified) {
      this.save();
    }
  }

  private getDefaultData(): DatabaseSchema {
    const adminPass = hashPassword('9297348');
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
      mustChangePassword: true,
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
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    if (clean === 'anex9297348@gmail.com' || clean === 'admin' || clean === 'owner') {
      return this.data.users.find((u) => u.role === 'ADMIN') || null;
    }
    return this.data.users.find((u) => u.email.toLowerCase() === clean) || null;
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
      mustChangePassword: role === 'ADMIN',
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

  changeAdminPassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
    const userIndex = this.data.users.findIndex((u) => u.id === userId && u.role === 'ADMIN');
    if (userIndex === -1) {
      return { success: false, error: 'Administrator user account not found.' };
    }
    const user = this.data.users[userIndex];
    const isCurrentValid = verifyPassword(currentPass, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect. Please re-enter your current password.' };
    }

    const cleanNewPass = (newPass || '').trim();
    if (cleanNewPass.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }
    if (cleanNewPass === '9297348') {
      return { success: false, error: 'New password cannot be the temporary initial setup password (9297348).' };
    }
    if (cleanNewPass === currentPass) {
      return { success: false, error: 'New password must be different from your existing password.' };
    }

    const { hash, salt } = hashPassword(cleanNewPass);
    user.passwordHash = hash;
    user.salt = salt;
    user.mustChangePassword = false;
    this.save();

    return { success: true };
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
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    return (
      this.data.orders.find(
        (o) =>
          (o.id && o.id.toLowerCase() === cleanId) ||
          (o.orderId && o.orderId.toLowerCase() === cleanId)
      ) || null
    );
  }

  private generateUniqueOrderId(): string {
    const year = new Date().getFullYear();
    let maxSeq = 0;
    for (const ord of this.data.orders) {
      const target = ord.orderId || ord.id || '';
      const match = target.match(/KE-\d{4}-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }

    let nextSeq = Math.max(maxSeq + 1, this.data.orders.length + 1, 101);
    let candidate = '';
    do {
      const padded = String(nextSeq).padStart(6, '0');
      candidate = `KE-${year}-${padded}`;
      nextSeq++;
    } while (
      this.data.orders.some(
        (o) =>
          (o.id && o.id.toUpperCase() === candidate.toUpperCase()) ||
          (o.orderId && o.orderId.toUpperCase() === candidate.toUpperCase())
      )
    );

    return candidate;
  }

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): Order {
    const id = this.generateUniqueOrderId();
    const now = new Date().toISOString();
    const cust = orderData.customerInformation;
    const initialStatus = orderData.orderStatus || orderData.status || 'ORDER RECEIVED';
    const subtotal = orderData.subtotal ?? Math.round(orderData.unitPrice * orderData.quantity * 100) / 100;
    const deliveryCharge = orderData.deliveryCharge ?? orderData.shipping ?? 0;
    const total = orderData.total ?? Math.round((subtotal - (orderData.discount || 0) + deliveryCharge) * 100) / 100;
    
    const isCOD = !orderData.paymentMethod ||
      orderData.paymentMethod.toUpperCase().includes('COD') ||
      orderData.paymentMethod.toUpperCase().includes('CASH');

    const paymentMethod = isCOD ? 'COD' : 'ONLINE';
    const paymentStatus = isCOD ? 'COD_PENDING' : 'PAID';
    const settlementStatus = isCOD ? 'PENDING' : 'NOT_APPLICABLE';

    const newOrder: Order = {
      ...orderData,
      id,
      orderId: id,
      productId: orderData.productId,
      productName: orderData.productName,
      productImage: orderData.productImage,
      quantity: orderData.quantity,
      unitPrice: orderData.unitPrice,
      subtotal,
      discount: orderData.discount || 0,
      shipping: deliveryCharge,
      deliveryCharge,
      total,
      totalAmount: total,
      paymentAmount: total,
      paymentMethod,
      paymentStatus,
      settlementStatus,
      shipmentStatus: 'READY_TO_SHIP',
      customerName: cust.fullName,
      phone: cust.phone,
      address: cust.address,
      city: cust.city,
      state: cust.state,
      pincode: cust.postalCode,
      customerInformation: cust,
      status: initialStatus,
      orderStatus: initialStatus,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: initialStatus,
          timestamp: now,
          note: isCOD
            ? 'Order placed with Cash on Delivery (COD). Awaiting doorstep collection.'
            : 'Order placed and paid online.',
          actor: 'Customer Checkout',
        },
      ],
    };

    // Deduct stock safely
    if (this.data.product.stock >= newOrder.quantity) {
      this.data.product.stock -= newOrder.quantity;
    }

    this.data.orders.unshift(newOrder);
    this.recordAuditLog('Order created', id, orderData.userId || 'guest', cust.fullName, {
      paymentMethod,
      paymentStatus,
      total,
    });
    this.save();
    return newOrder;
  }

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    adminUserId = 'user-admin-owner',
    adminUserName = 'KitchEase Store Owner'
  ): Order | null {
    const cleanId = (orderId || '').trim().toLowerCase();
    const order = this.data.orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.orderId && o.orderId.toLowerCase() === cleanId)
    );
    if (!order) return null;

    const previousStatus = order.status;
    const now = new Date().toISOString();
    order.status = newStatus;
    order.orderStatus = newStatus;
    order.updatedAt = now;

    const upper = String(newStatus).toUpperCase();
    if (upper === 'SHIPPED') {
      order.shipmentStatus = 'SHIPPED';
      if (!order.shippedAt) order.shippedAt = now;
    } else if (upper === 'OUT FOR DELIVERY') {
      order.shipmentStatus = 'OUT_FOR_DELIVERY';
    } else if (upper === 'DELIVERED') {
      order.shipmentStatus = 'DELIVERED';
      if (!order.deliveredAt) order.deliveredAt = now;
      // Note: Delivered does NOT automatically mark COD as settled or paid to merchant!
    } else if (upper === 'CANCELLED') {
      order.paymentStatus = 'CANCELLED';
      if (order.settlementStatus === 'PENDING') {
        order.settlementStatus = 'NOT_APPLICABLE';
      }
    }

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: newStatus,
      timestamp: now,
      note: note || `Order status updated to ${newStatus}`,
      actor: adminUserName,
    });

    this.recordAuditLog('Order status changed', order.id, adminUserId, adminUserName, {
      from: previousStatus,
      to: newStatus,
      note,
    });

    this.save();
    return order;
  }

  recordCODCollection(
    orderId: string,
    adminUserId = 'user-admin-owner',
    adminUserName = 'KitchEase Store Owner'
  ): { success: boolean; order?: Order; error?: string } {
    const cleanId = (orderId || '').trim().toLowerCase();
    const order = this.data.orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.orderId && o.orderId.toLowerCase() === cleanId)
    );

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const isCod = order.paymentMethod?.toUpperCase().includes('COD') || order.paymentMethod?.toUpperCase().includes('CASH');
    if (!isCod) {
      return { success: false, error: 'This is not a Cash on Delivery order.' };
    }

    if (order.status.toUpperCase() === 'CANCELLED') {
      return { success: false, error: 'Cannot record payment collection on a cancelled order.' };
    }

    if (order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'PAID') {
      return { success: false, error: 'COD collection has already been recorded for this order.' };
    }

    const now = new Date().toISOString();
    order.paymentStatus = 'COD_COLLECTED';
    order.paymentCollectedAt = now;
    order.paymentCollectedBy = adminUserName;
    if (order.settlementStatus !== 'SETTLED') {
      order.settlementStatus = 'PENDING';
    }
    order.updatedAt = now;

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: order.status,
      timestamp: now,
      note: `COD collection recorded: Customer paid $${(order.totalAmount ?? order.total).toFixed(2)} to delivery partner.`,
      actor: adminUserName,
    });

    this.recordAuditLog('COD collection recorded', order.id, adminUserId, adminUserName, {
      amount: order.totalAmount ?? order.total,
      collectedAt: now,
    });

    this.save();
    return { success: true, order };
  }

  recordCODSettlement(
    orderId: string,
    data: {
      settlementAmount: number;
      settlementDate?: string;
      settlementReference: string;
      courierName?: string;
      notes?: string;
    },
    adminUserId = 'user-admin-owner',
    adminUserName = 'KitchEase Store Owner'
  ): { success: boolean; order?: Order; error?: string } {
    const cleanId = (orderId || '').trim().toLowerCase();
    const order = this.data.orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.orderId && o.orderId.toLowerCase() === cleanId)
    );

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const amt = Number(data.settlementAmount);
    if (isNaN(amt) || amt < 0) {
      return { success: false, error: 'Please enter a valid numeric settlement amount.' };
    }

    if (!data.settlementReference || !data.settlementReference.trim()) {
      return { success: false, error: 'Settlement reference or UTR transaction number is required.' };
    }

    const expected = order.totalAmount ?? order.total ?? 0;
    const diff = Math.round((amt - expected) * 100) / 100;
    const isExact = Math.abs(diff) < 0.01;

    const now = new Date().toISOString();
    order.settlementAmount = amt;
    order.settlementDate = data.settlementDate || now;
    order.settlementReference = data.settlementReference.trim();
    order.settlementNotes = data.notes ? data.notes.trim() : '';
    order.settlementRecordedBy = adminUserName;

    if (data.courierName && data.courierName.trim()) {
      order.courierName = data.courierName.trim();
    }

    if (isExact) {
      order.settlementStatus = 'SETTLED';
      order.paymentStatus = 'PAID';
    } else {
      // Discrepancy between expected COD collection and actual courier settlement
      order.settlementStatus = 'RECONCILIATION_REQUIRED';
    }

    order.updatedAt = now;

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: order.status,
      timestamp: now,
      note: isExact
        ? `Courier remittance settled: $${amt.toFixed(2)} received (Ref: ${order.settlementReference}).`
        : `Settlement recorded with discrepancy: Expected $${expected.toFixed(2)}, Courier remitted $${amt.toFixed(2)} (Diff: $${diff.toFixed(2)}). Status: RECONCILIATION_REQUIRED.`,
      actor: adminUserName,
    });

    this.recordAuditLog('Settlement recorded', order.id, adminUserId, adminUserName, {
      expectedAmount: expected,
      settledAmount: amt,
      difference: diff,
      reference: order.settlementReference,
      status: order.settlementStatus,
    });

    this.save();
    return { success: true, order };
  }

  updateCourierDetails(
    orderId: string,
    data: {
      courierName?: string;
      trackingNumber?: string;
      shipmentStatus?: string;
      shippingProvider?: string;
      estimatedDeliveryDate?: string;
      notes?: string;
    },
    adminUserId = 'user-admin-owner',
    adminUserName = 'KitchEase Store Owner'
  ): { success: boolean; order?: Order; error?: string } {
    const cleanId = (orderId || '').trim().toLowerCase();
    const order = this.data.orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === cleanId) ||
        (o.orderId && o.orderId.toLowerCase() === cleanId)
    );

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const now = new Date().toISOString();
    let changes: string[] = [];

    if (data.courierName !== undefined && data.courierName !== order.courierName) {
      changes.push(`Courier: ${data.courierName || 'None'}`);
      order.courierName = data.courierName ? data.courierName.trim() : undefined;
    }

    if (data.trackingNumber !== undefined && data.trackingNumber !== order.trackingNumber) {
      changes.push(`Tracking #: ${data.trackingNumber || 'None'}`);
      order.trackingNumber = data.trackingNumber ? data.trackingNumber.trim() : undefined;
    }

    if (data.shipmentStatus !== undefined && data.shipmentStatus !== order.shipmentStatus) {
      changes.push(`Shipment Status: ${data.shipmentStatus}`);
      order.shipmentStatus = data.shipmentStatus;
      if (data.shipmentStatus === 'SHIPPED') {
        order.status = 'SHIPPED';
        order.orderStatus = 'SHIPPED';
        if (!order.shippedAt) order.shippedAt = now;
      } else if (data.shipmentStatus === 'DELIVERED') {
        order.status = 'DELIVERED';
        order.orderStatus = 'DELIVERED';
        if (!order.deliveredAt) order.deliveredAt = now;
      }
    }

    if (data.estimatedDeliveryDate) {
      order.estimatedDeliveryDate = data.estimatedDeliveryDate;
    }

    if (data.shippingProvider) {
      order.shippingProvider = data.shippingProvider;
    }

    if (data.notes) {
      order.adminNotes = data.notes;
    }

    order.updatedAt = now;

    if (changes.length > 0) {
      if (!order.timeline) order.timeline = [];
      order.timeline.push({
        status: order.status,
        timestamp: now,
        note: `Fulfillment details updated: ${changes.join(', ')}`,
        actor: adminUserName,
      });

      this.recordAuditLog('Courier details updated', order.id, adminUserId, adminUserName, {
        changes,
        courier: order.courierName,
        trackingNumber: order.trackingNumber,
      });
    }

    this.save();
    return { success: true, order };
  }

  getPaymentSummary(): PaymentSummary {
    const orders = this.data.orders.filter((o) => o.status !== 'Cancelled');
    const isCod = (o: Order) =>
      o.paymentMethod?.toUpperCase().includes('COD') || o.paymentMethod?.toUpperCase().includes('CASH');

    const codOrders = orders.filter(isCod);
    const onlineOrders = orders.filter((o) => !isCod(o));

    // COD Pending Collection: COD orders not yet collected by courier
    const codPendingCollection = codOrders.filter(
      (o) => !o.paymentStatus || o.paymentStatus === 'COD_PENDING' || o.paymentStatus.includes('PENDING')
    );

    // COD Collected: courier has collected from customer (collected or settled)
    const codCollected = codOrders.filter(
      (o) => o.paymentStatus === 'COD_COLLECTED' || o.paymentStatus === 'PAID'
    );

    // Settlement Pending: Collected from customer, but courier has NOT yet remitted to merchant
    const codSettlementPending = codOrders.filter(
      (o) => o.paymentStatus === 'COD_COLLECTED' && (!o.settlementStatus || o.settlementStatus === 'PENDING')
    );

    // COD Settled: courier has remitted money to merchant
    const codSettled = codOrders.filter((o) => o.settlementStatus === 'SETTLED');

    // COD Reconciliation Required: Discrepancy between expected and remitted
    const codRecon = codOrders.filter((o) => o.settlementStatus === 'RECONCILIATION_REQUIRED');

    const sumTotal = (arr: Order[]) =>
      Math.round(arr.reduce((s, o) => s + (o.totalAmount ?? o.total ?? 0), 0) * 100) / 100;
    const sumSettled = (arr: Order[]) =>
      Math.round(arr.reduce((s, o) => s + (o.settlementAmount ?? o.totalAmount ?? o.total ?? 0), 0) * 100) / 100;

    return {
      totalCodOrders: codOrders.length,
      codPendingCollectionAmount: sumTotal(codPendingCollection),
      codPendingCollectionCount: codPendingCollection.length,
      codCollectedAmount: sumTotal(codCollected),
      codCollectedCount: codCollected.length,
      codSettlementPendingAmount: sumTotal(codSettlementPending),
      codSettlementPendingCount: codSettlementPending.length,
      codSettledAmount: sumSettled(codSettled),
      codSettledCount: codSettled.length,
      codReconciliationRequiredAmount: sumTotal(codRecon),
      codReconciliationRequiredCount: codRecon.length,
      totalOnlineOrders: onlineOrders.length,
      totalOnlineRevenue: sumTotal(onlineOrders),
    };
  }

  recordAuditLog(
    action: string,
    orderId: string,
    adminUserId: string,
    adminUserName?: string,
    details?: any
  ): void {
    if (!Array.isArray(this.data.auditLogs)) {
      this.data.auditLogs = [];
    }

    this.data.auditLogs.unshift({
      id: `audit-${crypto.randomUUID().slice(0, 8)}`,
      action,
      orderId,
      adminUserId,
      adminUserName,
      timestamp: new Date().toISOString(),
      details,
    });

    // Cap audit log length to latest 500 records
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
  }

  getAuditLogs(orderId?: string): AuditLogItem[] {
    const logs = Array.isArray(this.data.auditLogs) ? this.data.auditLogs : [];
    if (orderId) {
      const cleanId = orderId.trim().toLowerCase();
      return logs.filter((l) => l.orderId.toLowerCase() === cleanId);
    }
    return logs;
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

    const isPending = (s: string) => {
      const u = (s || '').toUpperCase();
      return u === 'PENDING' || u === 'ORDER RECEIVED' || u === 'NEW';
    };
    const isConfirmed = (s: string) => (s || '').toUpperCase() === 'CONFIRMED';
    const isProcessing = (s: string) => (s || '').toUpperCase() === 'PROCESSING';
    const isShipped = (s: string) => {
      const u = (s || '').toUpperCase();
      return u === 'SHIPPED' || u === 'OUT FOR DELIVERY';
    };
    const isDelivered = (s: string) => (s || '').toUpperCase() === 'DELIVERED';
    const isCancelled = (s: string) => (s || '').toUpperCase() === 'CANCELLED';

    const pendingOrders = orders.filter((o) => isPending(o.status)).length;
    const processingOrders = orders.filter((o) => isProcessing(o.status)).length;
    const shippedOrders = orders.filter((o) => isShipped(o.status)).length;
    const deliveredOrders = orders.filter((o) => isDelivered(o.status)).length;
    const cancelledOrders = orders.filter((o) => isCancelled(o.status)).length;

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
