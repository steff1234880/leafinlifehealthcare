import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { productStore } from '../models/ProductStore.js';
import mongoose from 'mongoose';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to compute product count for a category using relationship/ID/slug
 */
const countProductsForCategory = (cat, allProducts) => {
  const catId = String(cat._id || cat.id || '');
  const catSlug = String(cat.slug || '').trim().toLowerCase();
  const catName = String(cat.name || '').trim().toLowerCase();

  return allProducts.filter((p) => {
    if (!p) return false;
    // 1. Direct category ID match
    if (p.categoryId && String(p.categoryId) === catId) return true;
    if (p.category && String(p.category) === catId) return true;

    // 2. Slug or name relation match
    const pCat = String(p.category || '').trim().toLowerCase();
    if (pCat && (pCat === catSlug || pCat === catName)) return true;

    // Also match normalized variants (e.g. "ayurvedic-drops" vs "Ayurvedic Drops")
    const norm = (s) => s.replace(/[^a-z0-9]/g, '');
    if (pCat && norm(pCat) === norm(catSlug)) return true;
    if (pCat && norm(pCat) === norm(catName)) return true;

    return false;
  }).length;
};

/**
 * @desc    Get all categories (public)
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const [categories, products] = await Promise.all([
        Category.find({ isActive: true }).sort({ name: 1 }).lean(),
        Product.find({}).select('category categoryId status').lean(),
      ]);

      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        productCount: countProductsForCategory(cat, products),
      }));

      return res.status(200).json({
        success: true,
        count: categoriesWithCount.length,
        categories: categoriesWithCount,
      });
    }

    const categories = await productStore.getCategories();
    const allProducts = productStore.products || [];
    // Only return active categories for public requests
    const activeOnly = categories.filter((c) => c.isActive !== false);

    const categoriesWithCount = activeOnly.map((cat) => {
      const catObj = cat.toObject ? cat.toObject() : { ...cat };
      return {
        ...catObj,
        productCount: countProductsForCategory(catObj, allProducts),
      };
    });

    return res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category by ID or slug (public)
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let category = null;
      if (mongoose.isValidObjectId(id)) {
        category = await Category.findById(id).lean();
      }
      if (!category) {
        category = await Category.findOne({ slug: id.toLowerCase() }).lean();
      }
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category not found with ID or slug '${id}'`,
        });
      }

      const products = await Product.find({}).select('category categoryId status').lean();
      const productCount = countProductsForCategory(category, products);

      return res.status(200).json({
        success: true,
        category: {
          ...category,
          productCount,
        },
      });
    }

    const category = await productStore.getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with ID or slug '${id}'`,
      });
    }

    const catObj = category.toObject ? category.toObject() : { ...category };
    const allProducts = productStore.products || [];
    const productCount = countProductsForCategory(catObj, allProducts);

    return res.status(200).json({
      success: true,
      category: {
        ...catObj,
        productCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private / Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const slug = req.body.slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (isDbConnected()) {
      const existing = await Category.findOne({
        $or: [{ name: name.trim() }, { slug }],
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Category '${name}' or slug '${slug}' already exists`,
        });
      }

      const category = await Category.create({
        name: name.trim(),
        slug,
        description: description || '',
        image: image || '',
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category,
      });
    }

    const category = await productStore.createCategory({
      name,
      slug,
      description,
      image,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private / Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, isActive } = req.body;

    if (isDbConnected()) {
      let category = null;
      if (mongoose.isValidObjectId(id)) {
        category = await Category.findById(id);
      }
      if (!category) {
        category = await Category.findOne({ slug: id.toLowerCase() });
      }
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      if (name) category.name = name.trim();
      if (slug) category.slug = slug.toLowerCase().trim();
      if (description !== undefined) category.description = description;
      if (image !== undefined) category.image = image;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category,
      });
    }

    const updated = await productStore.updateCategory(id, {
      name,
      slug,
      description,
      image,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private / Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let category = null;
      if (mongoose.isValidObjectId(id)) {
        category = await Category.findByIdAndDelete(id);
      }
      if (!category) {
        category = await Category.findOneAndDelete({ slug: id.toLowerCase() });
      }
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    }

    await productStore.deleteCategory(id);
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

