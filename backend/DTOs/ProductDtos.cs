using System.ComponentModel.DataAnnotations;

namespace BizTrack.Api.DTOs;

public class ProductDto
{
    public long Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal StockQuantity { get; set; }
    public decimal ReorderLevel { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock => StockQuantity <= ReorderLevel;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductDto
{
    [Required]
    [MaxLength(30)]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Unit { get; set; } = "pcs";

    [Range(0, 999999999.99)]
    public decimal CostPrice { get; set; }

    [Range(0, 999999999.99)]
    public decimal SellingPrice { get; set; }

    [Range(0, 999999999.999)]
    public decimal StockQuantity { get; set; } = 0;

    [Range(0, 999999999.999)]
    public decimal ReorderLevel { get; set; } = 5;

    public bool IsActive { get; set; } = true;
}

public class UpdateProductDto
{
    [MaxLength(30)]
    public string? Sku { get; set; }

    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [MaxLength(20)]
    public string? Unit { get; set; }

    [Range(0, 999999999.99)]
    public decimal? CostPrice { get; set; }

    [Range(0, 999999999.99)]
    public decimal? SellingPrice { get; set; }

    [Range(0, 999999999.999)]
    public decimal? StockQuantity { get; set; }

    [Range(0, 999999999.999)]
    public decimal? ReorderLevel { get; set; }

    public bool? IsActive { get; set; }
}

public class StockAdjustmentDto
{
    [Required]
    public decimal AdjustmentAmount { get; set; }

    public string? Reason { get; set; }
}
