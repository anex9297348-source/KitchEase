import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db, maskCustomerInformation, defaultPrivacyPolicy } from './db.ts';
import type { User, OrderStatus } from '../src/types.ts';

const app = express();
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'kitchease-ultra-secure-key-2026';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Strict Security Headers & Anti-Sniffing
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// CORS headers for serverless / cross-domain preview flexibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory rate limiter to prevent credential brute-force and scraping
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'client';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    const entry = rateLimitStore.get(String(key));
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(String(key), { count: 1, resetTime: now + windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
      });
    }
    next();
  };
}

const loginLimiter = createRateLimiter(15 * 60 * 1000, 8, 'Too many login attempts. Please wait 15 minutes before trying again.');
const orderLimiter = createRateLimiter(10 * 60 * 1000, 20, 'Order creation limit reached. Please try again shortly.');
const trackLimiter = createRateLimiter(10 * 60 * 1000, 25, 'Too many tracking requests. Please wait a few minutes.');

// Helper to sign a lightweight auth token with strict role-based expiration
function generateToken(user: User): string {
  // 4 hours for store admins, 24 hours for normal customers
  const durationMs = user.role === 'ADMIN' ? 1000 * 60 * 60 * 4 : 1000 * 60 * 60 * 24;
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    mustChangePassword: user.mustChangePassword,
    exp: Date.now() + durationMs,
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(str).digest('base64url');
  return `${str}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: 'ADMIN' | 'CUSTOMER'; name: string } | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Auth middlewares
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
  const user = db.getUserById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }
  req.user = user;
  next();
}

function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Store Owner Admin privileges required.' });
    }
    next();
  });
}

function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      const user = db.getUserById(payload.id);
      if (user) req.user = user;
    }
  }
  next();
}

// ----------------------------------------------------
// API ROUTER
// ----------------------------------------------------
const api = express.Router();

// Health check
api.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'KitchEase API', timestamp: new Date().toISOString() });
});

// 1. Auth routes (Customer & Admin)
api.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // PRIVACY ENFORCEMENT: Public registration is strictly restricted to CUSTOMER role
    const user = db.createUser(name.trim(), email.trim(), password, 'CUSTOMER', phone);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

api.post('/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = db.authenticate(email.trim(), password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = generateToken(user);
  res.json({ user, token });
});

// Dedicated Secure Admin Login with Brute-Force Rate Limiting
api.post('/admin/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Store Owner credentials are required.' });
  }
  const user = db.authenticate(email.trim(), password);
  if (!user || user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Invalid store owner credentials or unauthorized account.' });
  }
  const token = generateToken(user);
  res.json({ user, token });
});

// Admin Forced / Scheduled Password Update
api.post('/admin/change-password', adminMiddleware, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const result = db.changeAdminPassword(req.user!.id, currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to update administrator password.' });
  }

  const updatedUser = db.getUserById(req.user!.id);
  const token = generateToken(updatedUser!);
  res.json({
    success: true,
    message: 'Administrator password successfully updated.',
    user: updatedUser,
    token,
  });
});

// Privacy Policy Endpoint
api.get('/privacy-policy', (_req, res) => {
  const settings = db.getSiteSettings();
  res.json({ privacyPolicy: settings.privacyPolicy || defaultPrivacyPolicy });
});

api.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

api.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { name, phone } = req.body;
  const updated = db.updateUserProfile(req.user!.id, { name, phone });
  res.json({ user: updated });
});

api.post('/auth/address', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { fullName, phone, address, city, state, postalCode, isDefault } = req.body;
  if (!fullName || !address || !city || !state || !postalCode) {
    return res.status(400).json({ error: 'All address fields are required.' });
  }
  const newAddr = db.addUserAddress(req.user!.id, {
    fullName,
    phone,
    address,
    city,
    state,
    postalCode,
    isDefault,
  });
  res.status(201).json({ address: newAddr });
});

api.delete('/auth/address/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const success = db.deleteUserAddress(req.user!.id, req.params.id);
  res.json({ success });
});

// 2. Product Management
api.get('/product', (_req, res) => {
  res.json({ product: db.getProduct() });
});

api.put('/admin/product', adminMiddleware, (req, res) => {
  const updates = req.body;
  const updated = db.updateProduct(updates);
  res.json({ product: updated });
});

// 3. Image Management
api.get('/images', (_req, res) => {
  res.json({ images: db.getImages() });
});

api.post('/admin/images', adminMiddleware, (req, res) => {
  const { url, caption, alt, isMain, order } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Image URL or data is required.' });
  }
  const newImg = db.addImage({
    url,
    caption: caption || 'KitchEase Product Image',
    alt: alt || 'KitchEase Oil Dispenser & Sprayer',
    isMain: !!isMain,
    order: Number(order) || 99,
  });
  res.status(201).json({ image: newImg });
});

api.put('/admin/images/reorder', adminMiddleware, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds array is required.' });
  }
  const images = db.reorderImages(orderedIds);
  res.json({ images });
});

api.put('/admin/images/:id', adminMiddleware, (req, res) => {
  const updated = db.updateImage(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Image not found.' });
  res.json({ image: updated });
});

api.delete('/admin/images/:id', adminMiddleware, (req, res) => {
  db.deleteImage(req.params.id);
  res.json({ success: true });
});

api.post('/admin/upload-image', adminMiddleware, (req, res) => {
  try {
    const { base64Data, filename, targetSlot, caption, alt, isMain } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    const cleanBase64 = (base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data).trim();
    const buffer = Buffer.from(cleanBase64, 'base64');

    let resolvedFilename = '';
    let targetId = '';

    if (targetSlot) {
      const slotMap: Record<string, { file: string; id: string; defaultCaption: string }> = {
        hero: { file: 'hero.jpg', id: 'img-1', defaultCaption: 'KitchEase 2-in-1 Dispenser & Sprayer - Real Product Photo' },
        spray: { file: 'spray.jpg', id: 'img-2', defaultCaption: 'Micro-Fine Atomized Spray - Real Product Photo' },
        pour: { file: 'pour.jpg', id: 'img-3', defaultCaption: 'Controlled Drip-Free Pour - Real Product Photo' },
        accessories: { file: 'accessories.jpg', id: 'img-4', defaultCaption: 'Full Culinary Kit & Accessories - Real Product Photo' },
        kitchen: { file: 'kitchen.jpg', id: 'img-5', defaultCaption: 'Dual Functionality & Modern Design - Real Product Photo' },
      };

      const slotInfo = slotMap[targetSlot.toLowerCase()];
      if (slotInfo) {
        resolvedFilename = slotInfo.file;
        targetId = slotInfo.id;
      }
    }

    if (!resolvedFilename) {
      const ext = filename && filename.includes('.') ? path.extname(filename) : '.jpg';
      const safeBase = filename ? path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_') : `product-${Date.now()}`;
      resolvedFilename = `${safeBase}${ext}`;
    }

    let publicUrl = `/images/${resolvedFilename}?t=${Date.now()}`;

    // Attempt to write file to disk (succeeds in persistent container/local, falls back gracefully in serverless)
    try {
      const imagesDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const targetPath = path.join(imagesDir, resolvedFilename);
      fs.writeFileSync(targetPath, buffer);
    } catch (fsErr) {
      console.warn('File system write skipped (serverless environment), storing base64 payload in database:', fsErr);
      publicUrl = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${cleanBase64}`;
    }

    let resultImage;
    if (targetId) {
      resultImage = db.updateImage(targetId, {
        url: publicUrl,
        caption: caption || undefined,
        alt: alt || undefined,
      });
    }

    if (!resultImage) {
      const existing = db.getImages().find((img) => img.url.includes(resolvedFilename));
      if (existing) {
        resultImage = db.updateImage(existing.id, {
          url: publicUrl,
          caption: caption || existing.caption,
          alt: alt || existing.alt,
        });
      } else {
        resultImage = db.addImage({
          url: publicUrl,
          caption: caption || 'Real KitchEase Product Photo',
          alt: alt || 'Real KitchEase Oil Dispenser & Sprayer photograph',
          isMain: !!isMain,
          order: db.getImages().length + 1,
        });
      }
    }

    res.json({ success: true, image: resultImage, url: publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload image' });
  }
});

