import React, { useState } from 'react';

/**
 * ProductList component
 * Renders products in a desktop table and mobile card layout with stock badges and action buttons.
 */
function ProductList({
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew
}) {
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(productToDelete.id);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="table-card">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading inventory records...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-desc">
            No products match the selected search or filter criteria. Try clearing filters or add a new product.
          </p>
          {onAddNew && (
            <button
              type="button"
              className="btn-primary"
              onClick={onAddNew}
              style={{ marginTop: '0.5rem' }}
            >
              + Add First Product
            </button>
          )}
        </div>
      </div>
    );
  }

  // Stock status helper
  const getStockStatus = (stockQty, reorderLvl) => {
    const stock = Number(stockQty);
    const reorder = Number(reorderLvl);

    if (stock <= 0) {
      return <span className="badge badge-out-stock">Out of Stock</span>;
    }
    if (stock <= reorder) {
      return <span className="badge badge-low-stock">Low ({stock})</span>;
    }
    return <span className="badge badge-in-stock">In Stock ({stock})</span>;
  };

  return (
    <>
      <div className="table-card">
        {/* Desktop Table View */}
        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Details</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Unit Cost (LKR)</th>
                <th>Selling Price (LKR)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const isLow = Number(item.stock_quantity) <= Number(item.reorder_level);
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="sku-tag">{item.sku}</span>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <span className="product-name">{item.name}</span>
                        <span className="product-category-sub">Unit: {item.unit}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#cbd5e1' }}>{item.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {getStockStatus(item.stock_quantity, item.reorder_level)}
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Reorder alert: {Number(item.reorder_level).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span>{Number(item.cost_price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                        {Number(item.selling_price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      {item.is_active ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        {/* Toggle Status */}
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onToggleStatus(item)}
                          title={item.is_active ? 'Deactivate Product' : 'Activate Product'}
                          aria-label={item.is_active ? 'Deactivate Product' : 'Activate Product'}
                        >
                          {item.is_active ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onEdit(item)}
                          title="Edit Product"
                          aria-label="Edit Product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => setProductToDelete(item)}
                          title="Delete Product"
                          aria-label="Delete Product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-view" style={{ padding: '1rem' }}>
          {products.map((item) => (
            <div key={item.id} className="mobile-product-card">
              <div className="mobile-card-top">
                <div>
                  <span className="sku-tag">{item.sku}</span>
                  <h4 style={{ margin: '0.35rem 0 0.2rem', color: '#f8fafc', fontSize: '1rem' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {item.category} • {item.unit}
                  </span>
                </div>
                <div>
                  {item.is_active ? (
                    <span className="badge badge-active">Active</span>
                  ) : (
                    <span className="badge badge-inactive">Inactive</span>
                  )}
                </div>
              </div>

              <div className="mobile-card-details">
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Stock</span>
                  {getStockStatus(item.stock_quantity, item.reorder_level)}
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Selling Price</span>
                  <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                    LKR {Number(item.selling_price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Cost Price</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    LKR {Number(item.cost_price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Reorder At</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {Number(item.reorder_level)} {item.unit}
                  </span>
                </div>
              </div>

              <div className="mobile-card-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onToggleStatus(item)}
                  title={item.is_active ? 'Deactivate' : 'Activate'}
                  style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onEdit(item)}
                  title="Edit"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-icon danger"
                  onClick={() => setProductToDelete(item)}
                  title="Delete"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setProductToDelete(null); }}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }} role="dialog">
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--color-danger)' }}>Confirm Deletion</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete <strong>{productToDelete.name}</strong> (<code>{productToDelete.sku}</code>)?
              </p>
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  fontSize: '0.8rem',
                  color: '#991b1b'
                }}
              >
                Note: If this product has recorded sales history, database integrity rules prevent deletion. You should deactivate it instead.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList;
