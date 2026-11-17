import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, editCategory, deleteCategory } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const handleOpenCreate = () => {
    setEditingCatId(null);
    setFormData({ name: '', slug: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCatId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCatId) {
      editCategory(editingCatId, {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
      });
    } else {
      addCategory({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-stone-900">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize healthcare products into curated collections
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors shadow-xs"
        >
          + Add New Category
        </button>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Products</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((cat) => {
              const liveCount = products.filter((p) => p.category === cat.slug).length;
              return (
                <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-stone-900 text-sm">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                    /collections/{cat.slug}
                  </td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                    {cat.description || 'Authentic herbal wellness'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#fef9ea] text-[#2f3e10] font-semibold text-xs border border-[#586c38]/20">
                      {liveCount} items
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#586c38] hover:bg-[#586c38]/10 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 z-10 text-xs">
            <h2 className="text-base font-heading font-bold text-stone-900 pb-3 border-b border-stone-200 mb-4">
              {editingCatId ? 'Edit Category' : 'Create Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Skin Care"
                  className="w-full h-10 px-3 border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. skin-care"
                  className="w-full h-10 px-3 border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of category purpose"
                  className="w-full p-2.5 border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2f3e10] hover:bg-[#586c38] text-white rounded font-semibold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