api.post('/admin/upload-batch-images', adminMiddleware, (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Array of images is required.' });
    }

    const slotNames = ['hero', 'spray', 'pour', 'accessories', 'kitchen'];

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      if (!item.base64Data) continue;

      const cleanBase64 = (item.base64Data.includes('base64,') ? item.base64Data.split('base64,')[1] : item.base64Data).trim();
      const buffer = Buffer.from(cleanBase64, 'base64');

      const slot = item.targetSlot || (i < slotNames.length ? slotNames[i] : `visual-${i + 1}`);
      const filename = `${slot}.jpg`;
      let publicUrl = `/images/${filename}?t=${Date.now()}`;

      try {
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        const targetPath = path.join(imagesDir, filename);
        fs.writeFileSync(targetPath, buffer);
      } catch (fsErr) {
        console.warn('Batch file write skipped (serverless environment), storing base64 payload:', fsErr);
        publicUrl = item.base64Data.startsWith('data:') ? item.base64Data : `data:image/jpeg;base64,${cleanBase64}`;
      }

      const targetId = `img-${i + 1}`;

      const updated = db.updateImage(targetId, {
        url: publicUrl,
        caption: item.caption || `Real Product Visual ${i + 1}`,
        alt: item.alt || 'Real KitchEase Product Photo',
      });

      if (!updated) {
        db.addImage({
          url: publicUrl,
          caption: item.caption || `Real Product Visual ${i + 1}`,
          alt: item.alt || 'Real KitchEase Product Photo',
          isMain: i === 0,
          order: i + 1,
        });
      }
    }

    res.json({ success: true, images: db.getImages() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process batch upload' });
  }
});

