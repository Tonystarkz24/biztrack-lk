using System.ComponentModel.DataAnnotations;

namespace BizTrack.Api.DTOs;

public class CreateSaleItemDto
{
    [Required]
    public long ProductId { get; set; }

    [Required]
    [Range(0.001, 999999)]
    public decimal Quantity { get; set; }

    [Range(0, 999999999.99)]
    public decimal? UnitPrice { get; set; }
}

public class CreateSaleDto
{
    [MaxLength(100)]
    public string? CustomerName { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = "cash";

    [Required]
    [MinLength(1, ErrorMessage = "A sale must contain at least one item.")]
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class SaleItemDto
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public decimal LineTotal { get; set; }
}

public class SaleDto
{
    public long Id { get; set; }
    public DateTime SoldAt { get; set; }
    public string? CustomerName { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
}
