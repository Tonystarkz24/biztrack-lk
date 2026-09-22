using BizTrack.Api.Data;
using BizTrack.Api.DTOs;
using BizTrack.Api.Models;
using BizTrack.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Controllers;

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
    public async Task<ActionResult<AgentWorkflowDto>> InitiateWorkflow([FromBody] InitiateWorkflowRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Objective))
        {
            return BadRequest(new { message = "Objective is required to initiate an agent workflow." });
        }

        var username = User.Identity?.Name ?? "field_staff_mobile";
        var role = dto.RequesterRole ?? "Cashier";

        var workflow = await _engine.RunWorkflowAsync(dto.Objective.Trim(), username, role);

        return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, ToDto(workflow));
    }

    [HttpPost("{id:long}/decision")]
    public async Task<ActionResult<AgentWorkflowDto>> ProcessDecision(long id, [FromBody] WorkflowDecisionRequestDto dto)
    {
        var username = User.Identity?.Name ?? "admin";

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
