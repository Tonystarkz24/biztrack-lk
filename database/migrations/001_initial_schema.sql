-- ============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Shared initial schema for BizTrack LK
-- Tables: products, sales, sale_items, expenses
-- ============================================================================

BEGIN;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL CHECK (cost_price >= 0),
    selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    stock_quantity NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level NUMERIC(12,3) NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    sold_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(100) NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
    line_total NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(quantity * unit_price, 2)) STORED
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE DEFAULT CURRENT_DATE,
    note TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

COMMIT;
