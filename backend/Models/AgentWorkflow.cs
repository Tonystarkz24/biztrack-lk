using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizTrack.Api.Models;

public static class WorkflowStatus
{
    public const string PendingAnalysis = "PendingAnalysis";
    public const string InProgress = "InProgress";
    public const string RequiresApproval = "RequiresApproval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
}

[Table("agent_workflows")]
public class AgentWorkflow
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("workflow_code")]
    public string WorkflowCode { get; set; } = string.Empty;

    [Required]
    [Column("objective")]
    public string Objective { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = WorkflowStatus.PendingAnalysis;

    [MaxLength(30)]
    [Column("requester_role")]
    public string RequesterRole { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("requester_username")]
    public string RequesterUsername { get; set; } = string.Empty;

    [Column("plan_summary")]
    public string? PlanSummary { get; set; }

    [MaxLength(20)]
    [Column("risk_level")]
    public string RiskLevel { get; set; } = "Low";

    [Column("requires_human_approval")]
    public bool RequiresHumanApproval { get; set; } = true;

    [Column("final_outcome")]
    public string? FinalOutcome { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<AgentExecutionLog> ExecutionLogs { get; set; } = new();
    public List<WorkflowApproval> Approvals { get; set; } = new();
}

[Table("agent_execution_logs")]
public class AgentExecutionLog
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("workflow_id")]
    public long WorkflowId { get; set; }

    [Column("step_number")]
    public int StepNumber { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("agent_role")]
    public string AgentRole { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("tool_name")]
    public string ToolName { get; set; } = string.Empty;

    [Column("tool_input")]
    public string? ToolInput { get; set; }

    [Column("tool_output")]
    public string? ToolOutput { get; set; }

    [Column("validation_result")]
    public string? ValidationResult { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(WorkflowId))]
    public AgentWorkflow? Workflow { get; set; }
}

[Table("workflow_approvals")]
public class WorkflowApproval
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("workflow_id")]
    public long WorkflowId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("approver_username")]
    public string ApproverUsername { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("decision")]
    public string Decision { get; set; } = string.Empty;

    [Column("decision_note")]
    public string? DecisionNote { get; set; }

    [Column("decided_at")]
    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(WorkflowId))]
    public AgentWorkflow? Workflow { get; set; }
}
