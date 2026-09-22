namespace BizTrack.Api.DTOs;

public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalCostOfGoodsSold { get; set; }
    public decimal GrossProfit => TotalRevenue - TotalCostOfGoodsSold;
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit => GrossProfit - TotalExpenses;
    public int ActiveProductsCount { get; set; }
    public int LowStockProductsCount { get; set; }
    public int TotalOrdersCount { get; set; }

    public List<ProductDto> LowStockProducts { get; set; } = new();
    public List<SaleDto> RecentSales { get; set; } = new();
    public List<ExpenseDto> RecentExpenses { get; set; } = new();
}
