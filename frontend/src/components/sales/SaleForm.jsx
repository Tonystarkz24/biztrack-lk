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
    p => p.is_active && p.stock_quantity > 0 && !cartItems.find(c => c.productId === p.id)
  );

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return;
    const qty = Number(quantity);
    if (qty <= 0) { showNotification("Quantity must be greater than zero", "error"); return; }
    if (qty > product.stock_quantity) {
      showNotification(`Only ${product.stock_quantity} units of "${product.name}" are in stock`, "error");
      return;
    }
    const existing = cartItems.find(c => c.productId === product.id);
    if (existing) {
      setCartItems(cartItems.map(c =>
        c.productId === product.id ? { ...c, quantity: c.quantity + qty } : c
      ));
    } else {
      setCartItems([...cartItems, {
        productId:      product.id,
        name:           product.name,
        sellingPrice:   parseFloat(product.selling_price),
        quantity:       qty,
        availableStock: product.stock_quantity
      }]);
    }
    setSelectedProductId("");
    setQuantity(1);
  };

  const removeFromCart  = (pid) => setCartItems(cartItems.filter(c => c.productId !== pid));
  const updateQuantity  = (pid, qty) => {
    if (Number(qty) <= 0) return;
    setCartItems(cartItems.map(c => c.productId === pid ? { ...c, quantity: Number(qty) } : c));
  };

  const estimatedTotal = cartItems.reduce((s, c) => s + c.sellingPrice * c.quantity, 0);

  const handleSubmit = async () => {
    if (cartItems.length === 0) { showNotification("Please add at least one item", "error"); return; }
    setSubmitting(true);
    try {
      await salesService.createSale({
        customerName:  customerName.trim() || null,
        paymentMethod,
        items: cartItems.map(c => ({ productId: c.productId, quantity: c.quantity }))
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
          {[["cash","💵"],["card","💳"],["transfer","🏦"]].map(([m, icon]) => (
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
