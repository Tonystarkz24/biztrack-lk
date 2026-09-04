import { useState, useEffect } from "react";
import salesService from "../../services/salesService";

function SaleDetailsModal({ saleId, onClose, onCancelled, showNotification }) {
  const [sale, setSale]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    salesService.getSaleById(saleId)
      .then(res => { if (active) setSale(res.data); })
      .catch(() => {
        if (active) { showNotification("Failed to load sale details", "error"); onClose(); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [saleId]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this sale? Stock will be fully restored.")) return;
    setCancelling(true);
    try {
      await salesService.cancelSale(saleId);
      onCancelled();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel sale";
      showNotification(msg, "error");
    } finally {
      setCancelling(false);
    }
  };

  // Close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div id="sale-details-backdrop" className="modal-backdrop" onClick={onBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Sale Details">
        <div className="modal__header">
          <h2>Sale Details</h2>
          <button id="modal-close-btn" className="modal__close" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading&hellip;</p>
          </div>
        ) : sale ? (
          <div className="modal__body">
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
                <span className="sale-detail-value">{sale.payment_method}</span>
              </div>
              <div className="sale-detail-item">
                <span className="sale-detail-label">Date</span>
                <span className="sale-detail-value">{new Date(sale.created_at).toLocaleString()}</span>
              </div>
              <div className="sale-detail-item">
                <span className="sale-detail-label">Total</span>
                <span className="sale-detail-value sale-detail-value--accent">
                  LKR {parseFloat(sale.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

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
                      <td>{item.quantity}</td>
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

            {sale.status !== "cancelled" && (
              <div className="modal__actions">
                <button
                  id="cancel-sale-btn"
                  className="cancel-sale-btn"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling&hellip;" : "\u2715 Cancel Sale"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SaleDetailsModal;
