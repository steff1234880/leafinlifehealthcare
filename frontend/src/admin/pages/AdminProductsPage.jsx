import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { getProductImageUrl } from '../../utils/imageUtils';

export default function AdminProductsPage() {
  const { products, categories, addProduct, editProduct, deleteProduct } = useAdmin();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'ayurvedic-medicine',
    price: '',
    comparePrice: '',
    stock: 50,
    shortDescription: '',
    description: '',
    primaryImage: '/assets/images/products/product-1.jpg',
  });

  // Clean up Object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Helpers for category relationship resolution
  const normalize = (val) => String(val || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const resolveProductCategoryId = (product) => {
    if (!product) return '';
    const pCatId = product.categoryId || product.category_id;
    if (pCatId) {
      const found = categories.find((c) => String(c.id) === String(pCatId));
      if (found) return String(found.id);
    }
    const rawCat = product.category;
    if (!rawCat) return '';
    const directMatch = categories.find((c) => String(c.id) === String(rawCat));
    if (directMatch) return String(directMatch.id);
    const normRaw = normalize(rawCat);
    const matched = categories.find((c) => normalize(c.slug) === normRaw || normalize(c.name) === normRaw);
    return matched ? String(matched.id) : String(rawCat);
  };

  const getCategoryDisplayName = (product) => {
    const catId = resolveProductCategoryId(product);
    const found = categories.find((c) => String(c.id) === catId || c.slug === catId);
    return found ? found.name : (product.category ? String(product.category).replace(/-/g, ' ') : 'General');
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesQuery = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesQuery) return false;
    if (selectedCategory === 'all') return true;

    const pCatId = resolveProductCategoryId(p);
    if (pCatId === selectedCategory || String(pCatId) === String(selectedCategory)) return true;
    const targetCat = categories.find((c) => String(c.id) === String(selectedCategory) || c.slug === selectedCategory);
    if (targetCat && String(targetCat.id) === pCatId) return true;
    const normTarget = normalize(selectedCategory);
    const normRaw = normalize(p.category);
    return normRaw === normTarget;
  });

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setEditingProductId(null);
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setFormError('');
    setFormData({
      title: '',
      category: categories[0]?.slug || 'ayurvedic-medicine',
      price: '',
      comparePrice: '',
      stock: 30,
      shortDescription: '',
      description: '',
      primaryImage: '/assets/images/products/product-1.jpg',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (product) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setEditingProductId(product._id);
    setSelectedImageFile(null);
    const existingImg = product.primaryImage || (product.images && product.images[0]) || '/assets/images/products/product-1.jpg';
    setImagePreviewUrl(getProductImageUrl(existingImg));
    setFormError('');
    setFormData({
      title: product.title || '',
      category: product.category || categories[0]?.slug || 'ayurvedic-medicine',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      stock: product.stock ?? 30,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      primaryImage: existingImg,
    });
    setIsModalOpen(true);
  };

  // Image upload handler with immediate URL.createObjectURL preview
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setFormError('Please select a valid image file (JPG, PNG, or WEBP).');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }

      setFormError('');
      // Revoke previous blob preview to prevent memory leaks
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.price) {
      setFormError('Product title and price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProductId) {
        await editProduct(
          editingProductId,
          {
            title: formData.title.trim(),
            category: formData.category,
            price: Number(formData.price),
            comparePrice: Number(formData.comparePrice) || null,
            stock: Number(formData.stock) || 0,
            shortDescription: formData.shortDescription,
            description: formData.description,
            // If user did not pick a new file and manually changed URL:
            primaryImage: selectedImageFile ? undefined : formData.primaryImage,
          },
          selectedImageFile
        );
      } else {
        await addProduct(
          {
            title: formData.title.trim(),
            category: formData.category,
            price: Number(formData.price),
            comparePrice: Number(formData.comparePrice) || null,
            stock: Number(formData.stock) || 0,
            shortDescription: formData.shortDescription,
            description: formData.description,
            primaryImage: formData.primaryImage,
          },
          selectedImageFile
        );
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-stone-900">
            Product Management ({products.length})
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Add, update, adjust prices and manage inventory for store catalog
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white text-sm font-semibold rounded uppercase tracking-wider transition-colors shadow-xs"
        >
          + Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-2">
          <span className="text-sm text-stone-600 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#586c38] bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-semibold text-xs">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-500 text-sm">
                    No products found matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getProductImageUrl(p.primaryImage)}
                          alt={p.title}
                          className="w-12 h-12 object-cover rounded border border-stone-200 shrink-0 bg-stone-50"
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-stone-900 text-sm line-clamp-1">
                            {p.title}
                          </p>
                          <p className="text-xs text-stone-500">SKU: {p.sku || p._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 capitalize text-sm">
                      {getCategoryDisplayName(p)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                      {formatPrice(p.price)}
                      {p.comparePrice && (
                        <span className="block text-xs text-stone-400 line-through font-normal">
                          {formatPrice(p.comparePrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          (Number(p.stock) || 0) === 0
                            ? 'bg-red-100 text-red-700'
                            : (Number(p.stock) || 0) <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.stock ?? 0} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const inStock = Number(p.stock) > 0;
                        return (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              inStock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-1 text-xs font-semibold text-[#586c38] hover:bg-[#586c38]/10 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id, p.title)}
                        className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 sm:p-8 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <h2 className="text-lg font-heading font-bold text-stone-900">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-sm">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. SARVANGA SNEHAM 200ML"
                  className="w-full h-10 px-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-[#586c38]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 text-sm">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 border border-stone-300 rounded text-sm bg-white focus:outline-none focus:border-[#586c38]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 text-sm">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full h-10 px-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-[#586c38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 text-sm">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="699.00"
                    className="w-full h-10 px-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-[#586c38]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 text-sm">
                    Compare at Price (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    placeholder="799.00"
                    className="w-full h-10 px-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-[#586c38]"
                  />
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-sm">
                  Product Image
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={imagePreviewUrl || getProductImageUrl(formData.primaryImage)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border border-stone-300 bg-stone-50"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#f9f9eb] file:text-[#2f3e10] hover:file:bg-[#ececb5] cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={selectedImageFile ? '' : formData.primaryImage}
                      disabled={Boolean(selectedImageFile)}
                      onChange={(e) => {
                        setFormData({ ...formData, primaryImage: e.target.value });
                        setImagePreviewUrl(getProductImageUrl(e.target.value));
                      }}
                      className="mt-2 w-full h-9 px-3 border border-stone-300 rounded text-xs focus:outline-none focus:border-[#586c38] disabled:bg-stone-100 disabled:text-stone-400"
                    />
                    {selectedImageFile && (
                      <div className="flex items-center justify-between mt-1 text-xs text-emerald-700">
                        <span>Selected file: {selectedImageFile.name} ({(selectedImageFile.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                              URL.revokeObjectURL(imagePreviewUrl);
                            }
                            setSelectedImageFile(null);
                            setImagePreviewUrl(getProductImageUrl(formData.primaryImage));
                          }}
                          className="text-red-500 hover:underline cursor-pointer ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-sm">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Authentic herbal formulation for wellness"
                  className="w-full h-10 px-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-[#586c38]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#2f3e10] hover:bg-[#586c38] text-white rounded text-sm font-semibold uppercase tracking-wider transition disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting
                    ? selectedImageFile
                      ? 'Uploading & Saving...'
                      : 'Saving...'
                    : editingProductId
                    ? 'Update Product'
                    : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

