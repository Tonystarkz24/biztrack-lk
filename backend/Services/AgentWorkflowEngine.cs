using System.Text.Json;
using BizTrack.Api.Data;
using BizTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BizTrack.Api.Services;

public class RestockRecommendationItem
{
    public long Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal SuggestedOrderQuantity { get; set; }
    public decimal UnitCostLkr { get; set; }
    public decimal TotalEstimatedCostLkr { get; set; }
}

public class RestockActionOutput
{
    public List<RestockRecommendationItem> RecommendedPurchaseOrders { get; set; } = new();
    public decimal TotalCapitalCommitmentLkr { get; set; }
}

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
            "3. Enforce deterministic budget constraints and require executive sign-off for orders > LKR 15,000"
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
            ValidationResult = deficitList.Count > 0 
                ? $"Passed: Identified {deficitList.Count} items needing replenishment."
                : "Passed: All inventory levels are healthy above reorder thresholds."
        };
        _context.AgentExecutionLogs.Add(log2);
        await _context.SaveChangesAsync();

        // If no items need restocking, complete gracefully
        if (deficitList.Count == 0)
        {
            var log3Empty = new AgentExecutionLog
            {
                WorkflowId = workflow.Id,
                StepNumber = step++,
                AgentRole = "ActionGeneratorAgent",
                ToolName = "CalculateOptimalRestockOrder",
                ToolInput = JsonSerializer.Serialize(new { Status = "NoDeficitsDetected" }),
                ToolOutput = JsonSerializer.Serialize(new { RecommendedPurchaseOrders = Array.Empty<object>(), TotalCapitalCommitmentLkr = 0.00 }),
                ValidationResult = "Passed: Zero purchase orders required."
            };
            _context.AgentExecutionLogs.Add(log3Empty);

            var log4Empty = new AgentExecutionLog
            {
                WorkflowId = workflow.Id,
                StepNumber = step++,
                AgentRole = "ValidationSafetyAgent",
                ToolName = "EnforceDeterministicSafetyThresholds",
                ToolInput = JsonSerializer.Serialize(new { TotalProposedBudget = 0.00, AutonomousThreshold = 15000.00 }),
                ToolOutput = JsonSerializer.Serialize(new { SafetyDecision = "Completed", RiskLevel = "Low" }),
                ValidationResult = "Passed: All products are adequately stocked. No approval needed."
            };
            _context.AgentExecutionLogs.Add(log4Empty);

            workflow.Status = WorkflowStatus.Completed;
            workflow.RiskLevel = "Low";
            workflow.RequiresHumanApproval = false;
            workflow.FinalOutcome = "All active products are adequately stocked above reorder thresholds. No restock purchase orders needed.";
            workflow.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return workflow;
        }

        // --- 3. ACTION / TOOL AGENT (Allow-listed restock calculator) ---
        var recommendations = deficitList.Select(d =>
        {
            var suggestedOrderQty = Math.Max(10, Math.Ceiling(d.Deficit > 0 ? d.Deficit : 15));
            var estCost = Math.Round(suggestedOrderQty * d.CostPrice, 2);
            return new RestockRecommendationItem
            {
                Id = d.Id,
                Sku = d.Sku,
                Name = d.Name,
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
            ToolOutput = JsonSerializer.Serialize(new RestockActionOutput
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
        bool isHighImpact = totalBudgetNeeded > 15000m;
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
            // Autonomous low-impact execution: Apply stock and record procurement expense immediately
            foreach (var rec in recommendations)
            {
                var product = await _context.Products.FindAsync(rec.Id);
                if (product != null)
                {
                    product.StockQuantity += rec.SuggestedOrderQuantity;
                    product.UpdatedAt = DateTime.UtcNow;
                }
            }

            _context.Expenses.Add(new Expense
            {
                Title = $"Autonomous Restock: {workflow.WorkflowCode}",
                Category = "Inventory Restock",
                Amount = totalBudgetNeeded,
                ExpenseDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Note = $"Autonomous restock executed by Agent Workflow Engine for {recommendations.Count} products under spending limit.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            safetyOutcome = $"Passed: Order of LKR {totalBudgetNeeded:N2} is within autonomous limit (<= 15,000). Executed automatically.";
            workflow.Status = WorkflowStatus.Completed;
            workflow.RiskLevel = "Low";
            workflow.RequiresHumanApproval = false;
            workflow.FinalOutcome = $"Autonomous execution completed: Restocked {recommendations.Count} products totaling LKR {totalBudgetNeeded:N2} and logged restock expense.";
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
            // Execute real business transaction: Increment product stock & record procurement expense
            var actionLog = workflow.ExecutionLogs.FirstOrDefault(l => l.AgentRole == "ActionGeneratorAgent");
            int itemsUpdated = 0;
            decimal totalCost = 0m;

            if (actionLog?.ToolOutput != null)
            {
                try
                {
                    var actionData = JsonSerializer.Deserialize<RestockActionOutput>(actionLog.ToolOutput, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (actionData != null && actionData.RecommendedPurchaseOrders.Count > 0)
                    {
                        totalCost = actionData.TotalCapitalCommitmentLkr;

                        foreach (var item in actionData.RecommendedPurchaseOrders)
                        {
                            var product = await _context.Products.FindAsync(item.Id);
                            if (product != null)
                            {
                                product.StockQuantity += item.SuggestedOrderQuantity;
                                product.UpdatedAt = DateTime.UtcNow;
                                itemsUpdated++;
                            }
                        }

                        _context.Expenses.Add(new Expense
                        {
                            Title = $"Approved Restock Order: {workflow.WorkflowCode}",
                            Category = "Inventory Restock",
                            Amount = totalCost,
                            ExpenseDate = DateOnly.FromDateTime(DateTime.UtcNow),
                            Note = $"Restock order approved by {approverUsername}. Note: {note ?? "None"}",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to apply approved restock purchase order.");
                }
            }

            workflow.Status = WorkflowStatus.Approved;
            workflow.FinalOutcome = $"Approved by {approverUsername}. Executed purchase order: updated stock for {itemsUpdated} products and logged restock expense of LKR {totalCost:N2}. Note: {note ?? "None"}";
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
