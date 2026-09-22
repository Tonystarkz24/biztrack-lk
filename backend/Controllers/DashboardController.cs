using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] string? date)
    {
        DateOnly? targetDate = null;
        if (!string.IsNullOrWhiteSpace(date) && DateOnly.TryParse(date, out var parsedDate))
        {
            targetDate = parsedDate;
        }

        // 1. Sales & COGS
        var salesQuery = _context.Sales.Where(s => s.Status == "completed");
        if (targetDate.HasValue)
        {
            var startUtc = targetDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var endUtc = targetDate.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            salesQuery = salesQuery.Where(s => s.SoldAt >= startUtc && s.SoldAt <= endUtc);
        }

        var totalRevenue = await salesQuery.SumAsync(s => (decimal?)s.TotalAmount) ?? 0m;
        var totalOrders = await salesQuery.CountAsync();

        // COGS query
        var saleItemsQuery = _context.SaleItems.Where(si => si.Sale != null && si.Sale.Status == "completed");
        if (targetDate.HasValue)
        {
            var startUtc = targetDate.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var endUtc = targetDate.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
            saleItemsQuery = saleItemsQuery.Where(si => si.Sale!.SoldAt >= startUtc && si.Sale.SoldAt <= endUtc);
        }
        var totalCogs = await saleItemsQuery.SumAsync(si => (decimal?)(si.Quantity * si.UnitCost)) ?? 0m;

        // 2. Expenses
        var expensesQuery = _context.Expenses.AsQueryable();
        if (targetDate.HasValue)
        {
            expensesQuery = expensesQuery.Where(e => e.ExpenseDate == targetDate.Value);
        }
        var totalExpenses = await expensesQuery.SumAsync(e => (decimal?)e.Amount) ?? 0m;

        // 3. Products
        var activeProductsCount = await _context.Products.CountAsync(p => p.IsActive);
        var lowStockList = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= p.ReorderLevel)
            .OrderBy(p => p.StockQuantity)
            .Take(10)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = p.Name,
                Category = p.Category,
                Unit = p.Unit,
                CostPrice = p.CostPrice,
                SellingPrice = p.SellingPrice,
                StockQuantity = p.StockQuantity,
                ReorderLevel = p.ReorderLevel,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();

        // 4. Recent Sales
        var recentSales = await _context.Sales
            .Include(s => s.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(s => s.SoldAt)
            .Take(5)
            .Select(s => new SaleDto
            {
                Id = s.Id,
                SoldAt = s.SoldAt,
                CustomerName = s.CustomerName,
                PaymentMethod = s.PaymentMethod,
                Status = s.Status,
                TotalAmount = s.TotalAmount,
                CreatedAt = s.CreatedAt,
                Items = s.Items.Select(i => new SaleItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product != null ? i.Product.Name : "",
                    ProductSku = i.Product != null ? i.Product.Sku : "",
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    UnitCost = i.UnitCost,
                    LineTotal = i.LineTotal
                }).ToList()
            })
            .ToListAsync();

        // 5. Recent Expenses
        var recentExpenses = await _context.Expenses
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.CreatedAt)
            .Take(5)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                Title = e.Title,
                Category = e.Category,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate.ToString("yyyy-MM-dd"),
                Note = e.Note,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                revenue = totalRevenue,
                costOfGoodsSold = totalCogs,
                grossProfit = totalRevenue - totalCogs,
                expenses = totalExpenses,
                estimatedProfit = totalRevenue - totalCogs - totalExpenses,
                activeProducts = activeProductsCount,
                lowStockProducts = lowStockList.Count,
                recentSales = recentSales,
                recentExpenses = recentExpenses,
                lowStockItems = lowStockList
            }
        });
    }
}
