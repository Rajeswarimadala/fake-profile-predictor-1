import 'package:flutter/material.dart';
import '../theme/colors.dart';

class HistoryView extends StatefulWidget {
  const HistoryView({Key? key}) : super(key: key);

  @override
  _HistoryViewState createState() => _HistoryViewState();
}

class _HistoryViewState extends State<HistoryView> {
  String _selectedFilter = 'All';
  String _searchQuery = '';

  // Seed data reflecting backend reports
  final List<Map<String, dynamic>> _historyData = [
    {
      'id': '1',
      'username': 'cryptopromoter_99',
      'platform': 'Twitter/X',
      'url': 'https://twitter.com/cryptopromoter_99',
      'risk_score': 88,
      'category': 'High-Risk Fake Profile',
      'timestamp': '2026-06-20T18:42:00Z',
      'details': {
        'text': 85,
        'image': 78,
        'behavior': 92,
        'network': 89,
        'bot': 95,
      }
    },
    {
      'id': '2',
      'username': 'hr_recruitment_agent',
      'platform': 'LinkedIn',
      'url': 'https://linkedin.com/in/hr_recruitment_agent',
      'risk_score': 92,
      'category': 'High-Risk Fake Profile',
      'timestamp': '2026-06-20T16:15:00Z',
      'details': {
        'text': 95,
        'image': 88,
        'behavior': 90,
        'network': 94,
        'bot': 93,
      }
    },
    {
      'id': '3',
      'username': 'robert.bruce.92',
      'platform': 'Facebook',
      'url': 'https://facebook.com/robert.bruce.92',
      'risk_score': 54,
      'category': 'Suspicious Account',
      'timestamp': '2026-06-20T13:00:00Z',
      'details': {
        'text': 45,
        'image': 55,
        'behavior': 60,
        'network': 52,
        'bot': 58,
      }
    },
    {
      'id': '4',
      'username': 'john_doe_secure',
      'platform': 'Instagram',
      'url': 'https://instagram.com/john_doe_secure',
      'risk_score': 15,
      'category': 'Genuine Account',
      'timestamp': '2026-06-20T10:20:00Z',
      'details': {
        'text': 10,
        'image': 12,
        'behavior': 20,
        'network': 18,
        'bot': 15,
      }
    },
    {
      'id': '5',
      'username': 'dance_queen_tiktok',
      'platform': 'TikTok',
      'url': 'https://tiktok.com/@dance_queen_tiktok',
      'risk_score': 28,
      'category': 'Genuine Account',
      'timestamp': '2026-06-19T22:10:00Z',
      'details': {
        'text': 25,
        'image': 30,
        'behavior': 32,
        'network': 25,
        'bot': 28,
      }
    },
    {
      'id': '6',
      'username': 'elonmusk_giveaway',
      'platform': 'Twitter/X',
      'url': 'https://twitter.com/elonmusk_giveaway',
      'risk_score': 97,
      'category': 'High-Risk Fake Profile',
      'timestamp': '2026-06-19T14:05:00Z',
      'details': {
        'text': 99,
        'image': 95,
        'behavior': 98,
        'network': 96,
        'bot': 97,
      }
    },
  ];