// 4. Orders
api.post('/orders', orderLimiter, optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { quantity, customerInformation, promoCode, paymentMethod } = req.body;
    const parsedQty = Math.floor(Number(quantity) || 0);
    if (parsedQty < 1 || parsedQty > 100) {
      return res.status(400).json({ error: 'Order quantity must be between 1 and 100 bottles.' });
    }

    if (!customerInformation) {
      return res.status(400).json({ error: 'Please enter your delivery details.' });
    }

    const fullName = (customerInformation.fullName || '').trim();
    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }

    const rawPhone = String(customerInformation.phone || '').trim();
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (!rawPhone || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    const houseBuilding = (customerInformation.houseBuilding || '').trim();
    const streetArea = (customerInformation.streetArea || '').trim();
    const providedAddress = (customerInformation.address || '').trim();
    const fullAddress = providedAddress || (houseBuilding && streetArea ? `${houseBuilding}, ${streetArea}` : houseBuilding || streetArea);

    if (!fullAddress || fullAddress.length < 5) {
      return res.status(400).json({ error: 'Please enter your complete delivery address.' });
    }

    const city = (customerInformation.city || '').trim();
    if (!city) {
      return res.status(400).json({ error: 'Please enter your city.' });
    }

    const state = (customerInformation.state || '').trim();
    if (!state) {
      return res.status(400).json({ error: 'Please enter your state.' });
    }

    const rawPincode = String(customerInformation.pincode || customerInformation.postalCode || '').trim();
    const cleanPincode = rawPincode.replace(/\s+/g, '');
    if (!cleanPincode || cleanPincode.length < 5 || cleanPincode.length > 10) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit pincode.' });
    }

    // SANITIZATION & SECURITY: Compute canonical prices strictly server-side (prevent price tampering)
    const product = db.getProduct();
    const unitPrice = product.price; // Server-authoritative unit price (e.g. 29.99)
    const subtotal = Math.round(unitPrice * parsedQty * 100) / 100;

    // Server-side volume discount rules
    let discount = 0;
    if (parsedQty >= 3) {
      discount = 10; // Bundle discount for 3+ units
    } else if (parsedQty === 2) {
      discount = 5; // Bundle discount for 2 units
    }

    // Optional verified coupon promo code
    if (promoCode && String(promoCode).trim().toUpperCase() === 'CHEF10') {
      discount = Math.max(discount, 5);
    } else if (promoCode && String(promoCode).trim().toUpperCase() === 'KITCHEN10') {
      discount = Math.max(discount, Math.round(subtotal * 0.1 * 100) / 100);
    }

    const deliveryCharge = 0; // Free Standard Tracked Shipping
    const total = Math.max(0, Math.round((subtotal - discount + deliveryCharge) * 100) / 100);

    const email = customerInformation.email && customerInformation.email.includes('@')
      ? customerInformation.email.trim().toLowerCase()
      : `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@orders.kitchease.com`;

    const sanitizedCustomerInfo = {
      fullName,
      email,
      phone: rawPhone,
      address: fullAddress,
      city,
      state,
      postalCode: cleanPincode,
    };

    const selectedPaymentMethod = (paymentMethod || 'CASH ON DELIVERY').toUpperCase().includes('ONLINE')
      ? 'ONLINE PAYMENT'
      : 'CASH ON DELIVERY';

    const initialPaymentStatus = selectedPaymentMethod === 'CASH ON DELIVERY'
      ? 'COD / PAYMENT PENDING'
      : 'PAYMENT PENDING';

    const order = db.createOrder({
      userId: req.user ? req.user.id : undefined,
      productId: product.id,
      productName: product.name,
      productImage: product.images.find((i) => i.isMain)?.url || product.images[0]?.url || '/images/hero.jpg',
      quantity: parsedQty,
      unitPrice,
      subtotal,
      discount,
      shipping: deliveryCharge,
      deliveryCharge,
      total,
      totalAmount: total,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: initialPaymentStatus,
      customerInformation: sanitizedCustomerInfo,
      status: 'ORDER RECEIVED',
      orderStatus: 'ORDER RECEIVED',
    });

    res.status(201).json({
      order: {
        id: order.id,
        orderId: order.id,
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        status: order.status,
        customerName: order.customerName,
        customerInformation: order.customerInformation,
        createdAt: order.createdAt,
      },
    });
  } catch (_err) {
    res.status(500).json({ error: "We couldn't place your order right now. Please try again." });
  }
});

