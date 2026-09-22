using BizTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            // Execute raw SQL to ensure all tables exist safely in PostgreSQL
            const string createTablesSql = @"
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

                CREATE TABLE IF NOT EXISTS sales (
                    id BIGSERIAL PRIMARY KEY,
                    sold_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    customer_name VARCHAR(100) NULL,
                    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer')),
                    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
                    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS sale_items (
                    id BIGSERIAL PRIMARY KEY,
                    sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
                    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
                    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
                    unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
                    line_total NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(quantity * unit_price, 2)) STORED
                );

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

                CREATE TABLE IF NOT EXISTS users (
                    id BIGSERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    role VARCHAR(30) NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS agent_workflows (
                    id BIGSERIAL PRIMARY KEY,
                    workflow_code VARCHAR(50) UNIQUE NOT NULL,
                    objective TEXT NOT NULL,
                    status VARCHAR(30) NOT NULL,
                    requester_role VARCHAR(30) NULL,
                    requester_username VARCHAR(50) NULL,
                    plan_summary TEXT NULL,
                    risk_level VARCHAR(20) DEFAULT 'Low',
                    requires_human_approval BOOLEAN DEFAULT true,
                    final_outcome TEXT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS agent_execution_logs (
                    id BIGSERIAL PRIMARY KEY,
                    workflow_id BIGINT NOT NULL REFERENCES agent_workflows(id) ON DELETE CASCADE,
                    step_number INT NOT NULL,
                    agent_role VARCHAR(50) NOT NULL,
                    tool_name VARCHAR(100) NULL,
                    tool_input TEXT NULL,
                    tool_output TEXT NULL,
                    validation_result TEXT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS workflow_approvals (
                    id BIGSERIAL PRIMARY KEY,
                    workflow_id BIGINT NOT NULL REFERENCES agent_workflows(id) ON DELETE CASCADE,
                    approver_username VARCHAR(50) NOT NULL,
                    decision VARCHAR(20) NOT NULL,
                    decision_note TEXT NULL,
                    decided_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
                CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
                CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at);
                CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
            ";

            await context.Database.ExecuteSqlRawAsync(createTablesSql);
            logger.LogInformation("Database tables verified successfully.");

            // 1. Seed Users (3 distinct roles)
            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new()
                    {
                        Username = "admin",
                        Email = "admin@biztrack.lk",
                        FullName = "System Administrator",
                        Role = UserRoles.Admin,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!")
                    },
                    new()
                    {
                        Username = "manager",
                        Email = "manager@biztrack.lk",
                        FullName = "Inventory Manager",
                        Role = UserRoles.InventoryManager,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!")
                    },
                    new()
                    {
                        Username = "cashier",
                        Email = "cashier@biztrack.lk",
                        FullName = "POS Cashier",
                        Role = UserRoles.Cashier,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cashier123!")
                    }
                };

                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default users (admin, manager, cashier).");
            }

            // 2. Seed Products if empty
            if (!await context.Products.AnyAsync())
            {
                var sampleProducts = new List<Product>
                {
                    new() { Sku = "RIC-SAM-001", Name = "Samba Rice", Category = "Grains & Staples", Unit = "kg", CostPrice = 210.00m, SellingPrice = 250.00m, StockQuantity = 85.0m, ReorderLevel = 20.0m, IsActive = true },
                    new() { Sku = "PUL-MYD-002", Name = "Mysoor Dhal", Category = "Grains & Staples", Unit = "kg", CostPrice = 290.00m, SellingPrice = 340.00m, StockQuantity = 42.5m, ReorderLevel = 15.0m, IsActive = true },
                    new() { Sku = "OIL-WHT-003", Name = "White Coconut Oil", Category = "Oils & Condiments", Unit = "bottle (750ml)", CostPrice = 560.00m, SellingPrice = 680.00m, StockQuantity = 18.0m, ReorderLevel = 10.0m, IsActive = true },
                    new() { Sku = "BEV-BOP-004", Name = "Ceylon BOP Tea Pack", Category = "Beverages", Unit = "pack (400g)", CostPrice = 420.00m, SellingPrice = 520.00m, StockQuantity = 35.0m, ReorderLevel = 12.0m, IsActive = true },
                    new() { Sku = "CAR-SUN-005", Name = "Sunlight Herbal Soap", Category = "Personal Care", Unit = "bar (100g)", CostPrice = 120.00m, SellingPrice = 155.00m, StockQuantity = 4.0m, ReorderLevel = 10.0m, IsActive = true },
                    new() { Sku = "BEV-WTR-006", Name = "Bottled Mineral Water", Category = "Beverages", Unit = "bottle (1L)", CostPrice = 70.00m, SellingPrice = 110.00m, StockQuantity = 60.0m, ReorderLevel = 15.0m, IsActive = true }
                };

                await context.Products.AddRangeAsync(sampleProducts);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded sample Sri Lankan products.");
            }

            // 3. Seed Expenses if empty
            if (!await context.Expenses.AnyAsync())
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var sampleExpenses = new List<Expense>
                {
                    new() { Title = "Shop Electricity Bill", Category = "Electricity", Amount = 14850.00m, ExpenseDate = today, Note = "Monthly CEB electricity bill for retail shop" },
                    new() { Title = "Shop Premises Rent", Category = "Rent", Amount = 45000.00m, ExpenseDate = today, Note = "Shop monthly rent payment" },
                    new() { Title = "Stock Delivery & Transport", Category = "Transport", Amount = 5500.00m, ExpenseDate = today, Note = "Three-wheeler transport fee for market wholesale goods" }
                };

                await context.Expenses.AddRangeAsync(sampleExpenses);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded sample expenses.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }
}
