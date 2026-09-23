using System.Security.Claims;
using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using BizTrack.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/agent/workflows")]
public class AgentWorkflowsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAgentWorkflowEngine _engine;

    public AgentWorkflowsController(AppDbContext context, IAgentWorkflowEngine engine)
    {
        _context = context;
        _engine = engine;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentWorkflowDto>>> GetWorkflows()
    {
        var workflows = await _context.AgentWorkflows
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => ToDto(w))
            .ToListAsync();

        return Ok(workflows);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<AgentWorkflowDto>> GetWorkflow(long id)
    {
        var workflow = await _context.AgentWorkflows
            .Include(w => w.ExecutionLogs)
            .Include(w => w.Approvals)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow == null)
        {
            return NotFound(new { message = $"Workflow with ID {id} not found." });
        }

        return Ok(ToDto(workflow));
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.InventoryManager}")]
    public async Task<ActionResult<AgentWorkflowDto>> InitiateWorkflow([FromBody] InitiateWorkflowRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Objective))
        {
            return BadRequest(new { message = "Objective is required to initiate an agent workflow." });
        }

        var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity?.Name ?? "authorized_user";
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? dto.RequesterRole ?? UserRoles.InventoryManager;

        var workflow = await _engine.RunWorkflowAsync(dto.Objective.Trim(), username, role);

        return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, ToDto(workflow));
    }

    [HttpPost("{id:long}/decision")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<AgentWorkflowDto>> ProcessDecision(long id, [FromBody] WorkflowDecisionRequestDto dto)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized(new { message = "Valid admin identity claim is required to sign off on workflows." });
        }

        try
        {
            var workflow = await _engine.ProcessApprovalDecisionAsync(id, username, dto.Decision, dto.Note);
            return Ok(ToDto(workflow));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("~/api/agent/inventory-audit")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.InventoryManager}")]
    public async Task<IActionResult> GetInventoryAudit()
    {
        var result = await _engine.GetInventoryAuditQuickAsync();
        return Ok(result);
    }

    [HttpGet("~/api/agent/sales-demand")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Cashier}")]
    public async Task<IActionResult> GetSalesDemand()
    {
        var result = await _engine.GetSalesDemandQuickAsync();
        return Ok(result);
    }

    [HttpGet("~/api/agent/procurement-estimate")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<IActionResult> GetProcurementEstimate()
    {
        var result = await _engine.GetProcurementEstimateQuickAsync();
        return Ok(result);
    }

    private static AgentWorkflowDto ToDto(AgentWorkflow w) => new()
    {
        Id = w.Id,
        WorkflowCode = w.WorkflowCode,
        Objective = w.Objective,
        Status = w.Status,
        RequesterRole = w.RequesterRole,
        RequesterUsername = w.RequesterUsername,
        PlanSummary = w.PlanSummary,
        RiskLevel = w.RiskLevel,
        RequiresHumanApproval = w.RequiresHumanApproval,
        FinalOutcome = w.FinalOutcome,
        CreatedAt = w.CreatedAt,
        UpdatedAt = w.UpdatedAt,
        ExecutionLogs = w.ExecutionLogs.OrderBy(l => l.StepNumber).Select(l => new ExecutionLogDto
        {
            Id = l.Id,
            StepNumber = l.StepNumber,
            AgentRole = l.AgentRole,
            ToolName = l.ToolName,
            ToolInput = l.ToolInput,
            ToolOutput = l.ToolOutput,
            ValidationResult = l.ValidationResult,
            CreatedAt = l.CreatedAt
        }).ToList(),
        Approvals = w.Approvals.OrderByDescending(a => a.DecidedAt).Select(a => new WorkflowApprovalDto
        {
            Id = a.Id,
            ApproverUsername = a.ApproverUsername,
            Decision = a.Decision,
            DecisionNote = a.DecisionNote,
            DecidedAt = a.DecidedAt
        }).ToList()
    };
}
