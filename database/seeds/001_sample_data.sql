-- ============================================================================
-- Seed: 001_sample_data.sql
-- Description: Realistic Sri Lankan sample data for BizTrack LK (Products & Expenses)
-- Note: Safe to execute once (idempotent)
-- ============================================================================

BEGIN;

-- Insert realistic Sri Lankan products
INSERT INTO products (sku, name, category, unit, cost_price, selling_price, stock_quantity, reorder_level, is_active)
VALUES
    ('RIC-SAM-001', 'Samba Rice', 'Grains & Staples', 'kg', 210.00, 250.00, 85.000, 20.000, true),
    ('PUL-MYD-002', 'Mysoor Dhal', 'Grains & Staples', 'kg', 290.00, 340.00, 42.500, 15.000, true),
    ('OIL-WHT-003', 'White Coconut Oil', 'Oils & Condiments', 'bottle (750ml)', 560.00, 680.00, 18.000, 10.000, true),
    ('BEV-BOP-004', 'Ceylon BOP Tea Pack', 'Beverages', 'pack (400g)', 420.00, 520.00, 35.000, 12.000, true),
    ('CAR-SUN-005', 'Sunlight Herbal Soap', 'Personal Care', 'bar (100g)', 120.00, 155.00, 4.000, 10.000, true),
    ('BEV-WTR-006', 'Bottled Mineral Water', 'Beverages', 'bottle (1L)', 70.00, 110.00, 60.000, 15.000, true)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample business expenses (only if not already recorded)
INSERT INTO expenses (title, category, amount, expense_date, note)
SELECT 'Shop Electricity Bill', 'Utilities', 14850.00, CURRENT_DATE, 'Monthly CEB electricity bill for retail shop'
WHERE NOT EXISTS (
    SELECT 1 FROM expenses WHERE title = 'Shop Electricity Bill' AND expense_date = CURRENT_DATE
);

INSERT INTO expenses (title, category, amount, expense_date, note)
SELECT 'Shop Premises Rent', 'Rent', 45000.00, CURRENT_DATE, 'Shop monthly rent payment'
WHERE NOT EXISTS (
    SELECT 1 FROM expenses WHERE title = 'Shop Premises Rent' AND expense_date = CURRENT_DATE
);

INSERT INTO expenses (title, category, amount, expense_date, note)
SELECT 'Stock Delivery & Transport', 'Logistics', 5500.00, CURRENT_DATE, 'Three-wheeler transport fee for market wholesale goods'
WHERE NOT EXISTS (
    SELECT 1 FROM expenses WHERE title = 'Stock Delivery & Transport' AND expense_date = CURRENT_DATE
);

COMMIT;