// Customer: My Orders (Restricted to Authenticated Customer)
api.get('/orders/mine', authMiddleware, (req: AuthenticatedRequest, res) => {
  const orders = db.getOrdersByUser(req.user!.id);
  res.json({ orders });
});

// Track order by Order ID and Email or Phone (Public safe lookup with rate limiting and address masking)
api.post('/orders/track', trackLimiter, (req, res) => {
  try {
    const { orderId, email, phone } = req.body;
    const cleanId = String(orderId || '').trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';

    if (!cleanId) {
      return res.status(400).json({ error: 'Please provide your Order ID.' });
    }
    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        error: 'Please provide the email address or phone number used when placing the order.',
      });
    }

    const order = db.getOrderById(cleanId);
    if (!order) {
      return res.status(404).json({
        error: `No order found with ID "${cleanId}". Please verify your order confirmation.`,
      });
    }

    const orderEmail = (order.customerInformation?.email || '').trim().toLowerCase();
    const orderPhone = (order.customerInformation?.phone || '').replace(/\D/g, '');

    const emailMatches = cleanEmail && orderEmail === cleanEmail;
    const phoneMatches =
      cleanPhone &&
      cleanPhone.length >= 4 &&
      (orderPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhone));

    if (!emailMatches && !phoneMatches) {
      return res.status(403).json({
        error: 'The verification details entered do not match the customer record on this order.',
      });
    }

    // PRIVACY ENFORCEMENT: Mask street address and phone number to protect customer privacy
    const maskedInfo = maskCustomerInformation(order.customerInformation);
    const maskedOrder = {
      ...order,
      customerInformation: maskedInfo,
      customerName: maskedInfo.fullName,
      phone: maskedInfo.phone,
      address: maskedInfo.address,
      pincode: maskedInfo.postalCode,
    };

    res.json({ order: maskedOrder, maskedForPrivacy: true });
  } catch (_err) {
    res.status(500).json({ error: 'Failed to retrieve order tracking details.' });
  }
});

// Get single order (Strict Server Authorization)
api.get('/orders/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const cleanId = String(req.params.id || '').trim();
  const order = db.getOrderById(cleanId);
  if (!order) return res.status(404).json({ error: 'Order not found. Please verify the order ID.' });

  const queryEmail = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
  const queryPhone = req.query.phone ? String(req.query.phone).replace(/\D/g, '') : '';
  const orderEmail = (order.customerInformation?.email || '').trim().toLowerCase();
  const orderPhone = (order.customerInformation?.phone || '').replace(/\D/g, '');

  // 1. Full unmasked order access ONLY for authenticated Store Admins
  if (req.user?.role === 'ADMIN') {
    return res.json({ order });
  }

  // 2. Full order access for the logged-in customer who placed it
  if (req.user && order.userId && req.user.id === order.userId) {
    return res.json({ order });
  }

  // 3. Customer tracking with matching email/phone verification: returns MASKED customer details for privacy
  const matches =
    (queryEmail && queryEmail === orderEmail) ||
    (queryPhone && queryPhone.length >= 4 && (orderPhone.endsWith(queryPhone) || queryPhone.endsWith(orderPhone)));

  if (matches) {
    const maskedInfo = maskCustomerInformation(order.customerInformation);
    const maskedOrder = {
      ...order,
      customerInformation: maskedInfo,
      customerName: maskedInfo.fullName,
      phone: maskedInfo.phone,
      address: maskedInfo.address,
      pincode: maskedInfo.postalCode,
    };
    return res.json({ order: maskedOrder, maskedForPrivacy: true });
  }

  // 4. Any unauthorized attempt to view another customer's order is strictly rejected
  return res.status(403).json({
    error: 'Access denied. Viewing order details requires administrator login or order owner verification.',
  });
});

