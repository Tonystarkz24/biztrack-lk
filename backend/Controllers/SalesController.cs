using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales([FromQuery] int limit = 50)
    {
        var sales = await _context.Sales
            .Include(s => s.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(s => s.SoldAt)
            .Take(Math.Clamp(limit, 1, 200))
            .Select(s => ToDto(s))
            .ToListAsync();

        return Ok(sales);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<SaleDto>> GetSale(long id)
    {
        var sale = await _context.Sales
            .Include(s => s.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null)
        {
            return NotFound(new { message = $"Sale with ID {id} not found." });
        }

        return Ok(ToDto(sale));
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> CreateSale([FromBody] CreateSaleDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one sale item is required." });
        }

        // Execute sale and inventory decrement within an atomic database transaction
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            decimal calculatedTotal = 0;
            var saleItems = new List<SaleItem>();

            foreach (var itemDto in dto.Items)
            {
                var product = await _context.Products.FindAsync(itemDto.ProductId);
                if (product == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = $"Product with ID {itemDto.ProductId} not found." });
                }

                if (!product.IsActive)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = $"Product '{product.Name}' is inactive and cannot be sold." });
                }

                if (product.StockQuantity < itemDto.Quantity)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new
                    {
                        message = $"Insufficient stock for '{product.Name}'. Requested {itemDto.Quantity} {product.Unit}, but only {product.StockQuantity} available."
                    });
                }

                // Deduct stock
                product.StockQuantity -= itemDto.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                var unitPrice = itemDto.UnitPrice ?? product.SellingPrice;
                var lineTotal = Math.Round(itemDto.Quantity * unitPrice, 2);
                calculatedTotal += lineTotal;

                saleItems.Add(new SaleItem
                {
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = unitPrice,
                    UnitCost = product.CostPrice,
                    LineTotal = lineTotal
                });
            }

            var sale = new Sale
            {
                SoldAt = DateTime.UtcNow,
                CustomerName = string.IsNullOrWhiteSpace(dto.CustomerName) ? "Walk-in Customer" : dto.CustomerName.Trim(),
                PaymentMethod = dto.PaymentMethod.ToLowerInvariant(),
                Status = "completed",
                TotalAmount = calculatedTotal,
                CreatedAt = DateTime.UtcNow,
                Items = saleItems
            };

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload sale with product details for response
            var createdSale = await _context.Sales
                .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                .FirstAsync(s => s.Id == sale.Id);

            return CreatedAtAction(nameof(GetSale), new { id = createdSale.Id }, ToDto(createdSale));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "An error occurred while recording the sale.", error = ex.Message });
        }
    }

    private static SaleDto ToDto(Sale s) => new()
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
            ProductName = i.Product?.Name ?? $"Product #{i.ProductId}",
            ProductSku = i.Product?.Sku ?? "",
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            UnitCost = i.UnitCost,
            LineTotal = i.LineTotal
        }).ToList()
    };
}
