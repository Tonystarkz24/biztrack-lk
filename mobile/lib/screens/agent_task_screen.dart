import 'package:flutter/material.dart';
import '../models/agent_workflow.dart';
import '../services/api_service.dart';

class AgentTaskScreen extends StatefulWidget {
  const AgentTaskScreen({super.key});

  @override
  State<AgentTaskScreen> createState() => _AgentTaskScreenState();
}

class _AgentTaskScreenState extends State<AgentTaskScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _objectiveController = TextEditingController(
    text: 'Audit low-stock goods and calculate supplier restock purchase order',
  );

  bool _loading = false;
  String? _statusMessage;
  List<AgentWorkflow> _workflows = [];

  @override
  void initState() {
    super.initState();
    _loadWorkflows();
  }

  Future<void> _loadWorkflows() async {
    try {
      final list = await _apiService.getWorkflows();
      setState(() => _workflows = list);
    } catch (_) {}
  }

  Future<void> _submitWorkflow() async {
    final text = _objectiveController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _loading = true;
      _statusMessage = null;
    });

    try {
      final wf = await _apiService.initiateWorkflow(text, 'Cashier');
      setState(() {
        _statusMessage = 'Workflow ${wf.workflowCode} initiated! Current status: ${wf.status}';
      });
      await _loadWorkflows();
    } catch (e) {
      setState(() {
        _statusMessage = 'Error: $e';
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'RequiresApproval':
        return Colors.orange;
      case 'Approved':
        return Colors.green;
      case 'Completed':
        return Colors.lightBlue;
      case 'Rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agentic AI Tasks'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      backgroundColor: const Color(0xFF0B0F19),
      body: RefreshIndicator(
        onRefresh: _loadWorkflows,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Info Card
              Card(
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.auto_awesome, color: Color(0xFF38BDF8)),
                          SizedBox(width: 8),
                          Text(
                            'Cross-Platform Agentic Flow',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Trigger autonomous 4-agent stock & pricing evaluation. High-impact orders will pause for manager approval in the React web dashboard.',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Trigger Form
              Card(
                color: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dispatch New Business Objective',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _objectiveController,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'Enter domain objective...',
                          hintStyle: const TextStyle(color: Colors.grey),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF38BDF8),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        ),
                        onPressed: _loading ? null : _submitWorkflow,
                        icon: _loading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Icon(Icons.send, color: Colors.black),
                        label: Text(
                          _loading ? 'Processing Agents...' : 'Dispatch via ASP.NET Core',
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                        ),
                      ),
                      if (_statusMessage != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.blue.withOpacity(0.4)),
                          ),
                          child: Text(
                            _statusMessage!,
                            style: const TextStyle(color: Colors.lightBlueAccent, fontSize: 13),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),
              const Text(
                'Live Workflow Status Tracking',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),

              // Workflows List
              if (_workflows.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Center(
                    child: Text('No active workflows found.', style: TextStyle(color: Colors.grey)),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _workflows.length,
                  itemBuilder: (context, index) {
                    final wf = _workflows[index];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _getStatusColor(wf.status).withOpacity(0.2),
                          child: Icon(Icons.hub, color: _getStatusColor(wf.status)),
                        ),
                        title: Text(
                          wf.workflowCode,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(wf.objective, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            if (wf.finalOutcome != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Outcome: ${wf.finalOutcome}',
                                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                              ),
                            ]
                          ],
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(wf.status).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: _getStatusColor(wf.status)),
                          ),
                          child: Text(
                            wf.status,
                            style: TextStyle(color: _getStatusColor(wf.status), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
