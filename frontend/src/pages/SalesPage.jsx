import { useState, useEffect, useCallback, useRef } from "react";
import SaleForm from "../components/sales/SaleForm";
import SalesHistory from "../components/sales/SalesHistory";
import SaleDetailsModal from "../components/sales/SaleDetailsModal";
import salesService from "../services/salesService";
import "../styles/sales.css";

function SalesPage() {
  const [products, setProducts]         = useState([]);
  const [sales, setSales]               = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSales, setLoadingSales]   = useState(true);
  const [notification, setNotification]   = useState(null);
  const [filters, setFilters]             = useState({ date: "", paymentMethod: "", status: "" });
  const notificationTimer = useRef(null);

  const showNotification = useCallback((message, type) => {
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    setNotification({ message, type });
    notificationTimer.current = setTimeout(() => setNotification(null), 4500);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await salesService.getActiveProducts();
      // Support both { data: [] } and plain array responses
      const list = Array.isArray(res) ? res : (res.data || []);
      // Only show active products in the form
      setProducts(list.filter(p => p.is_active));
    } catch {
      showNotification("Failed to load products", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [showNotification]);

  const loadSales = useCallback(async (f) => {
    setLoadingSales(true);
    try {
      const res = await salesService.getSales(f || filters);
      const list = Array.isArray(res) ? res : (res.data || []);
      setSales(list);
    } catch {
      showNotification("Failed to load sales history", "error");
    } finally {
      setLoadingSales(false);
    }
  }, [filters, showNotification]);

  useEffect(() => {
    loadProducts();
    loadSales(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaleCreated = () => {
    showNotification("Sale recorded successfully!", "success");
    loadSales(filters);
    loadProducts();         // refresh stock counts in product selector
  };

  const handleSaleCancelled = () => {
    showNotification("Sale cancelled. Stock has been restored.", "success");
    setSelectedSaleId(null);
    loadSales(filters);
    loadProducts();         // restore stock visible in selector
  };

  const handleSaleUpdated = () => {
    loadSales(filters);
  };

  const handleSaleDeleted = () => {
    setSelectedSaleId(null);
    loadSales(filters);
    loadProducts();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadSales(newFilters);
  };

  return (
    <div className="sales-page">
      {/* Toast notification */}
      {notification && (
        <div
          id="sales-notification"
          className={`notification notification--${notification.type}`}
          role="alert"
        >
          <span>{notification.type === "success" ? "\u2713" : "\u2715"}</span>
          {notification.message}
        </div>
      )}

      <header className="sales-page__header">
        <div>
          <h1 className="sales-page__title">Sales</h1>
          <p className="sales-page__subtitle">Record and manage your sales</p>
        </div>
      </header>

      <div className="sales-page__layout">
        <div className="sales-page__form-panel">
          <SaleForm
            products={products}
            loadingProducts={loadingProducts}
            onSaleCreated={handleSaleCreated}
            showNotification={showNotification}
          />
        </div>
        <div className="sales-page__history-panel">
          <SalesHistory
            sales={sales}
            loading={loadingSales}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewSale={setSelectedSaleId}
          />
        </div>
      </div>

      {selectedSaleId !== null && (
        <SaleDetailsModal
          saleId={selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
          onCancelled={handleSaleCancelled}
          onUpdated={handleSaleUpdated}
          onDeleted={handleSaleDeleted}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

export default SalesPage;
