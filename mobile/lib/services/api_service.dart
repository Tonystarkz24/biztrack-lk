import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/product.dart';
import '../models/agent_workflow.dart';

class ApiService {
  // 10.0.2.2 is the standard alias to host loopback (localhost) in Android Emulator
  // For web or physical device testing, adjust or override via setBaseUrl
  static String baseUrl = 'http://10.0.2.2:5000/api';
  final _storage = const FlutterSecureStorage();

  static void setBaseUrl(String url) {
    baseUrl = url.replaceAll(RegExp(r'/+$'), '');
  }

  Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: 'jwt_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // --- Auth ---
  Future<Map<String, dynamic>> login(String username, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      await _storage.write(key: 'jwt_token', value: data['token']);
      await _storage.write(key: 'user_role', value: data['role']);
      await _storage.write(key: 'username', value: data['username']);
      return data;
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Failed to authenticate');
    }
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }

  // --- Products ---
  Future<List<Product>> getProducts({String? search, String? category}) async {
    final queryParams = <String, String>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (category != null && category != 'all') queryParams['category'] = category;

    final uri = Uri.parse('$baseUrl/products').replace(queryParameters: queryParams);
    final res = await http.get(uri, headers: await _headers());

    if (res.statusCode == 200) {
      final List list = jsonDecode(res.body);
      return list.map((e) => Product.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }

  // --- Sales ---
  Future<Map<String, dynamic>> createSale({
    String? customerName,
    required String paymentMethod,
    required List<Map<String, dynamic>> items,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/sales'),
      headers: await _headers(),
      body: jsonEncode({
        'customerName': customerName,
        'paymentMethod': paymentMethod,
        'items': items,
      }),
    );

    if (res.statusCode == 201 || res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Failed to record sale');
    }
  }

  // --- Agentic AI Workflow ---
  Future<AgentWorkflow> initiateWorkflow(String objective, String role) async {
    final res = await http.post(
      Uri.parse('$baseUrl/agent/workflows'),
      headers: await _headers(),
      body: jsonEncode({
        'objective': objective,
        'requesterRole': role,
      }),
    );

    if (res.statusCode == 201 || res.statusCode == 200) {
      return AgentWorkflow.fromJson(jsonDecode(res.body));
    } else {
      final err = jsonDecode(res.body);
      throw Exception(err['message'] ?? 'Failed to dispatch workflow');
    }
  }

  Future<List<AgentWorkflow>> getWorkflows() async {
    final res = await http.get(
      Uri.parse('$baseUrl/agent/workflows'),
      headers: await _headers(),
    );

    if (res.statusCode == 200) {
      final List list = jsonDecode(res.body);
      return list.map((e) => AgentWorkflow.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load agent workflows');
    }
  }
}
