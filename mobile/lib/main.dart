import 'package:flutter/material.dart';
import 'screens/pos_order_screen.dart';
import 'screens/agent_task_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BizTrackMobileApp());
}

class BizTrackMobileApp extends StatelessWidget {
  const BizTrackMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BizTrack LK Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        primaryColor: const Color(0xFF38BDF8),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF38BDF8),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          elevation: 0,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const PosOrderScreen(),
        '/agent-tasks': (context) => const AgentTaskScreen(),
      },
    );
  }
}
