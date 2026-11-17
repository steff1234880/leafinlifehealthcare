import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { cartStore } from '../models/CartStore.js';
import { productStore } from '../models/ProductStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to fetch a product reliably from DB or productStore
 */
async function fetchProduct(productId) {
  if (isDbConnected()) {
    let prod = null;
    if (mongoose.isValidObjectId(productId)) {
      prod = await Product.findById(productId);
    }
    if (!prod) {
      prod = await Product.findOne({ slug: String(productId).toLowerCase() });
    }
    return prod;
  }
  return await productStore.getProductById(productId);
}

/**
 * @desc    Get current user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      let cart = await Cart.findOne({ userId }).populate('items.productId');

      if (!cart) {
        cart = await Cart.create({
          userId,
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
        });
      }

      return res.status(200).json({
        success: true,
        cart,
      });
    }

    const cart = cartStore.getCart(userId);
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Add product to user's cart
 * @route   POST /api/cart
 * @access  Private
 */
export async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // 1. Verify product existence & availability from trusted database
    const product = await fetchProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status && product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Product "${product.name}" is currently not available for purchase`,
      });
    }

    // 2. Stock checks
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: `Product "${product.name}" is out of stock`,
      });
    }

    // 3. Database Mode (MongoDB connected)
    if (isDbConnected()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => String(item.productId) === String(product._id)
      );

      const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
      const productImage =
        (product.images && product.images.length > 0 ? product.images[0] : product.image) || '';

      if (existingItemIndex > -1) {
        const newTotalQty = cart.items[existingItemIndex].quantity + parsedQty;
        if (newTotalQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Requested total quantity (${newTotalQty}) exceeds available stock (${product.stock}) for "${product.name}"`,
          });
        }
        cart.items[existingItemIndex].quantity = newTotalQty;
        cart.items[existingItemIndex].price = effectivePrice;
        cart.items[existingItemIndex].subtotal =
          Math.round(effectivePrice * newTotalQty * 100) / 100;
      } else {
        if (parsedQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Requested quantity (${parsedQty}) exceeds available stock (${product.stock}) for "${product.name}"`,
          });
        }
        cart.items.push({
          productId: product._id,
          name: product.name,
          image: productImage,
          price: effectivePrice,
          quantity: parsedQty,
          subtotal: Math.round(effectivePrice * parsedQty * 100) / 100,
        });
      }

      cart.recalculateTotals();
      await cart.save();

      return res.status(200).json({
        success: true,
        message: `Added "${product.name}" to cart`,
        cart,
      });
    }

    // 4. Memory Store Fallback
    const updatedCart = cartStore.addItem(userId, product, parsedQty);
    return res.status(200).json({
      success: true,
      message: `Added "${product.name}" to cart`,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update quantity of an item in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity number is required',
      });
    }

    const parsedQty = parseInt(quantity, 10);

    // Verify product exists
    const product = await fetchProduct(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (parsedQty > 0 && parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${parsedQty}) exceeds available stock (${product.stock}) for "${product.name}"`,
      });
    }

    if (isDbConnected()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) => String(item.productId) === String(product._id)
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your cart',
        });
      }

      if (parsedQty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
        cart.items[itemIndex].quantity = parsedQty;
        cart.items[itemIndex].price = effectivePrice;
        cart.items[itemIndex].subtotal = Math.round(effectivePrice * parsedQty * 100) / 100;
      }

      cart.recalculateTotals();
      await cart.save();

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        cart,
      });
    }

    const updatedCart = cartStore.updateItemQuantity(userId, product, parsedQty);
    return res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (isDbConnected()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item) => String(item.productId) !== String(productId)
      );

      if (cart.items.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in your cart',
        });
      }

      cart.recalculateTotals();
      await cart.save();

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        cart,
      });
    }

    const updatedCart = cartStore.removeItem(userId, productId);
    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      } else {
        cart.items = [];
        cart.totalQuantity = 0;
        cart.totalAmount = 0;
      }

      await cart.save();

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        cart,
      });
    }

    const clearedCart = cartStore.clearCart(userId);
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: clearedCart,
    });
  } catch (error) {
    next(error);
  }
}

