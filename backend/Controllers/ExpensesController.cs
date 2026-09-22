using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExpensesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses(
        [FromQuery] string? category,
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        var query = _context.Expenses.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            var catLower = category.Trim().ToLower();
            query = query.Where(e => e.Category.ToLower() == catLower);
        }

        if (DateOnly.TryParse(startDate, out var parsedStartDate))
        {
            query = query.Where(e => e.ExpenseDate >= parsedStartDate);
        }

        if (DateOnly.TryParse(endDate, out var parsedEndDate))
        {
            query = query.Where(e => e.ExpenseDate <= parsedEndDate);
        }

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.CreatedAt)
            .Select(e => ToDto(e))
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(long id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(new { message = $"Expense with ID {id} not found." });
        }

        return Ok(ToDto(expense));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ExpenseSummaryDto>> GetSummary(
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        var query = _context.Expenses.AsQueryable();

        if (DateOnly.TryParse(startDate, out var parsedStartDate))
        {
            query = query.Where(e => e.ExpenseDate >= parsedStartDate);
        }

        if (DateOnly.TryParse(endDate, out var parsedEndDate))
        {
            query = query.Where(e => e.ExpenseDate <= parsedEndDate);
        }

        var expenses = await query.ToListAsync();

        var summary = new ExpenseSummaryDto
        {
            TotalAmount = expenses.Sum(e => e.Amount),
            TotalCount = expenses.Count,
            ByCategory = expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount))
        };

        return Ok(summary);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        var expenseDate = DateOnly.FromDateTime(DateTime.UtcNow);
        if (!string.IsNullOrWhiteSpace(dto.ExpenseDate) && DateOnly.TryParse(dto.ExpenseDate, out var parsedDate))
        {
            expenseDate = parsedDate;
        }

        var expense = new Expense
        {
            Title = dto.Title.Trim(),
            Category = dto.Category.Trim(),
            Amount = dto.Amount,
            ExpenseDate = expenseDate,
            Note = dto.Note?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, ToDto(expense));
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(long id, [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(new { message = $"Expense with ID {id} not found." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Title)) expense.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Category)) expense.Category = dto.Category.Trim();
        if (dto.Amount.HasValue) expense.Amount = dto.Amount.Value;
        if (!string.IsNullOrWhiteSpace(dto.ExpenseDate) && DateOnly.TryParse(dto.ExpenseDate, out var parsedDate))
        {
            expense.ExpenseDate = parsedDate;
        }
        if (dto.Note != null) expense.Note = dto.Note.Trim();

        expense.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ToDto(expense));
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteExpense(long id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(new { message = $"Expense with ID {id} not found." });
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Expense '{expense.Title}' deleted successfully." });
    }

    private static ExpenseDto ToDto(Expense e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        Category = e.Category,
        Amount = e.Amount,
        ExpenseDate = e.ExpenseDate.ToString("yyyy-MM-dd"),
        Note = e.Note,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };
}
