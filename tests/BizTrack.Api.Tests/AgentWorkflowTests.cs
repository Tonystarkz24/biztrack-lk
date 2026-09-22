using BizTrack.Api.Data;
using BizTrack.Api.Models;
using BizTrack.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace BizTrack.Api.Tests;

public class AgentWorkflowTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task RunWorkflowAsync_ExecutesAllFourAgents_AndCreatesDurableLogs()
    {
        using var context = GetInMemoryDbContext();

        // Seed an item that is low stock and high cost (18 * 1200 = 21,600 > 15,000 threshold)
        context.Products.Add(new Product
        {
            Sku = "DEF-001",
            Name = "Critical Rice Pack",
            Category = "Grains",
            Unit = "kg",
            CostPrice = 1200m,
            SellingPrice = 1500m,
            StockQuantity = 2m,
            ReorderLevel = 10m,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var engine = new AgentWorkflowEngine(context, NullLogger<AgentWorkflowEngine>.Instance);

        var workflow = await engine.RunWorkflowAsync(
            "Replenish critical staples inventory",
            "field_staff_user",
            "Cashier"
        );

        Assert.NotNull(workflow);
        Assert.Equal(WorkflowStatus.RequiresApproval, workflow.Status);
        Assert.True(workflow.RequiresHumanApproval);

        // Verify the 4 distinct specialized agent execution logs
        var logs = await context.AgentExecutionLogs
            .Where(l => l.WorkflowId == workflow.Id)
            .OrderBy(l => l.StepNumber)
            .ToListAsync();

        Assert.Equal(4, logs.Count);
        Assert.Equal("CoordinatorPlannerAgent", logs[0].AgentRole);
        Assert.Equal("DemandAnalyzerAgent", logs[1].AgentRole);
        Assert.Equal("ActionGeneratorAgent", logs[2].AgentRole);
        Assert.Equal("ValidationSafetyAgent", logs[3].AgentRole);

        Assert.Contains("Passed", logs[0].ValidationResult);
        Assert.Contains("Passed", logs[1].ValidationResult);
        Assert.Contains("Passed", logs[2].ValidationResult);
        Assert.Contains("RequiresHumanApproval", logs[3].ValidationResult);
    }

    [Fact]
    public async Task RunWorkflowAsync_LowBudgetDeficit_ExecutesAutonomouslyWithoutApproval()
    {
        using var context = GetInMemoryDbContext();

        // Seed a small deficit item (18 * 100 = 1800 <= 15,000)
        context.Products.Add(new Product
        {
            Sku = "DEF-SMALL-001",
            Name = "Small Spice Pack",
            Category = "Spices",
            Unit = "packet",
            CostPrice = 100m,
            SellingPrice = 150m,
            StockQuantity = 2m,
            ReorderLevel = 10m,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var engine = new AgentWorkflowEngine(context, NullLogger<AgentWorkflowEngine>.Instance);

        var workflow = await engine.RunWorkflowAsync(
            "Replenish spices inventory",
            "manager_user",
            "InventoryManager"
        );

        Assert.NotNull(workflow);
        Assert.Equal(WorkflowStatus.Completed, workflow.Status);
        Assert.False(workflow.RequiresHumanApproval);
        Assert.Equal("Low", workflow.RiskLevel);
        Assert.Contains("Autonomous execution completed", workflow.FinalOutcome);

        // Verify stock was automatically incremented
        var updatedProduct = await context.Products.FirstAsync(p => p.Sku == "DEF-SMALL-001");
        Assert.True(updatedProduct.StockQuantity > 2m);

        // Verify expense was recorded
        var expense = await context.Expenses.FirstOrDefaultAsync(e => e.Category == "Inventory Restock");
        Assert.NotNull(expense);
    }

    [Fact]
    public async Task ProcessApprovalDecisionAsync_TransitionsStatusAndRecordsSignOff()
    {
        using var context = GetInMemoryDbContext();
        var workflow = new AgentWorkflow
        {
            WorkflowCode = "WF-TEST-001",
            Objective = "Test stock replenishment",
            Status = WorkflowStatus.RequiresApproval,
            RequiresHumanApproval = true
        };
        context.AgentWorkflows.Add(workflow);
        await context.SaveChangesAsync();

        var engine = new AgentWorkflowEngine(context, NullLogger<AgentWorkflowEngine>.Instance);

        var result = await engine.ProcessApprovalDecisionAsync(
            workflow.Id,
            "admin",
            "Approved",
            "Approved for bulk procurement by general manager"
        );

        Assert.Equal(WorkflowStatus.Approved, result.Status);
        Assert.Contains("Approved by admin", result.FinalOutcome);

        var approval = await context.WorkflowApprovals.FirstOrDefaultAsync(a => a.WorkflowId == workflow.Id);
        Assert.NotNull(approval);
        Assert.Equal("Approved", approval.Decision);
        Assert.Equal("admin", approval.ApproverUsername);
    }
}
