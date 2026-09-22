class AgentWorkflow {
  final int id;
  final String workflowCode;
  final String objective;
  final String status;
  final String requesterRole;
  final String requesterUsername;
  final String? planSummary;
  final String riskLevel;
  final bool requiresHumanApproval;
  final String? finalOutcome;
  final DateTime createdAt;

  AgentWorkflow({
    required this.id,
    required this.workflowCode,
    required this.objective,
    required this.status,
    required this.requesterRole,
    required this.requesterUsername,
    this.planSummary,
    required this.riskLevel,
    required this.requiresHumanApproval,
    this.finalOutcome,
    required this.createdAt,
  });

  factory AgentWorkflow.fromJson(Map<String, dynamic> json) {
    return AgentWorkflow(
      id: json['id'] as int,
      workflowCode: json['workflowCode'] ?? '',
      objective: json['objective'] ?? '',
      status: json['status'] ?? '',
      requesterRole: json['requesterRole'] ?? '',
      requesterUsername: json['requesterUsername'] ?? '',
      planSummary: json['planSummary'],
      riskLevel: json['riskLevel'] ?? 'Low',
      requiresHumanApproval: json['requiresHumanApproval'] ?? false,
      finalOutcome: json['finalOutcome'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
