import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * CartStore.js
 * Persistent file & memory fallback cart store supporting user-isolated shopping carts.
 * Works seamlessly alongside Mongoose / MongoDB Cart model with disk persistence.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const CART_DATA_FILE = path.join(DATA_DIR, 'cart_store.json');

class CartStore {
  constructor() {
    this.carts = new Map(); // userId -> { userId, items: [], totalQuantity, totalAmount, updatedAt }
    this.initPersistence();
  }

  initPersistence() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(CART_DATA_FILE)) {
        const raw = fs.readFileSync(CART_DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, v]) => {
            this.carts.set(String(k), v);
          });
        }
      }
    } catch (err) {
      console.warn('Could not load cart persistence file:', err.message);
    }
  }

  saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const obj = {};
      for (const [k, v] of this.carts.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(CART_DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('Failed to save carts to disk:', err.message);
    }
  }

  // Get or initialize a user cart
  getCart(userId) {
    const key = String(userId);
    if (!this.carts.has(key)) {
      this.carts.set(key, {
        userId: key,
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.saveToFile();
    }
    return this.carts.get(key);
  }

  recalculate(cart) {
    cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount =
      Math.round(
        cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
      ) / 100;
    cart.updatedAt = new Date();
    this.saveToFile();
    return cart;
  }

  addItem(userId, product, quantity) {
    const cart = this.getCart(userId);
    const existingIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(product._id)
    );

    const price = product.discountPrice ? product.discountPrice : product.price;
    const image =
      (product.images && product.images.length > 0 ? product.images[0] : product.image) || '';

    if (existingIndex > -1) {
      // Prevent duplicate entry: update quantity on existing entry
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        const err = new Error(
          `Requested total quantity (${newQty}) exceeds available stock (${product.stock}) for "${product.name}"`
        );
        err.statusCode = 400;
        throw err;
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
      cart.items[existingIndex].subtotal = Math.round(price * newQty * 100) / 100;
    } else {
      if (quantity > product.stock) {
        const err = new Error(
          `Requested quantity (${quantity}) exceeds available stock (${product.stock}) for "${product.name}"`
        );
        err.statusCode = 400;
        throw err;
      }
      cart.items.push({
        productId: String(product._id),
        name: product.name,
        image,
        price,
        quantity,
        subtotal: Math.round(price * quantity * 100) / 100,
      });
    }

    return this.recalculate(cart);
  }

  updateItemQuantity(userId, product, quantity) {
    const cart = this.getCart(userId);
    const index = cart.items.findIndex(
      (item) => String(item.productId) === String(product._id)
    );

    if (index === -1) {
      const err = new Error('Product not found in your cart');
      err.statusCode = 404;
      throw err;
    }

    if (quantity <= 0) {
      // Remove item if quantity is set to 0 or less
      cart.items.splice(index, 1);
    } else {
      if (quantity > product.stock) {
        const err = new Error(
          `Requested quantity (${quantity}) exceeds available stock (${product.stock}) for "${product.name}"`
        );
        err.statusCode = 400;
        throw err;
      }
      const price = product.discountPrice ? product.discountPrice : product.price;
      cart.items[index].quantity = quantity;
      cart.items[index].price = price;
      cart.items[index].subtotal = Math.round(price * quantity * 100) / 100;
    }

    return this.recalculate(cart);
  }

  removeItem(userId, productId) {
    const cart = this.getCart(userId);
    const index = cart.items.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    if (index === -1) {
      const err = new Error('Product not found in your cart');
      err.statusCode = 404;
      throw err;
    }

    cart.items.splice(index, 1);
    return this.recalculate(cart);
  }

  clearCart(userId) {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalAmount = 0;
    cart.updatedAt = new Date();
    this.saveToFile();
    return cart;
  }
}

export const cartStore = new CartStore();

