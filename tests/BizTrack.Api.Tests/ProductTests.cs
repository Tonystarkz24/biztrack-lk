using BizTrack.Api.Controllers;
using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BizTrack.Api.Tests;

public class ProductTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateProduct_WithValidData_ReturnsCreatedProduct()
    {
        using var context = GetInMemoryDbContext();
        var controller = new ProductsController(context);

        var dto = new CreateProductDto
        {
            Sku = "TEST-001",
            Name = "Test Biscuit",
            Category = "Confectionery",
            Unit = "pack",
            CostPrice = 100m,
            SellingPrice = 150m,
            StockQuantity = 50m,
            ReorderLevel = 10m
        };

        var result = await controller.CreateProduct(dto);

        var createdAtAction = Assert.IsType<CreatedAtActionResult>(result.Result);
        var product = Assert.IsType<ProductDto>(createdAtAction.Value);
        Assert.Equal("TEST-001", product.Sku);
        Assert.Equal("Test Biscuit", product.Name);
        Assert.False(product.IsLowStock);
    }

    [Fact]
    public async Task CreateProduct_WithDuplicateSku_ReturnsBadRequest()
    {
        using var context = GetInMemoryDbContext();
        context.Products.Add(new Product
        {
            Sku = "DUP-001",
            Name = "Original Item",
            Category = "Staples",
            Unit = "kg",
            CostPrice = 50m,
            SellingPrice = 80m,
            StockQuantity = 20m
        });
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);
        var dto = new CreateProductDto
        {
            Sku = "dup-001", // case-insensitive check
            Name = "Duplicate Item",
            Category = "Staples",
            Unit = "kg"
        };

        var result = await controller.CreateProduct(dto);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task AdjustStock_ReducesStockCorrectly_WhenSufficientStockExists()
    {
        using var context = GetInMemoryDbContext();
        var product = new Product
        {
            Sku = "ADJ-001",
            Name = "Soap",
            Category = "Personal Care",
            Unit = "bar",
            CostPrice = 100m,
            SellingPrice = 130m,
            StockQuantity = 25m,
            ReorderLevel = 5m
        };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);
        var result = await controller.AdjustStock(product.Id, new StockAdjustmentDto { AdjustmentAmount = -10m });

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updated = Assert.IsType<ProductDto>(okResult.Value);
        Assert.Equal(15m, updated.StockQuantity);
    }

    [Fact]
    public async Task AdjustStock_ReturnsBadRequest_WhenReductionExceedsAvailableStock()
    {
        using var context = GetInMemoryDbContext();
        var product = new Product
        {
            Sku = "LOW-001",
            Name = "Water",
            Category = "Beverages",
            Unit = "bottle",
            CostPrice = 50m,
            SellingPrice = 80m,
            StockQuantity = 5m,
            ReorderLevel = 10m
        };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var controller = new ProductsController(context);
        var result = await controller.AdjustStock(product.Id, new StockAdjustmentDto { AdjustmentAmount = -10m });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
