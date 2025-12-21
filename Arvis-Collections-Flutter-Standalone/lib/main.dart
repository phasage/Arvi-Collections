import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';

import 'core/database/database_helper.dart';
import 'core/services/auth_service.dart';
import 'core/services/product_service.dart';
import 'core/services/cart_service.dart';
import 'core/services/order_service.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/order_provider.dart';
import 'providers/theme_provider.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local database
  await DatabaseHelper.instance.database;
  
  // Initialize services
  final authService = AuthService();
  final productService = ProductService();
  final cartService = CartService();
  final orderService = OrderService();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(ArvisCollectionsApp(
    authService: authService,
    productService: productService,
    cartService: cartService,
    orderService: orderService,
  ));
}

class ArvisCollectionsApp extends StatelessWidget {
  final AuthService authService;
  final ProductService productService;
  final CartService cartService;
  final OrderService orderService;

  const ArvisCollectionsApp({
    super.key,
    required this.authService,
    required this.productService,
    required this.cartService,
    required this.orderService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => ProductProvider(productService)),
        ChangeNotifierProvider(create: (_) => CartProvider(cartService)),
        ChangeNotifierProvider(create: (_) => OrderProvider(orderService)),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp.router(
            title: 'Arvis Collections',
            debugShowCheckedModeBanner: false,
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: themeProvider.themeMode,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}