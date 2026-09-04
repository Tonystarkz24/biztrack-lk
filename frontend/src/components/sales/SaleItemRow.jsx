// SaleItemRow – one row inside the current-sale basket
function SaleItemRow({ item, onRemove, onQuantityChange }) {
  const subtotal = item.sellingPrice * item.quantity;

  return (
    <div className="sale-item-row">
      <div className="sale-item-row__info">
        <span className="sale-item-row__name">{item.name}</span>
        <span className="sale-item-row__price">LKR {item.sellingPrice.toFixed(2)} each</span>
      </div>

      <div className="sale-item-row__controls">
        <div className="qty-control">
          <button
            type="button"
            className="qty-btn"
            onClick={() => item.quantity > 1 && onQuantityChange(item.productId, item.quantity - 1)}
          >&#8722;</button>
          <input
            className="qty-input"
            type="number"
            min="1"
            value={item.quantity}
            onChange={e => onQuantityChange(item.productId, Math.max(1, Number(e.target.value)))}
          />
          <button
            type="button"
            className="qty-btn"
            onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
          >+</button>
        </div>
        <span className="sale-item-row__subtotal">LKR {subtotal.toFixed(2)}</span>
        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove(item.productId)}
          title="Remove"
        >&times;</button>
      </div>
    </div>
  );
}

export default SaleItemRow;
