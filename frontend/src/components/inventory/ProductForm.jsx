import React, { useState, useEffect } from 'react';

const COMMON_CATEGORIES = [
  'Grains & Staples',
  'Beverages',
  'Oils & Condiments',
  'Personal Care',
  'Snacks & Confectionery',
  'Dairy & Eggs',
  'Household',
  'Bakery',
  'Other'
];

const COMMON_UNITS = [
  'kg',
  'g',
  'litre',
  'ml',
  'bottle (750ml)',
  'bottle (1L)',
  'pack (400g)',
  'bar (100g)',
  'pcs',
  'box',
  'tin'
];

function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  availableCategories = []
}) {
  const isEdit = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    customCategory: '',
    unit: 'kg',
    cost_price: '',
    selling_price: '',
    stock_quantity: '0',
    reorder_level: '5',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form when product changes or modal opens
  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        customCategory: '',
        unit: product.unit || 'kg',
        cost_price: product.cost_price !== undefined ? String(product.cost_price) : '',
        selling_price: product.selling_price !== undefined ? String(product.selling_price) : '',
        stock_quantity: product.stock_quantity !== undefined ? String(product.stock_quantity) : '0',
        reorder_level: product.reorder_level !== undefined ? String(product.reorder_level) : '5',
        is_active: product.is_active !== undefined ? Boolean(product.is_active) : true
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        category: COMMON_CATEGORIES[0],
        customCategory: '',
        unit: 'kg',
        cost_price: '',
        selling_price: '',
        stock_quantity: '0',
        reorder_level: '5',
        is_active: true
      });
    }
    setErrors({});
    setSubmitting(false);
  }, [product, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  // Combine categories
  const categoryOptions = Array.from(
    new Set([...COMMON_CATEGORIES, ...availableCategories])
  );

  const validate = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.trim().length > 30) {
      newErrors.sku = 'SKU cannot exceed 30 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    const effectiveCategory = formData.category === '__custom__'
      ? formData.customCategory.trim()
      : formData.category;

    if (!effectiveCategory) {
      newErrors.category = 'Category is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    const cost = Number(formData.cost_price);
    if (formData.cost_price === '' || isNaN(cost) || cost < 0) {
      newErrors.cost_price = 'Cost price must be a valid non-negative number';
    }

    const selling = Number(formData.selling_price);
    if (formData.selling_price === '' || isNaN(selling) || selling < 0) {
      newErrors.selling_price = 'Selling price must be a valid non-negative number';
    }

    const stock = Number(formData.stock_quantity);
    if (formData.stock_quantity === '' || isNaN(stock) || stock < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    const reorder = Number(formData.reorder_level);
    if (formData.reorder_level === '' || isNaN(reorder) || reorder < 0) {
      newErrors.reorder_level = 'Reorder level cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        category: formData.category === '__custom__' ? formData.customCategory.trim() : formData.category,
        unit: formData.unit.trim(),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock_quantity: parseFloat(formData.stock_quantity || 0),
        reorder_level: parseFloat(formData.reorder_level || 5),
        is_active: formData.is_active
      };

      await onSubmit(payload);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save product';
      setErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate profit margin indicator
  const costVal = parseFloat(formData.cost_price);
  const sellVal = parseFloat(formData.selling_price);
  const hasValidPrices = !isNaN(costVal) && !isNaN(sellVal) && costVal > 0 && sellVal >= 0;
  const marginPercent = hasValidPrices ? (((sellVal - costVal) / costVal) * 100).toFixed(1) : null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div className="toast-banner error" style={{ marginBottom: '1rem' }}>
                <span>{errors.form}</span>
              </div>
            )}

            <div className="form-grid">
              {/* SKU */}
              <div className="form-group">
                <label className="form-label" htmlFor="sku">
                  SKU Code <span className="required">*</span>
                </label>
                <input
                  id="sku"
                  type="text"
                  className={`form-input ${errors.sku ? 'has-error' : ''}`}
                  placeholder="e.g. RIC-SAM-001"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  disabled={submitting}
                />
                {errors.sku && <span className="form-error">{errors.sku}</span>}
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className={`form-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Samba Rice"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={submitting}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  className={`form-input ${errors.category ? 'has-error' : ''}`}
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter Custom Category</option>
                </select>
                {formData.category === '__custom__' && (
                  <input
                    type="text"
                    style={{ marginTop: '0.5rem' }}
                    className="form-input"
                    placeholder="Type custom category name..."
                    value={formData.customCategory}
                    onChange={(e) => handleChange('customCategory', e.target.value)}
                    disabled={submitting}
                  />
                )}
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              {/* Unit */}
              <div className="form-group">
                <label className="form-label" htmlFor="unit">
                  Measurement Unit <span className="required">*</span>
                </label>
                <input
                  id="unit"
                  type="text"
                  list="units-datalist"
                  className={`form-input ${errors.unit ? 'has-error' : ''}`}
                  placeholder="e.g. kg, bottle (750ml)"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  disabled={submitting}
                />
                <datalist id="units-datalist">
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                {errors.unit && <span className="form-error">{errors.unit}</span>}
              </div>

              {/* Cost Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="cost_price">
                  Cost Price (LKR) <span className="required">*</span>
                </label>
                <input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.cost_price ? 'has-error' : ''}`}
                  placeholder="0.00"
                  value={formData.cost_price}
                  onChange={(e) => handleChange('cost_price', e.target.value)}
                  disabled={submitting}
                />
                {errors.cost_price && <span className="form-error">{errors.cost_price}</span>}
              </div>

              {/* Selling Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="selling_price">
                  Selling Price (LKR) <span className="required">*</span>
                </label>
                <input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.selling_price ? 'has-error' : ''}`}
                  placeholder="0.00"
                  value={formData.selling_price}
                  onChange={(e) => handleChange('selling_price', e.target.value)}
                  disabled={submitting}
                />
                {errors.selling_price && <span className="form-error">{errors.selling_price}</span>}
              </div>

              {/* Profit Margin Preview */}
              {hasValidPrices && (
                <div className="margin-preview">
                  💡 Estimated Markup: <strong>{marginPercent}%</strong> (LKR {(sellVal - costVal).toFixed(2)} profit per {formData.unit || 'unit'})
                </div>
              )}

              {/* Stock Quantity */}
              <div className="form-group">
                <label className="form-label" htmlFor="stock_quantity">
                  Current Stock Quantity
                </label>
                <input
                  id="stock_quantity"
                  type="number"
                  step="0.001"
                  min="0"
                  className={`form-input ${errors.stock_quantity ? 'has-error' : ''}`}
                  placeholder="0.000"
                  value={formData.stock_quantity}
                  onChange={(e) => handleChange('stock_quantity', e.target.value)}
                  disabled={submitting}
                />
                {errors.stock_quantity && <span className="form-error">{errors.stock_quantity}</span>}
              </div>

              {/* Reorder Level */}
              <div className="form-group">
                <label className="form-label" htmlFor="reorder_level">
                  Reorder Level Alert
                </label>
                <input
                  id="reorder_level"
                  type="number"
                  step="0.001"
                  min="0"
                  className={`form-input ${errors.reorder_level ? 'has-error' : ''}`}
                  placeholder="5.000"
                  value={formData.reorder_level}
                  onChange={(e) => handleChange('reorder_level', e.target.value)}
                  disabled={submitting}
                />
                {errors.reorder_level && <span className="form-error">{errors.reorder_level}</span>}
              </div>

              {/* Is Active status */}
              <div className="form-group full-width" style={{ marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    disabled={submitting}
                    style={{ width: '18px', height: '18px', accentColor: '#38bdf8' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>
                    Active Product (available for catalog operations)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
