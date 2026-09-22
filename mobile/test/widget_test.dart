import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:biztrack_mobile/main.dart';

void main() {
  testWidgets('BizTrack Mobile App starts and displays POS Order screen', (WidgetTester tester) async {
    await tester.pumpWidget(const BizTrackMobileApp());

    // Allow widgets to settle
    await tester.pump();

    // Verify app title or core POS components render
    expect(find.byType(MaterialApp), findsOneWidget);
    expect(find.byType(Scaffold), findsWidgets);
  });
}
