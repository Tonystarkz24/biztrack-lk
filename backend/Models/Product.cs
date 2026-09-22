using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizTrack.Api.Models;

[Table("products")]
public class Product
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("sku")]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("unit")]
    public string Unit { get; set; } = "pcs";

    [Column("cost_price", TypeName = "numeric(12,2)")]
    public decimal CostPrice { get; set; }

    [Column("selling_price", TypeName = "numeric(12,2)")]
    public decimal SellingPrice { get; set; }

    [Column("stock_quantity", TypeName = "numeric(12,3)")]
    public decimal StockQuantity { get; set; }

    [Column("reorder_level", TypeName = "numeric(12,3)")]
    public decimal ReorderLevel { get; set; } = 5;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
