import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from './db.ts';
import type { User, OrderStatus } from '../src/types.ts';

const app = express();
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'kitchease-ultra-secure-key-2026';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers for serverless / cross-domain preview flexibility
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to sign a lightweight auth token
function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
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

// 1. Auth routes
api.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const user = db.createUser(name.trim(), email.trim(), password, assignedRole, phone);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

api.post('/auth/login', (req, res) => {
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

api.post('/admin/upload-image', optionalAuth, (req, res) => {
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

api.post('/admin/upload-batch-images', optionalAuth, (req, res) => {
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
api.post('/orders', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { quantity, customerInformation, discount } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Order quantity must be at least 1.' });
    }
    if (
      !customerInformation ||
      !customerInformation.fullName ||
      !customerInformation.email ||
      !customerInformation.address ||
      !customerInformation.city ||
      !customerInformation.state ||
      !customerInformation.postalCode
    ) {
      return res.status(400).json({ error: 'All shipping details are required.' });
    }

    const product = db.getProduct();
    const qty = Number(quantity);
    const unitPrice = product.price;
    const disc = Number(discount) || 0;
    const subtotal = unitPrice * qty;
    const shipping = 0; // free shipping promotion
    const total = Math.max(0, Math.round((subtotal - disc + shipping) * 100) / 100);

    const order = db.createOrder({
      userId: req.user ? req.user.id : undefined,
      productId: product.id,
      productName: product.name,
      productImage: product.images.find((i) => i.isMain)?.url || product.images[0]?.url || '/images/hero.jpg',
      quantity: qty,
      unitPrice,
      discount: disc,
      shipping,
      total,
      customerInformation,
      status: 'Pending',
    });

    res.status(201).json({ order });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Could not create order' });
  }
});

// Customer: My Orders
api.get('/orders/mine', authMiddleware, (req: AuthenticatedRequest, res) => {
  const orders = db.getOrdersByUser(req.user!.id);
  res.json({ orders });
});

// Get single order
api.get('/orders/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user?.role === 'ADMIN') {
    return res.json({ order });
  }
  if (order.userId && req.user?.id === order.userId) {
    return res.json({ order });
  }
  if (req.query.email && String(req.query.email).toLowerCase() === order.customerInformation.email.toLowerCase()) {
    return res.json({ order });
  }
  if (order.userId && req.user?.id !== order.userId) {
    return res.status(403).json({ error: 'Access denied to this order.' });
  }

  res.json({ order });
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
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const validStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status, note);
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
