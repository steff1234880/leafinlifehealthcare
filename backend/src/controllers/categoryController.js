import { Category } from '../models/Category.js';
import { productStore } from '../models/ProductStore.js';
import mongoose from 'mongoose';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get all categories (public)
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    }

    const categories = await productStore.getCategories();
    // Only return active categories for public requests
    const activeOnly = categories.filter((c) => c.isActive !== false);
    return res.status(200).json({
      success: true,
      count: activeOnly.length,
      categories: activeOnly,
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
        category = await Category.findById(id);
      }
      if (!category) {
        category = await Category.findOne({ slug: id.toLowerCase() });
      }
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category not found with ID or slug '${id}'`,
        });
      }
      return res.status(200).json({
        success: true,
        category,
      });
    }

    const category = await productStore.getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with ID or slug '${id}'`,
      });
    }

    return res.status(200).json({
      success: true,
      category,
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

