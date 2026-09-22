using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizTrack.Api.Models;

[Table("sales")]
public class Sale
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("sold_at")]
    public DateTime SoldAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    [Column("customer_name")]
    public string? CustomerName { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("payment_method")]
    public string PaymentMethod { get; set; } = "cash";

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "completed";

    [Column("total_amount", TypeName = "numeric(12,2)")]
    public decimal TotalAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<SaleItem> Items { get; set; } = new();
}

[Table("sale_items")]
public class SaleItem
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("sale_id")]
    public long SaleId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("quantity", TypeName = "numeric(12,3)")]
    public decimal Quantity { get; set; }

    [Column("unit_price", TypeName = "numeric(12,2)")]
    public decimal UnitPrice { get; set; }

    [Column("unit_cost", TypeName = "numeric(12,2)")]
    public decimal UnitCost { get; set; }

    [Column("line_total", TypeName = "numeric(12,2)")]
    public decimal LineTotal { get; set; }

    [ForeignKey(nameof(SaleId))]
    public Sale? Sale { get; set; }

    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }
}
