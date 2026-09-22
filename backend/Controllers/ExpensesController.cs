using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[Authorize(Roles = $"{UserRoles.Admin},{UserRoles.InventoryManager}")]
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
        [FromQuery] string? endDate,
        [FromQuery] string? sortBy = "expensedate",
        [FromQuery] bool sortDescending = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
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

        var totalCount = await query.CountAsync();

        query = (sortBy?.ToLower()) switch
        {
            "amount" => sortDescending ? query.OrderByDescending(e => e.Amount) : query.OrderBy(e => e.Amount),
            "title" => sortDescending ? query.OrderByDescending(e => e.Title) : query.OrderBy(e => e.Title),
            "category" => sortDescending ? query.OrderByDescending(e => e.Category) : query.OrderBy(e => e.Category),
            _ => sortDescending ? query.OrderByDescending(e => e.ExpenseDate).ThenByDescending(e => e.CreatedAt) : query.OrderBy(e => e.ExpenseDate).ThenBy(e => e.CreatedAt)
        };

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        Response.Headers["X-Total-Count"] = totalCount.ToString();
        Response.Headers["X-Page-Number"] = page.ToString();
        Response.Headers["X-Page-Size"] = pageSize.ToString();
        Response.Headers["X-Total-Pages"] = totalPages.ToString();

        var expenses = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
    [Authorize(Roles = UserRoles.Admin)]
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
    [Authorize(Roles = UserRoles.Admin)]
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
    [Authorize(Roles = UserRoles.Admin)]
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
