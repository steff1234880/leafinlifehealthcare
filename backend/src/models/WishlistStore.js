import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * WishlistStore.js
 * Persistent file & memory fallback wishlist store supporting user-isolated wishlists.
 * Works seamlessly alongside Mongoose / MongoDB Wishlist model with disk persistence.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const WISHLIST_DATA_FILE = path.join(DATA_DIR, 'wishlist_store.json');

class WishlistStore {
  constructor() {
    this.wishlists = new Map(); // userId -> { userId, items: [], updatedAt }
    this.initPersistence();
  }

  initPersistence() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(WISHLIST_DATA_FILE)) {
        const raw = fs.readFileSync(WISHLIST_DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            this.wishlists.set(String(k), v);
          });
        }
      }
    } catch (err) {
      console.warn('Could not load wishlist persistence file:', err.message);
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const obj = {};
      for (const [k, v] of this.wishlists.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(WISHLIST_DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('Failed to save wishlists to disk:', err.message);
    }
  }

  getWishlist(userId) {
    const key = String(userId);
    if (!this.wishlists.has(key)) {
      this.wishlists.set(key, {
        userId: key,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.saveToFile();
    }
    return this.wishlists.get(key);
  }

  addItem(userId, product) {
    const wishlist = this.getWishlist(userId);
    const pId = String(product._id || product.id || product.productId);
    const existingIndex = wishlist.items.findIndex(
      (item) => String(item.productId || item._id || item.id) === pId
    );

    if (existingIndex === -1) {
      const price = product.discountPrice ? product.discountPrice : product.price;
      const image =
        product.primaryImage ||
        (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
        '';

      wishlist.items.push({
        productId: pId,
        _id: pId,
        id: pId,
        title: product.name || product.title,
        name: product.name || product.title,
        slug: product.slug,
        image,
        primaryImage: image,
        price,
        comparePrice: product.comparePrice,
        inStock: product.stock !== undefined ? Number(product.stock) > 0 : true,
        addedAt: new Date(),
      });
      wishlist.updatedAt = new Date();
      this.saveToFile();
    }

    return wishlist;
  }

  removeItem(userId, productId) {
    const wishlist = this.getWishlist(userId);
    const pId = String(productId);
    wishlist.items = wishlist.items.filter(
      (item) => String(item.productId || item._id || item.id) !== pId
    );
    wishlist.updatedAt = new Date();
    this.saveToFile();
    return wishlist;
  }

  clearWishlist(userId) {
    const wishlist = this.getWishlist(userId);
    wishlist.items = [];
    wishlist.updatedAt = new Date();
    this.saveToFile();
    return wishlist;
  }
}

export const wishlistStore = new WishlistStore();

