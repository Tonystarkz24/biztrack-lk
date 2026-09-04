// SaleSummary – running total + submit button
function SaleSummary({ total, itemCount, onSubmit, submitting }) {
  return (
    <div className="sale-summary">
      <div className="sale-summary__row">
        <span>Items in basket</span>
        <span>{itemCount}</span>
      </div>
      <div className="sale-summary__divider" />
      <div className="sale-summary__total-row">
        <span>Estimated Total</span>
        <span className="sale-summary__total">LKR {total.toFixed(2)}</span>
      </div>
      <p className="sale-summary__note">&#42; Final total confirmed by the server</p>
      <button
        id="submit-sale-btn"
        type="button"
        className="submit-btn"
        onClick={onSubmit}
        disabled={submitting || itemCount === 0}
      >
        {submitting ? (
          <><span className="btn-spinner" /> Processing&hellip;</>
        ) : (
          '\u2713 Record Sale'
        )}
      </button>
    </div>
  );
}

export default SaleSummary;
