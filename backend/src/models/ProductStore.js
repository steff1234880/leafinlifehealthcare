/**
 * ProductStore.js
 * In-memory fallback and synchronization store for Products and Categories.
 * Seeded with authentic Leaf In Life Healthcare products and categories.
 * Works seamlessly alongside Mongoose / MongoDB.
 */

// Initial categories from authentic catalog
const initialCategories = [
  {
    _id: 'cat-ayurvedic-drops',
    name: 'Ayurvedic Drops',
    slug: 'ayurvedic-drops',
    description: 'Authentic Ayurvedic drops for respiratory, sinus, and migraine wellness.',
    image: '/assets/images/cat-drops.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    _id: 'cat-ayurvedic-oils',
    name: 'Ayurvedic Oils',
    slug: 'ayurvedic-oils',
    description: 'Herbal medicated thailams and oils for body care and pain relief.',
    image: '/assets/images/cat-oils.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    _id: 'cat-ayurvedic-tablets',
    name: 'Ayurvedic Tablets',
    slug: 'ayurvedic-tablets',
    description: 'Traditional Ayurvedic gulikas and tablets for digestive balance and vitality.',
    image: '/assets/images/cat-tablets.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    _id: 'cat-ayurvedic-roll-on',
    name: 'Ayurvedic Roll On',
    slug: 'ayurvedic-roll-on',
    description: 'Convenient pocket roll-on herbal formulations for on-the-go headache & pain relief.',
    image: '/assets/images/cat-roll-on.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

// Initial products seeded with unique SKUs
const initialProducts = [
  {
    _id: '7362954788958',
    name: 'Bashpika Thulasi Premium Bottle',
    slug: 'bashpika-thulasi-7ml',
    description:
      'Bashpika Thulasi Premium Bottle by Leaf in Life Healthcare is a trusted Ayurvedic formulation for migraine care, made with 100% natural Ayurvedic ingredients. It supports comfort from migraine headaches and common concerns such as cold, sinus discomfort and seasonal allergies.',
    price: 112.5,
    discountPrice: 105.0,
    comparePrice: 125.0,
    images: [
      '/assets/images/prod-p2.jpg',
      '/assets/images/prod-pp2.jpg',
      '/assets/images/prod-p2-g3.jpg',
      '/assets/images/prod-p2-g4.jpg',
      '/assets/images/prod-p2-g5.jpg',
    ],
    category: 'Ayurvedic Drops',
    stock: 50,
    sku: 'LIL-BT-1000',
    status: 'active',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    updatedAt: new Date('2024-03-15T10:00:00Z'),
  },
  {
    _id: '7362149449822',
    name: 'Sarvanga Thailam',
    slug: 'sarvanga-thailam',
    description:
      'Sarvanga Thailam is a traditional Ayurvedic medicated oil crafted with time-tested herbs for whole body massage, relieving muscular stiffness, fatigue, and supporting joint flexibility.',
    price: 150.0,
    discountPrice: 135.0,
    comparePrice: 165.0,
    images: ['/assets/images/prod-p1.jpg', '/assets/images/prod-pp1.jpg'],
    category: 'Ayurvedic Oils',
    stock: 45,
    sku: 'LIL-ST-1001',
    status: 'active',
    createdAt: new Date('2024-03-14T10:00:00Z'),
    updatedAt: new Date('2024-03-14T10:00:00Z'),
  },
  {
    _id: '7372488540254',
    name: 'Sukh Bodycare Oil',
    slug: 'sukh-bodycare-oil-1',
    description:
      'Sukh Bodycare Oil provides soothing natural nourishment for sensitive and stressed skin, formulated with nourishing herbal extracts to restore natural vitality.',
    price: 180.0,
    discountPrice: 160.0,
    comparePrice: 200.0,
    images: ['/assets/images/prod-p3.jpg', '/assets/images/prod-pp3.jpg'],
    category: 'Ayurvedic Oils',
    stock: 30,
    sku: 'LIL-SB-1002',
    status: 'active',
    createdAt: new Date('2024-03-13T10:00:00Z'),
    updatedAt: new Date('2024-03-13T10:00:00Z'),
  },
  {
    _id: '7362947743838',
    name: 'Ashtamrutham Lite Vayugulika',
    slug: 'ashtamrutham-vayugulika',
    description:
      'Ashtamrutham Lite Vayugulika is an authentic Ayurvedic formulation designed to support healthy digestion, alleviate abdominal bloating, gas, and digestive discomfort.',
    price: 30.0,
    discountPrice: null,
    images: ['/assets/images/prod-p4.jpg', '/assets/images/prod-pp4.jpg'],
    category: 'Ayurvedic Tablets',
    stock: 120,
    sku: 'LIL-AV-1003',
    status: 'active',
    createdAt: new Date('2024-03-12T10:00:00Z'),
    updatedAt: new Date('2024-03-12T10:00:00Z'),
  },
  {
    _id: '7736655347806',
    name: 'Sukh Bodycare Roll On',
    slug: 'sukh-bodycare-oil-roll-on',
    description:
      'Convenient travel-size herbal roll on for quick application on temples, neck, and pulse points to ease headache, tension, and sinus pressure.',
    price: 50.0,
    discountPrice: null,
    images: ['/assets/images/prod-p5.jpg', '/assets/images/prod-pp5.jpg'],
    category: 'Ayurvedic Roll On',
    stock: 80,
    sku: 'LIL-SR-1004',
    status: 'active',
    createdAt: new Date('2024-03-11T10:00:00Z'),
    updatedAt: new Date('2024-03-11T10:00:00Z'),
  },
  {
    _id: '7736673501278',
    name: 'Ashtamrutham Vayugulika',
    slug: 'ashtamrutham-vayugulika-copy',
    description:
      'Classical Vayugulika preparation for acute gastric relief, nausea, and digestive equilibrium according to classical Kerala Ayurvedic texts.',
    price: 10.0,
    discountPrice: null,
    images: ['/assets/images/prod-p4.jpg'],
    category: 'Ayurvedic Tablets',
    stock: 150,
    sku: 'LIL-AV-1005',
    status: 'active',
    createdAt: new Date('2024-03-10T10:00:00Z'),
    updatedAt: new Date('2024-03-10T10:00:00Z'),
  },
  {
    _id: '7362182611038',
    name: 'Bashpika Thulasi Standard',
    slug: 'bashpika-thulasi-premium-bottle',
    description:
      'Standard pack of pure steam-distilled Thulasi extract drops for steam inhalation, immunity support, and throat comfort.',
    price: 95.0,
    discountPrice: 85.0,
    comparePrice: 110.0,
    images: ['/assets/images/prod-p2.jpg'],
    category: 'Ayurvedic Drops',
    stock: 60,
    sku: 'LIL-BT-1006',
    status: 'active',
    createdAt: new Date('2024-03-09T10:00:00Z'),
    updatedAt: new Date('2024-03-09T10:00:00Z'),
  },
];

class ProductStore {
  constructor() {
    this.categories = [...initialCategories];
    this.products = [...initialProducts];
  }

  // ================= CATEGORY METHODS =================
  async getCategories() {
    return [...this.categories];
  }

  async getCategoryById(idOrSlug) {
    return this.categories.find(
      (c) => c._id === idOrSlug || c.slug === idOrSlug || c.name.toLowerCase() === idOrSlug.toLowerCase()
    ) || null;
  }

  async createCategory(data) {
    const slug = data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check duplicate
    const existing = this.categories.find(
      (c) => c.slug === slug || c.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (existing) {
      const err = new Error(`Category with name "${data.name}" or slug "${slug}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    const newCategory = {
      _id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: data.name.trim(),
      slug,
      description: data.description || '',
      image: data.image || '',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(idOrSlug, data) {
    const index = this.categories.findIndex((c) => c._id === idOrSlug || c.slug === idOrSlug);
    if (index === -1) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.name) {
      const duplicate = this.categories.find(
        (c, idx) => idx !== index && c.name.toLowerCase() === data.name.trim().toLowerCase()
      );
      if (duplicate) {
        const err = new Error(`Category name "${data.name}" already in use`);
        err.statusCode = 409;
        throw err;
      }
      this.categories[index].name = data.name.trim();
    }

    if (data.slug) {
      const duplicateSlug = this.categories.find(
        (c, idx) => idx !== index && c.slug === data.slug.toLowerCase().trim()
      );
      if (duplicateSlug) {
        const err = new Error(`Category slug "${data.slug}" already in use`);
        err.statusCode = 409;
        throw err;
      }
      this.categories[index].slug = data.slug.toLowerCase().trim();
    }

    if (data.description !== undefined) this.categories[index].description = data.description;
    if (data.image !== undefined) this.categories[index].image = data.image;
    if (data.isActive !== undefined) this.categories[index].isActive = Boolean(data.isActive);
    this.categories[index].updatedAt = new Date();

    return this.categories[index];
  }

  async deleteCategory(idOrSlug) {
    const index = this.categories.findIndex((c) => c._id === idOrSlug || c.slug === idOrSlug);
    if (index === -1) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    const deleted = this.categories.splice(index, 1)[0];
    return deleted;
  }

  // ================= PRODUCT METHODS =================
  async getProducts(query = {}) {
    let filtered = [...this.products];

    // Filter by status (public view only sees active)
    if (query.status) {
      filtered = filtered.filter((p) => p.status === query.status);
    }

    // Filter by category
    if (query.category && query.category !== 'all') {
      const catQuery = query.category.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        const pSlug = (p.categorySlug || '').toLowerCase();
        return pCat === catQuery || pSlug === catQuery || pCat.includes(catQuery);
      });
    }

    // Search query
    if (query.search) {
      const searchStr = query.search.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(searchStr);
        const descMatch = (p.description || '').toLowerCase().includes(searchStr);
        const skuMatch = (p.sku || '').toLowerCase().includes(searchStr);
        return nameMatch || descMatch || skuMatch;
      });
    }

    // Sorting
    const sort = query.sort || 'newest';
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 12);
    const total = filtered.length;
    const pages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async getProductById(idOrSlug) {
    const product = this.products.find(
      (p) => String(p._id) === String(idOrSlug) || p.slug === idOrSlug
    );
    return product || null;
  }

  async checkDuplicateSku(sku, excludeId = null) {
    if (!sku) return false;
    const cleanSku = sku.trim().toUpperCase();
    return this.products.some(
      (p) => p.sku && p.sku.toUpperCase() === cleanSku && String(p._id) !== String(excludeId)
    );
  }

  async createProduct(data) {
    const cleanSku = (data.sku || '').trim().toUpperCase();
    if (!cleanSku) {
      const err = new Error('Product SKU is required');
      err.statusCode = 400;
      throw err;
    }

    // Prevent duplicate SKU
    if (await this.checkDuplicateSku(cleanSku)) {
      const err = new Error(`Product with SKU "${cleanSku}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    const slug = data.slug || data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct = {
      _id: String(Date.now()),
      name: data.name.trim(),
      slug,
      description: data.description || '',
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      comparePrice: data.comparePrice !== undefined && data.comparePrice !== null && data.comparePrice !== ''
        ? Number(data.comparePrice)
        : (data.discountPrice ? Number(data.price) : null),
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
      category: data.category.trim(),
      stock: Number(data.stock !== undefined ? data.stock : 0),
      sku: cleanSku,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id, data) {
    const index = this.products.findIndex((p) => String(p._id) === String(id) || p.slug === id);
    if (index === -1) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const targetProduct = this.products[index];

    // Check SKU uniqueness if changed
    if (data.sku && data.sku.trim().toUpperCase() !== targetProduct.sku.toUpperCase()) {
      const cleanSku = data.sku.trim().toUpperCase();
      if (await this.checkDuplicateSku(cleanSku, targetProduct._id)) {
        const err = new Error(`Product with SKU "${cleanSku}" already exists`);
        err.statusCode = 409;
        throw err;
      }
      targetProduct.sku = cleanSku;
    }

    if (data.name) targetProduct.name = data.name.trim();
    if (data.slug) targetProduct.slug = data.slug.trim().toLowerCase();
    if (data.description !== undefined) targetProduct.description = data.description;
    if (data.price !== undefined) targetProduct.price = Number(data.price);
    if (data.discountPrice !== undefined) {
      targetProduct.discountPrice = data.discountPrice ? Number(data.discountPrice) : null;
    }
    if (data.comparePrice !== undefined) {
      targetProduct.comparePrice = data.comparePrice !== null && data.comparePrice !== ''
        ? Number(data.comparePrice)
        : null;
    }
    if (data.images !== undefined) {
      targetProduct.images = Array.isArray(data.images) ? data.images : [data.images];
    }
    if (data.category !== undefined) targetProduct.category = data.category.trim();
    if (data.stock !== undefined) targetProduct.stock = Number(data.stock);
    if (data.status !== undefined) targetProduct.status = data.status;
    targetProduct.updatedAt = new Date();

    return targetProduct;
  }

  async deleteProduct(id) {
    const index = this.products.findIndex((p) => String(p._id) === String(id) || p.slug === id);
    if (index === -1) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const deleted = this.products.splice(index, 1)[0];
    return deleted;
  }

  async updateStock(id, newStock) {
    const index = this.products.findIndex((p) => String(p._id) === String(id) || p.slug === id);
    if (index === -1) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const stockNum = Number(newStock);
    if (isNaN(stockNum) || stockNum < 0) {
      const err = new Error('Stock must be a non-negative number');
      err.statusCode = 400;
      throw err;
    }

    this.products[index].stock = stockNum;
    this.products[index].updatedAt = new Date();
    return this.products[index];
  }
}

export const productStore = new ProductStore();

