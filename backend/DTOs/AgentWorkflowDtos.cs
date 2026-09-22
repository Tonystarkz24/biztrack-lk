using System.ComponentModel.DataAnnotations;

namespace BizTrack.Api.DTOs;

public class InitiateWorkflowRequestDto
{
    [Required]
    public string Objective { get; set; } = string.Empty;

    public string? RequesterRole { get; set; }
}

public class WorkflowDecisionRequestDto
{
    [Required]
    public string Decision { get; set; } = "Approved"; // "Approved", "Rejected", "RevisionRequested"

    public string? Note { get; set; }
}

public class ExecutionLogDto
{
    public long Id { get; set; }
    public int StepNumber { get; set; }
    public string AgentRole { get; set; } = string.Empty;
    public string ToolName { get; set; } = string.Empty;
    public string? ToolInput { get; set; }
    public string? ToolOutput { get; set; }
    public string? ValidationResult { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class WorkflowApprovalDto
{
    public long Id { get; set; }
    public string ApproverUsername { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty;
    public string? DecisionNote { get; set; }
    public DateTime DecidedAt { get; set; }
}

public class AgentWorkflowDto
{
    public long Id { get; set; }
    public string WorkflowCode { get; set; } = string.Empty;
    public string Objective { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RequesterRole { get; set; } = string.Empty;
    public string RequesterUsername { get; set; } = string.Empty;
    public string? PlanSummary { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public bool RequiresHumanApproval { get; set; }
    public string? FinalOutcome { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<ExecutionLogDto> ExecutionLogs { get; set; } = new();
    public List<WorkflowApprovalDto> Approvals { get; set; } = new();
}
