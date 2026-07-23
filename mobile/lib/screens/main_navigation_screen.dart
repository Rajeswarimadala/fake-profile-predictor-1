import 'package:flutter/material.dart';
import '../theme/colors.dart';
import 'dashboard_view.dart';
import 'new_scan_wizard_view.dart';
import 'history_view.dart';
import 'settings_view.dart';
import 'login_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({Key? key}) : super(key: key);

  @override
  _MainNavigationScreenState createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Views List
  final List<Widget> _views = [
    const DashboardView(),
    const NewScanWizardView(),
    const HistoryView(),
    const SettingsView(),
  ];

  final List<String> _titles = [
    'Dashboard',
    'New Scan Wizard',
    'Scan History',
    'Settings',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.lightBgPrimary,
      
      // Dynamic Title Bar
      appBar: AppBar(
        backgroundColor: AppColors.lightBgSecondary,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppColors.lightTextPrimary),
          onPressed: () {
            _scaffoldKey.currentState?.openDrawer();
          },
        ),
        title: Text(
          _titles[_currentIndex],
          style: const TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: AppColors.lightTextSecondary),
            onPressed: () {
              // Show notification logs dialog
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifications system up-to-date.')),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),

      // Left Menu (Drawer) - Dark Theme Sidebar matching Image 4
      drawer: Drawer(
        child: Container(
          color: AppColors.darkBgSecondary,
          child: Column(
            children: [
              // Drawer Header
              DrawerHeader(
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.darkGlassBorder)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primaryBlue, AppColors.cyanGlow],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.shield, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text(
                          'ImposterX',
                          style: TextStyle(
                            color: AppColors.darkTextPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Outfit',
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Console V1.0',
                          style: TextStyle(
                            color: AppColors.darkTextSecondary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Drawer Navigation Items
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0),
                  children: [
                    _buildDrawerItem(
                      icon: Icons.dashboard_outlined,
                      title: 'Dashboard',
                      isSelected: _currentIndex == 0,
                      onTap: () {
                        setState(() => _currentIndex = 0);
                        Navigator.pop(context);
                      },
                    ),
                    _buildDrawerItem(
                      icon: Icons.search_rounded,
                      title: 'New Scan',
                      isSelected: _currentIndex == 1,
                      onTap: () {
                        setState(() => _currentIndex = 1);
                        Navigator.pop(context);
                      },
                    ),
                    _buildDrawerItem(
                      icon: Icons.history_rounded,
                      title: 'Scan History',
                      isSelected: _currentIndex == 2,
                      onTap: () {
                        setState(() => _currentIndex = 2);
                        Navigator.pop(context);
                      },
                    ),
                    _buildDrawerItem(
                      icon: Icons.trending_up_rounded,
                      title: 'Analytics',
                      isSelected: false,
                      onTap: () {
                        setState(() => _currentIndex = 0); // redirect to dashboard / charts
                        Navigator.pop(context);
                      },
                    ),
                    _buildDrawerItem(
                      icon: Icons.settings_outlined,
                      title: 'Settings',
                      isSelected: _currentIndex == 3,
                      onTap: () {
                        setState(() => _currentIndex = 3);
                        Navigator.pop(context);
                      },
                    ),
                  ],
                ),
              ),

              // Footer User Account Profile
              Container(
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppColors.darkGlassBorder)),
                ),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: AppColors.primaryBlue.withOpacity(0.2),
                          child: const Text('AU', style: TextStyle(color: AppColors.cyanGlow, fontWeight: FontWeight.bold, fontSize: 13)),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Admin User',
                              style: TextStyle(
                                color: AppColors.darkTextPrimary,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Console Controller',
                              style: TextStyle(
                                color: AppColors.darkTextSecondary,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Log out button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (context) => const LoginScreen()),
                          );
                        },
                        icon: const Icon(Icons.power_settings_new_rounded, size: 16, color: AppColors.alertRed),
                        label: const Text('LOGOUT', style: TextStyle(color: AppColors.alertRed, fontSize: 11, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppColors.alertRed.withOpacity(0.3)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),

      // Current Sub-View Content
      body: _views[_currentIndex],

      // Bottom Navigation Bar - Light Theme
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.lightBorder, width: 0.5)),
        ),
        child: BottomNavigationBar(
          backgroundColor: AppColors.lightBgSecondary,
          currentIndex: _currentIndex,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppColors.primaryBlue,
          unselectedItemColor: AppColors.lightTextSecondary.withOpacity(0.6),
          selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          elevation: 0,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_rounded),
              activeIcon: Icon(Icons.search_rounded),
              label: 'Scan Wizard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_rounded),
              activeIcon: Icon(Icons.history_rounded),
              label: 'Logs',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined),
              activeIcon: Icon(Icons.settings),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6.0),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primaryBlue.withOpacity(0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: isSelected ? Border.all(color: AppColors.primaryBlue.withOpacity(0.2)) : null,
      ),
      child: ListTile(
        leading: Icon(icon, color: isSelected ? AppColors.primaryBlue : AppColors.darkTextSecondary),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? AppColors.darkTextPrimary : AppColors.darkTextSecondary,
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
        dense: true,
        onTap: onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}
