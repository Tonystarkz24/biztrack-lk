import { useState } from "react";
import SaleItemRow from "./SaleItemRow";
import SaleSummary from "./SaleSummary";
import salesService from "../../services/salesService";

function SaleForm({ products, loadingProducts, onSaleCreated, showNotification }) {
  const [cartItems, setCartItems]             = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity]               = useState(1);
  const [customerName, setCustomerName]       = useState("");
  const [paymentMethod, setPaymentMethod]     = useState("cash");
  const [submitting, setSubmitting]           = useState(false);

  // Products not yet in cart and still in stock
  const available = products.filter(
    p => p.is_active && Number(p.stock_quantity) > 0 && !cartItems.find(c => String(c.productId) === String(p.id))
  );

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => String(p.id) === String(selectedProductId));
    if (!product) return;
    const qty = Number(quantity);
    if (qty <= 0) { showNotification("Quantity must be greater than zero", "error"); return; }
    const availableStock = Number(product.stock_quantity);
    if (qty > availableStock) {
      showNotification(`Only ${availableStock} units of "${product.name}" are in stock`, "error");
      return;
    }
    const existing = cartItems.find(c => String(c.productId) === String(product.id));
    if (existing) {
      if (existing.quantity + qty > availableStock) {
        showNotification(`Cannot add ${qty} more. Only ${availableStock} total units in stock.`, "error");
        return;
      }
      setCartItems(cartItems.map(c =>
        String(c.productId) === String(product.id) ? { ...c, quantity: c.quantity + qty } : c
      ));
    } else {
      setCartItems([...cartItems, {
        productId:      product.id,
        name:           product.name,
        sellingPrice:   parseFloat(product.selling_price),
        quantity:       qty,
        availableStock: availableStock
      }]);
    }
    setSelectedProductId("");
    setQuantity(1);
  };

  const removeFromCart  = (pid) => setCartItems(cartItems.filter(c => String(c.productId) !== String(pid)));
  const updateQuantity  = (pid, qty) => {
    const val = Number(qty);
    if (val <= 0) return;
    const item = cartItems.find(c => String(c.productId) === String(pid));
    if (item && val > item.availableStock) {
      showNotification(`Only ${item.availableStock} units available for ${item.name}`, "error");
      return;
    }
    setCartItems(cartItems.map(c => String(c.productId) === String(pid) ? { ...c, quantity: val } : c));
  };

  const estimatedTotal = cartItems.reduce((s, c) => s + c.sellingPrice * c.quantity, 0);

  const handleSubmit = async () => {
    if (cartItems.length === 0) { showNotification("Please add at least one item", "error"); return; }
    setSubmitting(true);
    try {
      await salesService.createSale({
        customerName:  customerName.trim() || null,
        paymentMethod,
        items: cartItems.map(c => ({ productId: Number(c.productId), quantity: c.quantity }))
      });
      setCartItems([]);
      setCustomerName("");
      setPaymentMethod("cash");
      onSaleCreated();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to record sale. Please try again.";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sale-form">
      <h2 className="panel-title">New Sale</h2>

      {/* Customer name */}
      <div className="form-group">
        <label className="form-label">
          Customer Name <span className="optional">(optional)</span>
        </label>
        <input
          id="customer-name-input"
          className="form-input"
          type="text"
          placeholder="e.g. Nimal Perera"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
        />
      </div>

      {/* Payment method */}
      <div className="form-group">
        <label className="form-label">Payment Method</label>
        <div className="payment-toggle">
          {[["cash","💵"],["card","💳"],["bank_transfer","🏦"]].map(([m, icon]) => (
            <button
              key={m}
              id={`payment-method-${m}`}
              type="button"
              className={`payment-btn${paymentMethod === m ? " payment-btn--active" : ""}`}
              onClick={() => setPaymentMethod(m)}
            >
              {icon} {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product selector */}
      <div className="form-group">
        <label className="form-label">Add Products</label>
        {loadingProducts ? (
          <div className="loading-text">Loading products&hellip;</div>
        ) : available.length === 0 && cartItems.length === 0 ? (
          <div className="empty-text">No active products with stock available</div>
        ) : (
          <div className="product-selector">
            <select
              id="product-select"
              className="form-input form-input--select"
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
            >
              <option value="">Select a product&hellip;</option>
              {available.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} &mdash; LKR {parseFloat(p.selling_price).toFixed(2)} (Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
            <div className="qty-row">
              <div className="qty-control">
                <button type="button" className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}>&#8722;</button>
                <input
                  id="product-quantity-input"
                  className="qty-input"
                  type="number" min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                />
                <button type="button" className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button
                id="add-item-btn"
                type="button"
                className="add-btn"
                onClick={addToCart}
                disabled={!selectedProductId}
              >Add Item</button>
            </div>
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="cart-section">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart__icon">&#128722;</span>
            <p>No items added yet</p>
          </div>
        ) : (
          <div className="cart-items">
            {cartItems.map(item => (
              <SaleItemRow
                key={item.productId}
                item={item}
                onRemove={removeFromCart}
                onQuantityChange={updateQuantity}
              />
            ))}
          </div>
        )}
      </div>

      <SaleSummary
        total={estimatedTotal}
        itemCount={cartItems.length}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

export default SaleForm;
