import 'package:flutter/material.dart';
import '../theme/colors.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({Key? key}) : super(key: key);

  @override
  _SettingsViewState createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  // Settings values
  String _apiHost = 'http://localhost:8000';
  double _timeoutSeconds = 15.0;
  bool _offlineSimulation = false;
  bool _detailedLogging = true;
  bool _autoSync = true;
  bool _enableNotifications = true;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section: Profile Overview
          _buildSectionHeader('User Account'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.lightBgSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
                  child: const Text(
                    'AU',
                    style: TextStyle(
                      color: AppColors.primaryBlue,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Admin User',
                      style: TextStyle(
                        color: AppColors.lightTextPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'admin@imposterx.ai',
                      style: TextStyle(
                        color: AppColors.lightTextSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Section: General Settings
          _buildSectionHeader('General Preferences'),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.lightBgSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: Column(
              children: [
                _buildSwitchTile(
                  title: 'Push Notifications',
                  subtitle: 'Notify when suspicious profile detections trigger',
                  value: _enableNotifications,
                  onChanged: (val) => setState(() => _enableNotifications = val),
                  icon: Icons.notifications_active_outlined,
                ),
                const Divider(height: 1, color: AppColors.lightBorder),
                _buildSwitchTile(
                  title: 'Real-time Synchronisation',
                  subtitle: 'Sync reports logs dynamically with cloud endpoints',
                  value: _autoSync,
                  onChanged: (val) => setState(() => _autoSync = val),
                  icon: Icons.sync,
                ),
                const Divider(height: 1, color: AppColors.lightBorder),
                _buildSwitchTile(
                  title: 'Detailed Diagnostics',
                  subtitle: 'Stream comprehensive logs during profile analyses',
                  value: _detailedLogging,
                  onChanged: (val) => setState(() => _detailedLogging = val),
                  icon: Icons.bug_report_outlined,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Section: API Settings
          _buildSectionHeader('FastAPI Server Configuration'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.lightBgSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // IP / Host URL Input
                const Text(
                  'API Server Endpoint Host Address',
                  style: TextStyle(
                    color: AppColors.lightTextPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  initialValue: _apiHost,
                  style: const TextStyle(color: AppColors.lightTextPrimary, fontSize: 13),
                  onChanged: (val) {
                    setState(() {
                      _apiHost = val;
                    });
                  },
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.dns_outlined, color: AppColors.lightTextSecondary, size: 18),
                    filled: true,
                    fillColor: AppColors.lightBgPrimary,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.lightBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.lightBorder),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Timeout Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Request Timeout Limit',
                      style: TextStyle(
                        color: AppColors.lightTextPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${_timeoutSeconds.toInt()}s',
                      style: const TextStyle(
                        color: AppColors.primaryBlue,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Slider.adaptive(
                  value: _timeoutSeconds,
                  min: 5.0,
                  max: 60.0,
                  divisions: 11,
                  activeColor: AppColors.primaryBlue,
                  inactiveColor: AppColors.lightBorder,
                  onChanged: (val) {
                    setState(() {
                      _timeoutSeconds = val;
                    });
                  },
                ),
                const Divider(height: 24, color: AppColors.lightBorder),

                // Offline Simulation switch
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppColors.primaryBlue,
                  title: const Text(
                    'Offline Simulation Mode',
                    style: TextStyle(
                      color: AppColors.lightTextPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: const Text(
                    'Simulate heuristics outputs when backend is unavailable',
                    style: TextStyle(
                      color: AppColors.lightTextSecondary,
                      fontSize: 11,
                    ),
                  ),
                  value: _offlineSimulation,
                  onChanged: (val) {
                    setState(() {
                      _offlineSimulation = val;
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Save / Reset configs
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Configuration parameters saved successfully.')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Save Configurations',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: AppColors.lightTextPrimary,
        fontSize: 14,
        fontWeight: FontWeight.bold,
        fontFamily: 'Outfit',
      ),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
  }) {
    return SwitchListTile.adaptive(
      secondary: Icon(icon, color: AppColors.lightTextSecondary, size: 20),
      activeColor: AppColors.primaryBlue,
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.lightTextPrimary,
          fontSize: 13,
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          color: AppColors.lightTextSecondary,
          fontSize: 11,
        ),
      ),
      value: value,
      onChanged: onChanged,
    );
  }
}
