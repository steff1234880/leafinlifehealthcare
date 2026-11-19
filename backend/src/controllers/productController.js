import { Product } from '../models/Product.js';
import { productStore } from '../models/ProductStore.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @desc    Get all products with pagination, search, category filter & sorting
 * @route   GET /api/products
 * @access  Public (returns active products) / Admin (can view all status including drafts/archived)
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort = 'newest', page = 1, limit = 12, status } = req.query;
    const isAdmin = req.user?.role === 'admin';

    if (isDbConnected()) {
      const query = {};

      // If public request, only show active products; if admin requested specific status or all
      if (!isAdmin) {
        query.status = 'active';
      } else if (status && status !== 'all') {
        query.status = status;
      }

      if (category && category !== 'all') {
        query.category = new RegExp(category, 'i');
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'name-asc') sortOptions = { name: 1 };
      else if (sort === 'name-desc') sortOptions = { name: -1 };

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
        Product.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        count: products.length,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
        products,
      });
    }

    const result = await productStore.getProducts({
      category,
      search,
      sort,
      page,
      limit,
      status: !isAdmin ? 'active' : (status && status !== 'all' ? status : undefined),
    });

    return res.status(200).json({
      success: true,
      count: result.products.length,
      pagination: result.pagination,
      products: result.products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q, category, sort = 'newest', page = 1, limit = 12 } = req.query;
    return getProducts(
      {
        ...req,
        query: {
          ...req.query,
          search: q || '',
          category,
          sort,
          page,
          limit,
        },
      },
      res,
      next
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID or slug '${id}'`,
        });
      }

      return res.status(200).json({
        success: true,
        product,
      });
    }

    const product = await productStore.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ID or slug '${id}'`,
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product with optional uploaded images
 * @route   POST /api/products
 * @access  Private / Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, comparePrice, category, stock, sku, status } = req.body;

    // Process uploaded files if multipart/form-data was used
    let imageUrls = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/products/${file.filename}`);
    } else if (req.file) {
      imageUrls = [`/uploads/products/${req.file.filename}`];
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images)
        ? req.body.images
        : typeof req.body.images === 'string'
        ? req.body.images.split(',').map((s) => s.trim())
        : [req.body.images];
    } else if (req.body.image) {
      imageUrls = [req.body.image];
    }

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid non-negative product price is required',
      });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required',
      });
    }

    if (!sku || typeof sku !== 'string' || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product SKU is required',
      });
    }

    const cleanSku = sku.trim().toUpperCase();
    const slug =
      req.body.slug ||
      name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (isDbConnected()) {
      const existingSku = await Product.findOne({ sku: cleanSku });
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: `Product with SKU '${cleanSku}' already exists`,
        });
      }

      const product = await Product.create({
        name: name.trim(),
        slug,
        description: description || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        comparePrice: comparePrice !== undefined && comparePrice !== null && comparePrice !== ''
          ? Number(comparePrice)
          : (discountPrice ? Number(price) : null),
        images: imageUrls,
        category: category.trim(),
        stock: stock !== undefined ? Number(stock) : 0,
        sku: cleanSku,
        status: status || 'active',
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product,
      });
    }

    const product = await productStore.createProduct({
      name,
      slug,
      description,
      price,
      discountPrice,
      comparePrice,
      images: imageUrls,
      category,
      stock,
      sku: cleanSku,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload product images endpoint (Admin only)
 * @route   POST /api/products/upload-images
 * @access  Private / Admin
 */
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      if (req.file) {
        req.files = [req.file];
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one image file to upload (JPG, PNG, WEBP max 5MB)',
        });
      }
    }

    // Return relative public image URLs (never expose server filesystem paths)
    const uploadedImages = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/products/${file.filename}`,
    }));

    return res.status(200).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages,
      urls: uploadedImages.map((img) => img.url),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete uploaded image file (Admin only)
 * @route   DELETE /api/products/images/:filename
 * @access  Private / Admin
 */
export const deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Security check: prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.resolve('uploads/products', safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message: `Image ${safeFilename} deleted successfully`,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Image file not found on server',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private / Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, discountPrice, comparePrice, category, stock, sku, status } = req.body;

    // Check if new images were uploaded in multipart form
    let newImages = undefined;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      newImages = req.files.map((file) => `/uploads/products/${file.filename}`);
    } else if (req.file) {
      newImages = [`/uploads/products/${req.file.filename}`];
    } else if (req.body.images !== undefined) {
      newImages = Array.isArray(req.body.images)
        ? req.body.images
        : typeof req.body.images === 'string'
        ? req.body.images.split(',').map((s) => s.trim())
        : [req.body.images];
    }

    if (isDbConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check SKU uniqueness if changing SKU
      if (sku && sku.trim().toUpperCase() !== product.sku.toUpperCase()) {
        const cleanSku = sku.trim().toUpperCase();
        const existingSku = await Product.findOne({ sku: cleanSku, _id: { $ne: product._id } });
        if (existingSku) {
          return res.status(409).json({
            success: false,
            message: `Product with SKU '${cleanSku}' already exists`,
          });
        }
        product.sku = cleanSku;
      }

      if (name) product.name = name.trim();
      if (slug) product.slug = slug.trim().toLowerCase();
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
      if (comparePrice !== undefined) product.comparePrice = comparePrice ? Number(comparePrice) : null;
      if (newImages !== undefined) product.images = newImages;
      if (category !== undefined) product.category = category.trim();
      if (stock !== undefined) product.stock = Number(stock);
      if (status !== undefined) product.status = status;

      await product.save();

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product,
      });
    }

    const updated = await productStore.updateProduct(id, {
      name,
      slug,
      description,
      price,
      discountPrice,
      comparePrice,
      images: newImages,
      category,
      stock,
      sku,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private / Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findByIdAndDelete(id);
      }
      if (!product) {
        product = await Product.findOneAndDelete({ slug: id.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    }

    await productStore.deleteProduct(id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private / Admin
 */
export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative stock quantity is required',
      });
    }

    if (isDbConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      product.stock = Number(stock);
      await product.save();

      return res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        stock: product.stock,
        product,
      });
    }

    const updated = await productStore.updateStock(id, stock);
    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      stock: updated.stock,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate or deactivate a product status
 * @route   PATCH /api/products/:id/status
 * @access  Private / Admin
 */
export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'draft', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    if (isDbConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ slug: id.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      product.status = status;
      await product.save();

      return res.status(200).json({
        success: true,
        message: `Product status updated to '${status}'`,
        product,
      });
    }

    const updated = await productStore.updateProduct(id, { status });
    return res.status(200).json({
      success: true,
      message: `Product status updated to '${status}'`,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};
