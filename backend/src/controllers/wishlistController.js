import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { wishlistStore } from '../models/WishlistStore.js';
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
      prod = await Product.findOne({
        $or: [{ _id: productId }, { slug: String(productId).toLowerCase() }],
      });
    }
    if (prod) return prod;
  }
  return await productStore.getProductById(productId);
}

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    if (isDbConnected()) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = await Wishlist.create({
          userId,
          items: [],
        });
      }
      return res.status(200).json({
        success: true,
        wishlist,
      });
    }

    const wishlist = wishlistStore.getWishlist(userId);
    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Add product to user's wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, product: customProduct } = req.body;

    const targetId = productId || customProduct?._id || customProduct?.id;
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = (await fetchProduct(targetId)) || customProduct;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const pId = String(product._id || product.id || targetId);
    const itemPrice = product.discountPrice ? product.discountPrice : product.price;
    const itemImage =
      product.primaryImage ||
      (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
      '';

    if (isDbConnected()) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      const existingIndex = wishlist.items.findIndex(
        (it) => String(it.productId) === pId
      );

      if (existingIndex === -1) {
        wishlist.items.push({
          productId: pId,
          title: product.name || product.title,
          name: product.name || product.title,
          slug: product.slug,
          image: itemImage,
          price: itemPrice,
          comparePrice: product.comparePrice,
          inStock: product.stock !== undefined ? Number(product.stock) > 0 : true,
          addedAt: new Date(),
        });
        await wishlist.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Added to wishlist',
        wishlist,
      });
    }

    const updated = wishlistStore.addItem(userId, product);
    return res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      wishlist: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Remove product from user's wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (isDbConnected()) {
      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: 'Wishlist not found',
        });
      }

      wishlist.items = wishlist.items.filter(
        (it) => String(it.productId) !== String(productId)
      );
      await wishlist.save();

      return res.status(200).json({
        success: true,
        message: 'Removed from wishlist',
        wishlist,
      });
    }

    const updated = wishlistStore.removeItem(userId, productId);
    return res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      wishlist: updated,
    });
  } catch (error) {
    next(error);
  }
}

