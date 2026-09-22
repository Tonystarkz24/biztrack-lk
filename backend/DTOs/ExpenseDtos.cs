using System.ComponentModel.DataAnnotations;

namespace BizTrack.Api.DTOs;

public class ExpenseDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string ExpenseDate { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateExpenseDto
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 999999999.99)]
    public decimal Amount { get; set; }

    public string? ExpenseDate { get; set; }

    public string? Note { get; set; }
}

public class UpdateExpenseDto
{
    [MaxLength(100)]
    public string? Title { get; set; }

    [MaxLength(30)]
    public string? Category { get; set; }

    [Range(0.01, 999999999.99)]
    public decimal? Amount { get; set; }

    public string? ExpenseDate { get; set; }

    public string? Note { get; set; }
}

public class ExpenseSummaryDto
{
    public decimal TotalAmount { get; set; }
    public int TotalCount { get; set; }
    public Dictionary<string, decimal> ByCategory { get; set; } = new();
}
