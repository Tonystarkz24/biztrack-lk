import { useState, useEffect } from "react";
import salesService from "../../services/salesService";

function SaleDetailsModal({ saleId, onClose, onCancelled, onUpdated, onDeleted, showNotification }) {
  const [sale, setSale]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("cash");
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    salesService.getSaleById(saleId)
      .then(res => {
        if (active && res.data) {
          setSale(res.data);
          setEditCustomerName(res.data.customer_name || "");
          setEditPaymentMethod(res.data.payment_method || "cash");
        }
      })
      .catch(() => {
        if (active) {
          showNotification("Failed to load sale details", "error");
          onClose();
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [saleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (!window.confirm("Cancel this sale? Stock will be fully restored to inventory.")) return;
    setCancelling(true);
    try {
      await salesService.cancelSale(saleId);
      if (onCancelled) onCancelled();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel sale";
      showNotification(msg, "error");
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this sale record? If completed, stock will be restored.")) return;
    setDeleting(true);
    try {
      await salesService.deleteSale(saleId);
      showNotification("Sale deleted successfully", "success");
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete sale";
      showNotification(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await salesService.updateSale(saleId, {
        customerName: editCustomerName.trim() || null,
        paymentMethod: editPaymentMethod
      });
      setSale(prev => ({
        ...prev,
        customer_name: res.data.customer_name,
        payment_method: res.data.payment_method
      }));
      setIsEditing(false);
      showNotification("Sale updated successfully!", "success");
      if (onUpdated) onUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update sale";
      showNotification(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div id="sale-details-backdrop" className="modal-backdrop" onClick={onBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Sale Details">
        <div className="modal__header">
          <h2>Sale Details {sale ? `#${sale.id}` : ""}</h2>
          <button id="modal-close-btn" className="modal__close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading&hellip;</p>
          </div>
        ) : sale ? (
          <div className="modal__body">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="edit-sale-form" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCustomerName}
                    onChange={e => setEditCustomerName(e.target.value)}
                    placeholder="Customer Name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-input form-input--select"
                    value={editPaymentMethod}
                    onChange={e => setEditPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="clear-filters-btn"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="add-btn"
                    style={{ padding: '0.45rem 1rem', maxWidth: '140px' }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="sale-detail-grid">
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Sale ID</span>
                  <span className="sale-detail-value">#{sale.id}</span>
                </div>
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Status</span>
                  <span className={`status-badge status-badge--${sale.status}`}>{sale.status}</span>
                </div>
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Customer</span>
                  <span className="sale-detail-value">{sale.customer_name || "—"}</span>
                </div>
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Payment</span>
                  <span className="sale-detail-value" style={{ textTransform: 'capitalize' }}>
                    {sale.payment_method?.replace('_', ' ')}
                  </span>
                </div>
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Date</span>
                  <span className="sale-detail-value">{new Date(sale.sold_at || sale.created_at).toLocaleString()}</span>
                </div>
                <div className="sale-detail-item">
                  <span className="sale-detail-label">Total</span>
                  <span className="sale-detail-value sale-detail-value--accent">
                    LKR {parseFloat(sale.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(sale.items || []).map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{parseFloat(item.quantity)}</td>
                      <td>LKR {parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>LKR {parseFloat(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>LKR {parseFloat(sale.total_amount).toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="modal__actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!isEditing && (
                  <button
                    type="button"
                    id="edit-sale-btn"
                    className="clear-filters-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit Sale
                  </button>
                )}
                <button
                  type="button"
                  id="delete-sale-btn"
                  className="remove-btn"
                  style={{ border: '1px solid rgba(239,68,68,0.3)', padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '6px' }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "🗑️ Delete Sale"}
                </button>
              </div>

              {sale.status !== "cancelled" && (
                <button
                  id="cancel-sale-btn"
                  className="cancel-sale-btn"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling&hellip;" : "\u2715 Cancel Sale"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SaleDetailsModal;
