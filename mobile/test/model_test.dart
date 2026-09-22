import 'package:flutter_test/flutter_test.dart';
import 'package:biztrack_mobile/models/product.dart';
import 'package:biztrack_mobile/models/agent_workflow.dart';

void main() {
  group('Product Model Serialization Tests', () {
    test('Product.fromJson parses valid API payload correctly', () {
      final json = {
        'id': 101,
        'sku': 'TEA-CEY-001',
        'name': 'Ceylon BOP Tea',
        'category': 'Beverages',
        'unit': 'pack',
        'costPrice': 420.0,
        'sellingPrice': 520.0,
        'stockQuantity': 18.5,
        'reorderLevel': 10.0,
        'isActive': true,
        'isLowStock': false,
      };

      final product = Product.fromJson(json);

      expect(product.id, 101);
      expect(product.sku, 'TEA-CEY-001');
      expect(product.name, 'Ceylon BOP Tea');
      expect(product.category, 'Beverages');
      expect(product.costPrice, 420.0);
      expect(product.sellingPrice, 520.0);
      expect(product.stockQuantity, 18.5);
      expect(product.reorderLevel, 10.0);
      expect(product.isActive, true);
    });

    test('Product.toJson encodes properties into valid map', () {
      final product = Product(
        id: 102,
        sku: 'RIC-SAM-002',
        name: 'Samba Rice',
        category: 'Grains',
        unit: 'kg',
        costPrice: 210.0,
        sellingPrice: 250.0,
        stockQuantity: 4.0,
        reorderLevel: 10.0,
        isActive: true,
        isLowStock: true,
      );

      final json = product.toJson();

      expect(json['id'], 102);
      expect(json['sku'], 'RIC-SAM-002');
      expect(json['sellingPrice'], 250.0);
    });
  });

  group('AgentWorkflow Model Tests', () {
    test('AgentWorkflow.fromJson parses workflow and approval status', () {
      final json = {
        'id': 42,
        'workflowCode': 'WF-20260922-1234',
        'objective': 'Restock inventory for market rush',
        'status': 'RequiresApproval',
        'riskLevel': 'High',
        'requiresHumanApproval': true,
        'finalOutcome': 'Awaiting manager review in React dashboard.',
        'createdAt': '2026-09-22T10:00:00Z',
      };

      final workflow = AgentWorkflow.fromJson(json);

      expect(workflow.id, 42);
      expect(workflow.workflowCode, 'WF-20260922-1234');
      expect(workflow.status, 'RequiresApproval');
      expect(workflow.riskLevel, 'High');
      expect(workflow.requiresHumanApproval, true);
    });
  });
}
