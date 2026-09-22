import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import 'barcode_scanner_screen.dart';
import 'agent_task_screen.dart';

class PosOrderScreen extends StatefulWidget {
  const PosOrderScreen({super.key});

  @override
  State<PosOrderScreen> createState() => _PosOrderScreenState();
}

class _PosOrderScreenState extends State<PosOrderScreen> {
  final ApiService _apiService = ApiService();
  List<Product> _products = [];
  final Map<int, double> _cart = {}; // ProductId -> Quantity
  bool _loading = true;
  String _paymentMethod = 'cash';
  final TextEditingController _customerController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts({String? search}) async {
    try {
      setState(() => _loading = true);
      final list = await _apiService.getProducts(search: search);
      setState(() => _products = list);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading products: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _addToCart(Product product) {
    setState(() {
      final current = _cart[product.id] ?? 0.0;
      if (current + 1 <= product.stockQuantity) {
        _cart[product.id] = current + 1;
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cannot add more. Max available: ${product.stockQuantity}')),
        );
      }
    });
  }

  void _removeFromCart(int productId) {
    setState(() {
      final current = _cart[productId] ?? 0.0;
      if (current > 1) {
        _cart[productId] = current - 1;
      } else {
        _cart.remove(productId);
      }
    });
  }

  double _calculateTotal() {
    double total = 0.0;
    _cart.forEach((productId, qty) {
      final p = _products.firstWhere((element) => element.id == productId, orElse: () => Product(
        id: -1, sku: '', name: '', category: '', unit: '', costPrice: 0, sellingPrice: 0, stockQuantity: 0, reorderLevel: 0, isActive: false, isLowStock: false
      ));
      if (p.id != -1) {
        total += p.sellingPrice * qty;
      }
    });
    return total;
  }

  Future<void> _openBarcodeScanner() async {
    final scannedSku = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const BarcodeScannerScreen()),
    );

    if (scannedSku != null && scannedSku.isNotEmpty) {
      // Find matching product
      final match = _products.where((p) => p.sku.toLowerCase() == scannedSku.toLowerCase()).firstOrNull;
      if (match != null) {
        _addToCart(match);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Scanned & added: ${match.name}')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No product found matching SKU: $scannedSku')),
        );
      }
    }
  }

  Future<void> _completeCheckout() async {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty.')),
      );
      return;
    }

    final items = _cart.entries.map((e) => {
      'productId': e.key,
      'quantity': e.value,
    }).toList();

    try {
      await _apiService.createSale(
        customerName: _customerController.text.trim().isEmpty ? null : _customerController.text.trim(),
        paymentMethod: _paymentMethod,
        items: items,
      );

      setState(() {
        _cart.clear();
        _customerController.clear();
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(backgroundColor: Colors.green, content: Text('Sale completed successfully!')),
        );
      }

      await _fetchProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.red, content: Text('Checkout failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _calculateTotal();

    return Scaffold(
      appBar: AppBar(
        title: const Text('BizTrack LK Mobile POS'),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: Color(0xFF38BDF8)),
            tooltip: 'Scan Barcode (Camera)',
            onPressed: _openBarcodeScanner,
          ),
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: Colors.orangeAccent),
            tooltip: 'Agent AI Tasks',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const AgentTaskScreen()));
            },
          ),
        ],
      ),
      backgroundColor: const Color(0xFF0B0F19),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search products by name or SKU...',
                      hintStyle: const TextStyle(color: Colors.grey),
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (val) => _fetchProducts(search: val),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  style: IconButton.filled(backgroundColor: const Color(0xFF38BDF8)),
                  icon: const Icon(Icons.qr_code_scanner, color: Colors.black),
                  onPressed: _openBarcodeScanner,
                ),
              ],
            ),
          ),

          // Products List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
                : ListView.builder(
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final p = _products[index];
                      final inCart = _cart[p.id] ?? 0;
                      return Card(
                        color: const Color(0xFF1E293B),
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        child: ListTile(
                          title: Text(p.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          subtitle: Text(
                            'SKU: ${p.sku} | Stock: ${p.stockQuantity} ${p.unit}\nLKR ${p.sellingPrice.toStringAsFixed(2)}',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          trailing: inCart > 0
                              ? Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent),
                                      onPressed: () => _removeFromCart(p.id),
                                    ),
                                    Text('$inCart', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline, color: Colors.greenAccent),
                                      onPressed: () => _addToCart(p),
                                    ),
                                  ],
                                )
                              : ElevatedButton(
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF38BDF8)),
                                  onPressed: p.stockQuantity > 0 ? () => _addToCart(p) : null,
                                  child: Text(
                                    p.stockQuantity > 0 ? 'Add' : 'Out of Stock',
                                    style: const TextStyle(color: Colors.black, fontSize: 12),
                                  ),
                                ),
                        ),
                      );
                    },
                  ),
          ),

          // Bottom Checkout Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(top: BorderSide(color: Color(0xFF334155))),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Items in Cart: ${_cart.length}', style: const TextStyle(color: Colors.white70)),
                    Text(
                      'Total: LKR ${total.toStringAsFixed(2)}',
                      style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _paymentMethod,
                        dropdownColor: const Color(0xFF1E293B),
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          isDense: true,
                          labelText: 'Payment',
                          labelStyle: TextStyle(color: Colors.grey),
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'cash', child: Text('Cash')),
                          DropdownMenuItem(value: 'card', child: Text('Card')),
                          DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer')),
                        ],
                        onChanged: (val) => setState(() => _paymentMethod = val ?? 'cash'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                      onPressed: total > 0 ? _completeCheckout : null,
                      child: const Text('Checkout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