  @override
  Widget build(BuildContext context) {
    // Filter history data
    final filteredData = _historyData.where((scan) {
      final matchesSearch = scan['username'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            scan['platform'].toLowerCase().contains(_searchQuery.toLowerCase());
      
      if (_selectedFilter == 'All') return matchesSearch;
      if (_selectedFilter == 'High Risk') return matchesSearch && (scan['risk_score'] >= 75);
      if (_selectedFilter == 'Suspicious') return matchesSearch && (scan['risk_score'] >= 40 && scan['risk_score'] < 75);
      if (_selectedFilter == 'Genuine') return matchesSearch && (scan['risk_score'] < 40);
      return matchesSearch;
    }).toList();

    return Column(
      children: [
        // Filter bar & Search field
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          decoration: const BoxDecoration(
            color: AppColors.lightBgSecondary,
            border: Border(bottom: BorderSide(color: AppColors.lightBorder, width: 0.5)),
          ),
          child: Column(
            children: [
              // Search input
              TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                style: const TextStyle(color: AppColors.lightTextPrimary, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Search by username or platform...',
                  hintStyle: const TextStyle(color: AppColors.lightTextMuted, fontSize: 13),
                  prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.lightTextSecondary),
                  filled: true,
                  fillColor: AppColors.lightBgPrimary,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.lightBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.lightBorder),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              
              // Filter Chips row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['All', 'High Risk', 'Suspicious', 'Genuine'].map((filter) {
                    final isSelected = _selectedFilter == filter;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(
                          filter,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.lightTextSecondary,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primaryBlue,
                        backgroundColor: AppColors.lightBgPrimary,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedFilter = filter);
                          }
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        // List View of History
        Expanded(
          child: filteredData.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: filteredData.length,
                  itemBuilder: (context, index) {
                    final scan = filteredData[index];
                    return _buildHistoryCard(scan);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildHistoryCard(Map<String, dynamic> scan) {
    final score = scan['risk_score'] as int;
    Color riskColor = AppColors.genuineGreen;
    if (score >= 75) {
      riskColor = AppColors.alertRed;
    } else if (score >= 40) {
      riskColor = AppColors.warningYellow;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        color: AppColors.lightBgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        leading: CircleAvatar(
          radius: 18,
          backgroundColor: riskColor.withOpacity(0.1),
          child: Icon(_getPlatformIcon(scan['platform']), color: riskColor, size: 18),
        ),
        title: Text(
          '@${scan['username']}',
          style: const TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(
          '${scan['platform']} • ${_formatTimestamp(scan['timestamp'])}',
          style: const TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 11,
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: riskColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            'Score: $score',
            style: TextStyle(
              color: riskColor,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        children: [
          // Expansion content details
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(height: 1, color: AppColors.lightBorder),
                const SizedBox(height: 12),
                
                // Details row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Audit Category:', style: TextStyle(color: AppColors.lightTextSecondary, fontSize: 11)),
                    Text(
                      scan['category'],
                      style: TextStyle(color: riskColor, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Profile URL:', style: TextStyle(color: AppColors.lightTextSecondary, fontSize: 11)),
                    Expanded(
                      child: Text(
                        scan['url'],
                        textAlign: TextAlign.end,
                        style: const TextStyle(color: AppColors.primaryBlue, fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Breakdowns Sub-stats
                const Text(
                  'Diagnostic Scores Breakdown',
                  style: TextStyle(
                    color: AppColors.lightTextPrimary,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                _buildBreakdownRow('Profile Details Info', scan['details']['text']),
                _buildBreakdownRow('Computer Vision Image Analysis', scan['details']['image']),
                _buildBreakdownRow('Language/Bio NLP Analytics', scan['details']['text']),
                _buildBreakdownRow('Timeline Posting Behavior Heuristics', scan['details']['behavior']),
                _buildBreakdownRow('Follower Connection Trust Graph', scan['details']['network']),
                _buildBreakdownRow('Automated Spam/Bot Patterns', scan['details']['bot']),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownRow(String title, int value) {
    Color barColor = AppColors.genuineGreen;
    if (value >= 75) {
      barColor = AppColors.alertRed;
    } else if (value >= 40) {
      barColor = AppColors.warningYellow;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 10)),
              Text('$value/100', style: TextStyle(color: barColor, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: value / 100,
              minHeight: 4,
              backgroundColor: AppColors.lightBorder,
              valueColor: AlwaysStoppedAnimation<Color>(barColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, size: 64, color: AppColors.lightTextMuted.withOpacity(0.5)),
          const SizedBox(height: 16),
          const Text(
            'No matching scan reports',
            style: TextStyle(
              color: AppColors.lightTextPrimary,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try adjusting filters or search criteria.',
            style: TextStyle(
              color: AppColors.lightTextSecondary,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getPlatformIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return Icons.camera_alt_outlined;
      case 'twitter/x':
        return Icons.alternate_email_outlined;
      case 'facebook':
        return Icons.facebook_outlined;
      case 'linkedin':
        return Icons.business_center_outlined;
      default:
        return Icons.link_rounded;
    }
  }

  String _formatTimestamp(String timestamp) {
    try {
      final parsed = DateTime.parse(timestamp);
      return '${parsed.day}/${parsed.month}/${parsed.year} ${parsed.hour}:${parsed.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return timestamp;
    }
  }
}
