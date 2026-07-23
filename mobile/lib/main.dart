import 'package:flutter/material.dart';
import 'theme/colors.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ImposterXApp());
}

class ImposterXApp extends StatelessWidget {
  const ImposterXApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Imposter X',
      debugShowCheckedModeBanner: false,
      
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: AppColors.primaryBlue,
        scaffoldBackgroundColor: AppColors.lightBgPrimary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryBlue,
          primary: AppColors.primaryBlue,
          background: AppColors.lightBgPrimary,
        ),
        textTheme: Theme.of(context).textTheme.apply(
          bodyColor: AppColors.lightTextPrimary,
          displayColor: AppColors.lightTextPrimary,
          fontFamily: 'Outfit',
        ),
      ),
      
      // Launch Route
      home: const SplashScreen(),
    );
  }
}
