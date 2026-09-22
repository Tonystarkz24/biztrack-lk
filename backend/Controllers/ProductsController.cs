using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] bool? isActive)
    {
        var query = _context.Products.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || p.Sku.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            var catLower = category.Trim().ToLower();
            query = query.Where(p => p.Category.ToLower() == catLower);
        }

        var products = await query
            .OrderBy(p => p.Name)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductDto>> GetProduct(long id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} not found." });
        }

        return Ok(ToDto(product));
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStock()
    {
        var products = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= p.ReorderLevel)
            .OrderBy(p => p.StockQuantity)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        if (await _context.Products.AnyAsync(p => p.Sku.ToLower() == dto.Sku.Trim().ToLower()))
        {
            return BadRequest(new { message = $"A product with SKU '{dto.Sku}' already exists." });
        }

        var product = new Product
        {
            Sku = dto.Sku.Trim().ToUpperInvariant(),
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            Unit = dto.Unit.Trim(),
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            StockQuantity = dto.StockQuantity,
            ReorderLevel = dto.ReorderLevel,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, ToDto(product));
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(long id, [FromBody] UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} not found." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Sku) && dto.Sku.Trim().ToLower() != product.Sku.ToLower())
        {
            if (await _context.Products.AnyAsync(p => p.Sku.ToLower() == dto.Sku.Trim().ToLower() && p.Id != id))
            {
                return BadRequest(new { message = $"A product with SKU '{dto.Sku}' already exists." });
            }
            product.Sku = dto.Sku.Trim().ToUpperInvariant();
        }

        if (!string.IsNullOrWhiteSpace(dto.Name)) product.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Category)) product.Category = dto.Category.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Unit)) product.Unit = dto.Unit.Trim();
        if (dto.CostPrice.HasValue) product.CostPrice = dto.CostPrice.Value;
        if (dto.SellingPrice.HasValue) product.SellingPrice = dto.SellingPrice.Value;
        if (dto.StockQuantity.HasValue) product.StockQuantity = dto.StockQuantity.Value;
        if (dto.ReorderLevel.HasValue) product.ReorderLevel = dto.ReorderLevel.Value;
        if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ToDto(product));
    }

    [HttpPost("{id:long}/adjust-stock")]
    public async Task<ActionResult<ProductDto>> AdjustStock(long id, [FromBody] StockAdjustmentDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} not found." });
        }

        var newQty = product.StockQuantity + dto.AdjustmentAmount;
        if (newQty < 0)
        {
            return BadRequest(new { message = $"Cannot reduce stock by {dto.AdjustmentAmount}. Available stock is {product.StockQuantity}." });
        }

        product.StockQuantity = newQty;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ToDto(product));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteProduct(long id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Product with ID {id} not found." });
        }

        // Soft delete toggle
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Product '{product.Name}' has been deactivated.", product = ToDto(product) });
    }

    private static ProductDto ToDto(Product p) => new()
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
    };
}
