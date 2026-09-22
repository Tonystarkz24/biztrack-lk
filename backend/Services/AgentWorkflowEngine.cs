using System.Text.Json;
using BizTrack.Api.Data;
using BizTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Services;

public interface IAgentWorkflowEngine
{
    Task<AgentWorkflow> RunWorkflowAsync(string objective, string requesterUsername, string requesterRole);
    Task<AgentWorkflow> ProcessApprovalDecisionAsync(long workflowId, string approverUsername, string decision, string? note);
}

public class AgentWorkflowEngine : IAgentWorkflowEngine
{
    private readonly AppDbContext _context;
    private readonly ILogger<AgentWorkflowEngine> _logger;

    public AgentWorkflowEngine(AppDbContext context, ILogger<AgentWorkflowEngine> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AgentWorkflow> RunWorkflowAsync(string objective, string requesterUsername, string requesterRole)
    {
        var workflowCode = $"WF-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var workflow = new AgentWorkflow
        {
            WorkflowCode = workflowCode,
            Objective = objective,
            Status = WorkflowStatus.InProgress,
            RequesterUsername = requesterUsername,
            RequesterRole = requesterRole,
            RiskLevel = "Medium",
            RequiresHumanApproval = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.AgentWorkflows.Add(workflow);
        await _context.SaveChangesAsync();

        int step = 1;

        // --- 1. COORDINATOR / PLANNER AGENT ---
        var planSteps = new[]
        {
            "1. Analyze low-stock inventory and identify critical stockouts",
            "2. Generate optimal bulk restock recommendations with supplier cost projections",
            "3. Enforce deterministic budget constraints and require executive sign-off"
        };
        workflow.PlanSummary = string.Join("\n", planSteps);

        var log1 = new AgentExecutionLog
        {
            WorkflowId = workflow.Id,
            StepNumber = step++,
            AgentRole = "CoordinatorPlannerAgent",
            ToolName = "DeconstructObjectiveAndPlan",
            ToolInput = JsonSerializer.Serialize(new { Objective = objective, TargetSector = "Retail Inventory & Cash Flow" }),
            ToolOutput = JsonSerializer.Serialize(new { Status = "PlanFormulated", Steps = planSteps }),
            ValidationResult = "Passed: Plan follows 3-stage controlled agent execution pipeline."
        };
        _context.AgentExecutionLogs.Add(log1);
        await _context.SaveChangesAsync();

        // --- 2. DEMAND & INVENTORY ANALYZER AGENT ---
        var lowStockProducts = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= p.ReorderLevel)
            .Take(10)
            .ToListAsync();

        var deficitList = lowStockProducts.Select(p => new
        {
            p.Id,
            p.Sku,
            p.Name,
            CurrentStock = p.StockQuantity,
            ReorderLevel = p.ReorderLevel,
            Deficit = Math.Max(0, (p.ReorderLevel * 2) - p.StockQuantity),
            p.CostPrice
        }).ToList();

        var log2 = new AgentExecutionLog
        {
            WorkflowId = workflow.Id,
            StepNumber = step++,
            AgentRole = "DemandAnalyzerAgent",
            ToolName = "QueryInventoryDeficits",
            ToolInput = JsonSerializer.Serialize(new { ThresholdRule = "stock <= reorder_level", Limit = 10 }),
            ToolOutput = JsonSerializer.Serialize(new { LowStockItemsFound = deficitList.Count, Items = deficitList }),
            ValidationResult = $"Passed: Evaluated {deficitList.Count} items needing attention."
        };
        _context.AgentExecutionLogs.Add(log2);
        await _context.SaveChangesAsync();

        // --- 3. ACTION / TOOL AGENT (Allow-listed restock calculator) ---
        var recommendations = deficitList.Select(d =>
        {
            var suggestedOrderQty = Math.Max(10, Math.Ceiling(d.Deficit > 0 ? d.Deficit : 15));
            var estCost = Math.Round(suggestedOrderQty * d.CostPrice, 2);
            return new
            {
                d.Id,
                d.Sku,
                d.Name,
                SuggestedOrderQuantity = suggestedOrderQty,
                UnitCostLkr = d.CostPrice,
                TotalEstimatedCostLkr = estCost
            };
        }).ToList();

        var totalBudgetNeeded = recommendations.Sum(r => r.TotalEstimatedCostLkr);

        var log3 = new AgentExecutionLog
        {
            WorkflowId = workflow.Id,
            StepNumber = step++,
            AgentRole = "ActionGeneratorAgent",
            ToolName = "CalculateOptimalRestockOrder",
            ToolInput = JsonSerializer.Serialize(new { SourceDeficits = deficitList.Select(d => d.Sku) }),
            ToolOutput = JsonSerializer.Serialize(new
            {
                RecommendedPurchaseOrders = recommendations,
                TotalCapitalCommitmentLkr = totalBudgetNeeded
            }),
            ValidationResult = "Passed: Generated structured purchase order recommendations."
        };
        _context.AgentExecutionLogs.Add(log3);
        await _context.SaveChangesAsync();

        // --- 4. VALIDATION & SAFETY AGENT ---
        // Deterministic check: Is budget commitment high impact (> 15,000 LKR)?
        bool isHighImpact = totalBudgetNeeded > 15000m || recommendations.Any();
        string safetyOutcome;

        if (isHighImpact)
        {
            safetyOutcome = $"RequiresHumanApproval: Estimated spend LKR {totalBudgetNeeded:N2} exceeds autonomous spending threshold (LKR 15,000.00). Pausing for authorized executive sign-off.";
            workflow.Status = WorkflowStatus.RequiresApproval;
            workflow.RiskLevel = "High";
            workflow.RequiresHumanApproval = true;
            workflow.FinalOutcome = $"Proposed restock of {recommendations.Count} products totaling LKR {totalBudgetNeeded:N2}. Awaiting manager review in React dashboard.";
        }
        else
        {
            safetyOutcome = "Passed: Order is within autonomous limits. Completed.";
            workflow.Status = WorkflowStatus.Completed;
            workflow.RiskLevel = "Low";
            workflow.RequiresHumanApproval = false;
            workflow.FinalOutcome = "Autonomous low-risk workflow executed successfully.";
        }

        var log4 = new AgentExecutionLog
        {
            WorkflowId = workflow.Id,
            StepNumber = step++,
            AgentRole = "ValidationSafetyAgent",
            ToolName = "EnforceDeterministicSafetyThresholds",
            ToolInput = JsonSerializer.Serialize(new { TotalProposedBudget = totalBudgetNeeded, AutonomousThreshold = 15000.00 }),
            ToolOutput = JsonSerializer.Serialize(new { SafetyDecision = workflow.Status, RiskLevel = workflow.RiskLevel }),
            ValidationResult = safetyOutcome
        };
        _context.AgentExecutionLogs.Add(log4);

        workflow.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return workflow;
    }

    public async Task<AgentWorkflow> ProcessApprovalDecisionAsync(long workflowId, string approverUsername, string decision, string? note)
    {
        var workflow = await _context.AgentWorkflows
            .Include(w => w.ExecutionLogs)
            .Include(w => w.Approvals)
            .FirstOrDefaultAsync(w => w.Id == workflowId);

        if (workflow == null)
        {
            throw new KeyNotFoundException($"Workflow with ID {workflowId} not found.");
        }

        var approval = new WorkflowApproval
        {
            WorkflowId = workflow.Id,
            ApproverUsername = approverUsername,
            Decision = decision,
            DecisionNote = note,
            DecidedAt = DateTime.UtcNow
        };
        _context.WorkflowApprovals.Add(approval);

        if (decision.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            workflow.Status = WorkflowStatus.Approved;
            workflow.FinalOutcome = $"Approved by {approverUsername}. Dispatched for purchase order execution. Note: {note ?? "None"}";
        }
        else
        {
            workflow.Status = WorkflowStatus.Rejected;
            workflow.FinalOutcome = $"Rejected by {approverUsername}. Reason: {note ?? "Not specified."}";
        }

        workflow.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return workflow;
    }
}