// Admin: View All Orders
api.get('/admin/orders', adminMiddleware, (req, res) => {
  const { status, search } = req.query;
  let orders = db.getAllOrders();

  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerInformation.fullName.toLowerCase().includes(q) ||
        o.customerInformation.email.toLowerCase().includes(q) ||
        o.customerInformation.phone.toLowerCase().includes(q) ||
        o.customerInformation.city.toLowerCase().includes(q)
    );
  }

  res.json({ orders });
});

// Admin: Update Order Status
api.put('/admin/orders/:id/status', adminMiddleware, (req, res) => {
  const { status, note } = req.body as { status: string; note?: string };
  const rawStatus = String(status || '').trim().toUpperCase();

  const normalizedMap: Record<string, string> = {
    'NEW': 'ORDER RECEIVED',
    'ORDER RECEIVED': 'ORDER RECEIVED',
    'PENDING': 'ORDER RECEIVED',
    'CONFIRMED': 'CONFIRMED',
    'PROCESSING': 'PROCESSING',
    'SHIPPED': 'SHIPPED',
    'OUT FOR DELIVERY': 'OUT FOR DELIVERY',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
  };

  const canonical = normalizedMap[rawStatus];
  if (!canonical) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  const updated = db.updateOrderStatus(req.params.id, canonical as OrderStatus, note);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json({ order: updated });
});

// Admin: Analytics & Stats
api.get('/admin/stats', adminMiddleware, (_req, res) => {
  res.json({ stats: db.getDashboardStats() });
});

// Admin: Customers List
api.get('/admin/customers', adminMiddleware, (_req, res) => {
  const users = db.getAllUsers();
  const orders = db.getAllOrders();

  const customerList = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id);
    const totalSpent = userOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      ...u,
      orderCount: userOrders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      lastOrderDate: userOrders[0]?.createdAt || null,
    };
  });

  res.json({ customers: customerList });
});

// 5. Reviews
api.get('/reviews', (_req, res) => {
  res.json({ reviews: db.getApprovedReviews() });
});

api.post('/reviews', (req, res) => {
  const { userName, userEmail, rating, title, comment, image } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ error: 'Name, rating (1-5), and review text are required.' });
  }
  const review = db.createReview({
    userName: userName.trim(),
    userEmail: userEmail ? userEmail.trim() : 'customer@kitchease.com',
    rating: Number(rating) || 5,
    title: title ? title.trim() : 'Great product!',
    comment: comment.trim(),
    verifiedPurchase: true,
    image,
  });
  res.status(201).json({ review });
});

api.get('/admin/reviews', adminMiddleware, (_req, res) => {
  res.json({ reviews: db.getAllReviews() });
});

api.put('/admin/reviews/:id/status', adminMiddleware, (req, res) => {
  const { isApproved } = req.body;
  const review = db.updateReviewStatus(req.params.id, !!isApproved);
  if (!review) return res.status(404).json({ error: 'Review not found.' });
  res.json({ review });
});

api.delete('/admin/reviews/:id', adminMiddleware, (req, res) => {
  db.deleteReview(req.params.id);
  res.json({ success: true });
});

// 6. User Manual & FAQ
api.get('/manual', (_req, res) => {
  res.json({ manual: db.getManual() });
});

api.put('/admin/manual', adminMiddleware, (req, res) => {
  const updated = db.updateManual(req.body);
  res.json({ manual: updated });
});

// 7. Site Settings
api.get('/settings', (_req, res) => {
  res.json({ settings: db.getSiteSettings() });
});

api.put('/admin/settings', adminMiddleware, (req, res) => {
  const updated = db.updateSiteSettings(req.body);
  res.json({ settings: updated });
});

// Mount the API router to handle both /api/* requests and /* requests (for Vercel serverless rewrites)
app.use('/api', api);
app.use(api);

export { app, api };
export default app;
