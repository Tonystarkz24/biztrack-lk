import React, { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../services/productService';
import ProductFilters from '../components/inventory/ProductFilters';
import ProductList from '../components/inventory/ProductList';
import ProductForm from '../components/inventory/ProductForm';
import '../styles/inventory.css';

/**
 * InventoryPage - Member 1 Inventory Feature for BizTrack LK
 * Manages product catalog, stock alerts, filters, and CRUD operations.
 */
function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (lowStock) params.lowStock = 'true';

      const res = await productService.getAll(params);
      if (res && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unable to connect to product inventory server';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStock, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Compute available categories from products
  const availableCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Compute stat metrics
  const stats = useMemo(() => {
    const total = products.length;
    let active = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    products.forEach((p) => {
      const stock = Number(p.stock_quantity) || 0;
      const reorder = Number(p.reorder_level) || 0;
      const cost = Number(p.cost_price) || 0;

      if (p.is_active) active++;
      if (stock <= 0) outOfStockCount++;
      if (stock > 0 && stock <= reorder) lowStockCount++;
      totalValuation += stock * cost;
    });

    return {
      total,
      active,
      lowStockCount,
      outOfStockCount,
      totalValuation
    };
  }, [products]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct && editingProduct.id) {
        await productService.update(editingProduct.id, formData);
        showToast(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        await productService.create(formData);
        showToast(`Product "${formData.name}" created successfully!`, 'success');
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save product';
      showToast(errorMsg, 'error');
      throw err; // re-throw so ProductForm can also handle it
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.is_active;
      await productService.toggleStatus(product.id, newStatus);
      showToast(`Product "${product.name}" ${newStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update product status';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productService.delete(productId);
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete product';
      showToast(errorMsg, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLowStock(false);
  };

  return (
    <div className="inventory-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>
            {toast.type === 'success' ? '✅ ' : '❌ '}
            {toast.message}
          </span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <header className="inventory-header">
        <div className="header-title-group">
          <h1>Product Inventory</h1>
          <p>Monitor stock availability, reorder thresholds, and catalog pricing</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenAddModal}
        >
          <span>＋ Add New Product</span>
        </button>
      </header>

      {/* Stats Summary Cards */}
      <section className="stats-grid" aria-label="Inventory Statistics">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Catalog</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              📦
            </div>
          </div>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-footer">{stats.active} currently active</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Low Stock Alerts</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              ⚠️
            </div>
          </div>
          <span className="stat-value" style={{ color: stats.lowStockCount > 0 ? '#fbbf24' : '#f8fafc' }}>
            {stats.lowStockCount}
          </span>
          <span className="stat-footer">At or below reorder level</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Out of Stock</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              🚫
            </div>
          </div>
          <span className="stat-value" style={{ color: stats.outOfStockCount > 0 ? '#f87171' : '#f8fafc' }}>
            {stats.outOfStockCount}
          </span>
          <span className="stat-footer">Needs immediate replenishment</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Inventory Valuation</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              💰
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '1.45rem' }}>
            LKR {stats.totalValuation.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="stat-footer">Based on cost price</span>
        </div>
      </section>

      {/* Filter Controls */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        lowStock={lowStock}
        onLowStockChange={setLowStock}
        categories={availableCategories}
        onReset={handleResetFilters}
      />

      {/* Product List Table / Mobile Cards */}
      <ProductList
        products={products}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleStatus}
        onAddNew={handleOpenAddModal}
      />

      {/* Add / Edit Product Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        availableCategories={availableCategories}
      />
    </div>
  );
}

export default InventoryPage;
