import 'package:flutter/material.dart';
import '../theme/colors.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  // Mock data representing database analytics values
  int totalScans = 1546;
  int fakeProfiles = 342;
  int suspiciousScans = 210;
  double safeProfilesRate = 92.4;

  final List<Map<String, dynamic>> recentScans = [
    {
      'username': '@john_doe_secure',
      'platform': 'Instagram',
      'risk_score': 15,
      'category': 'Genuine Account',
      'time': '10 mins ago',
    },
    {
      'username': '@cryptopromoter_99',
      'platform': 'Twitter/X',
      'risk_score': 88,
      'category': 'High-Risk Fake Profile',
      'time': '32 mins ago',
    },
    {
      'username': '@robert.bruce.92',
      'platform': 'Facebook',
      'risk_score': 54,
      'category': 'Suspicious Account',
      'time': '1 hr ago',
    },
    {
      'username': '@hr_recruitment_agent',
      'platform': 'LinkedIn',
      'risk_score': 92,
      'category': 'High-Risk Fake Profile',
      'time': '3 hrs ago',
    },
    {
      'username': '@dance_queen_tiktok',
      'platform': 'TikTok',
      'risk_score': 28,
      'category': 'Genuine Account',
      'time': '5 hrs ago',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row of Header / Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Analytics Overview',
                    style: TextStyle(
                      color: AppColors.lightTextPrimary,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Outfit',
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Real-time threat evaluation dashboard',
                    style: TextStyle(
                      color: AppColors.lightTextSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.genuineGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.genuineGreen.withOpacity(0.2)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.circle, size: 8, color: AppColors.genuineGreen),
                    SizedBox(width: 6),
                    Text(
                      'Live Engine',
                      style: TextStyle(
                        color: AppColors.genuineGreen,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 4 Grid Metric Cards
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildMetricCard(
                title: 'Total Scans',
                value: '1,546',
                trend: '+10.2%',
                isPositiveTrend: true,
                icon: Icons.search_rounded,
                iconColor: AppColors.primaryBlue,
              ),
              _buildMetricCard(
                title: 'Fake Profiles',
                value: '342',
                trend: '+5.5%',
                isPositiveTrend: false, // bad trend (increase in threat)
                icon: Icons.supervised_user_circle_outlined,
                iconColor: AppColors.alertRed,
              ),
              _buildMetricCard(
                title: 'Suspicious',
                value: '210',
                trend: '+18.1%',
                isPositiveTrend: false, // bad trend
                icon: Icons.warning_amber_rounded,
                iconColor: AppColors.warningYellow,
              ),
              _buildMetricCard(
                title: 'Safe Profiles',
                value: '994',
                trend: '+15.2%',
                isPositiveTrend: true,
                icon: Icons.check_circle_outline_rounded,
                iconColor: AppColors.genuineGreen,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Line Chart: Scans Over Time & Donut Chart
          _buildChartContainer(
            title: 'Scans Over Time',
            subtitle: 'Monthly scanning frequency trends',
            child: SizedBox(
              height: 160,
              child: CustomPaint(
                painter: LineChartPainter(),
                child: Container(),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Donut Chart: Platform Distribution
          _buildChartContainer(
            title: 'Platform Distribution',
            subtitle: 'Profile scanning metrics by network',
            child: Row(
              children: [
                Expanded(
                  flex: 4,
                  child: SizedBox(
                    height: 130,
                    child: CustomPaint(
                      painter: DonutChartPainter(),
                      child: Container(),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 5,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLegendItem('Instagram', '38%', const Color(0xFFE1306C)),
                      _buildLegendItem('Twitter/X', '27%', Colors.black87),
                      _buildLegendItem('Facebook', '18%', const Color(0xFF1877F2)),
                      _buildLegendItem('LinkedIn', '12%', const Color(0xFF0077B5)),
                      _buildLegendItem('Others', '5%', Colors.grey),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Bar Chart: Risk Levels & Accuracy Gauge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildChartContainer(
                  title: 'Risk Levels',
                  subtitle: 'Profile categorisation',
                  child: SizedBox(
                    height: 120,
                    child: CustomPaint(
                      painter: BarChartPainter(),
                      child: Container(),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildChartContainer(
                  title: 'Detection Accuracy',
                  subtitle: 'Overall scoring rate',
                  child: SizedBox(
                    height: 120,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Positioned.fill(
                          child: CustomPaint(
                            painter: GaugeChartPainter(percentage: safeProfilesRate),
                          ),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 20),
                            Text(
                              '$safeProfilesRate%',
                              style: const TextStyle(
                                color: AppColors.lightTextPrimary,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Outfit',
                              ),
                            ),
                            const Text(
                              'Accuracy',
                              style: TextStyle(
                                color: AppColors.lightTextSecondary,
                                fontSize: 9,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Activity Log table
          const Text(
            'Recent Threat Activity Log',
            style: TextStyle(
              color: AppColors.lightTextPrimary,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              fontFamily: 'Outfit',
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: AppColors.lightBgSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.lightBorder),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: recentScans.length,
              separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.lightBorder),
              itemBuilder: (context, index) {
                final scan = recentScans[index];
                final score = scan['risk_score'] as int;
                Color riskColor = AppColors.genuineGreen;
                if (score >= 75) {
                  riskColor = AppColors.alertRed;
                } else if (score >= 40) {
                  riskColor = AppColors.warningYellow;
                }

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  leading: CircleAvatar(
                    radius: 18,
                    backgroundColor: riskColor.withOpacity(0.1),
                    child: Icon(
                      _getPlatformIcon(scan['platform']),
                      color: riskColor,
                      size: 18,
                    ),
                  ),
                  title: Text(
                    scan['username'],
                    style: const TextStyle(
                      color: AppColors.lightTextPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    '${scan['platform']} • ${scan['time']}',
                    style: const TextStyle(
                      color: AppColors.lightTextSecondary,
                      fontSize: 11,
                    ),
                  ),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: riskColor.withOpacity(0.1),
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String trend,
    required bool isPositiveTrend,
    required IconData icon,
    required Color iconColor,
  }) {
    Color trendColor = isPositiveTrend ? AppColors.genuineGreen : AppColors.alertRed;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.lightBgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.lightTextSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(icon, color: iconColor.withOpacity(0.8), size: 18),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: AppColors.lightTextPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Outfit',
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Icon(
                    isPositiveTrend ? Icons.arrow_upward : Icons.arrow_downward,
                    color: trendColor,
                    size: 10,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    trend,
                    style: TextStyle(
                      color: trendColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChartContainer({
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.lightBgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.lightTextPrimary,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              fontFamily: 'Outfit',
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.lightTextMuted,
              fontSize: 10,
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildLegendItem(String title, String percent, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.lightTextSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          Text(
            percent,
            style: const TextStyle(
              color: AppColors.lightTextPrimary,
              fontSize: 11,
              fontWeight: FontWeight.bold,
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
}

// Painter for Scans Over Time line chart
class LineChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final Paint linePaint = Paint()
      ..color = AppColors.primaryBlue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final Paint fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [AppColors.primaryBlue.withOpacity(0.25), AppColors.primaryBlue.withOpacity(0.01)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    final Paint gridPaint = Paint()
      ..color = AppColors.lightBorder
      ..strokeWidth = 0.5;

    // Draw horizontal grid lines
    const int gridRows = 4;
    for (int i = 0; i <= gridRows; i++) {
      final double y = size.height * (i / gridRows);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Points representing monthly scans
    final List<Offset> points = [
      Offset(size.width * 0.05, size.height * 0.75),
      Offset(size.width * 0.20, size.height * 0.60),
      Offset(size.width * 0.35, size.height * 0.65),
      Offset(size.width * 0.50, size.height * 0.40),
      Offset(size.width * 0.65, size.height * 0.50),
      Offset(size.width * 0.80, size.height * 0.30),
      Offset(size.width * 0.95, size.height * 0.15),
    ];

    final Path path = Path();
    path.moveTo(points[0].dx, points[0].dy);

    for (int i = 1; i < points.length; i++) {
      // Cubic bezier curve for smooth graph lines
      final double xc = (points[i - 1].dx + points[i].dx) / 2;
      final double yc = (points[i - 1].dy + points[i].dy) / 2;
      path.quadraticBezierTo(points[i - 1].dx, points[i - 1].dy, xc, yc);
    }
    path.lineTo(points.last.dx, points.last.dy);

    // Draw line
    canvas.drawPath(path, linePaint);

    // Close path for gradient fill
    final Path fillPath = Path.from(path);
    fillPath.lineTo(points.last.dx, size.height);
    fillPath.lineTo(points[0].dx, size.height);
    fillPath.close();

    canvas.drawPath(fillPath, fillPaint);

    // Draw data points as dots
    final Paint dotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    final Paint dotBorder = Paint()
      ..color = AppColors.primaryBlue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    for (var point in points) {
      canvas.drawCircle(point, 4, dotPaint);
      canvas.drawCircle(point, 4, dotBorder);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Painter for Platform Distribution donut chart
class DonutChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.height * 0.45;
    final Offset center = Offset(size.width / 2, size.height / 2);
    final Rect rect = Rect.fromCircle(center: center, radius: radius);

    final Paint paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.square;

    // Platform slices matching percentages (Total 360 deg)
    // Instagram (38%), Twitter (27%), Facebook (18%), LinkedIn (12%), Others (5%)
    final List<double> sweepAngles = [
      3.14 * 2 * 0.38,
      3.14 * 2 * 0.27,
      3.14 * 2 * 0.18,
      3.14 * 2 * 0.12,
      3.14 * 2 * 0.05,
    ];

    final List<Color> sliceColors = [
      const Color(0xFFE1306C),
      Colors.black87,
      const Color(0xFF1877F2),
      const Color(0xFF0077B5),
      Colors.grey,
    ];

    double startAngle = -3.14 / 2; // Start from top center

    for (int i = 0; i < sweepAngles.length; i++) {
      paint.color = sliceColors[i];
      canvas.drawArc(rect, startAngle, sweepAngles[i], false, paint);
      startAngle += sweepAngles[i];
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Painter for Risk Level bar chart
class BarChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double colWidth = size.width / 4;
    final double barWidth = 12;

    final Paint cleanPaint = Paint()
      ..color = AppColors.genuineGreen
      ..style = PaintingStyle.fill;

    final Paint suspiciousPaint = Paint()
      ..color = AppColors.warningYellow
      ..style = PaintingStyle.fill;

    final Paint dangerPaint = Paint()
      ..color = AppColors.alertRed
      ..style = PaintingStyle.fill;

    // Draw vertical bars corresponding to risk buckets
    // Genuine, Suspicious, High-Risk
    final List<double> heights = [
      size.height * 0.75, // Genuine
      size.height * 0.45, // Suspicious
      size.height * 0.30, // High Risk
    ];

    final List<String> labels = ['Safe', 'Susp.', 'Risk'];
    final List<Paint> paints = [cleanPaint, suspiciousPaint, dangerPaint];

    for (int i = 0; i < 3; i++) {
      final double x = colWidth * (i + 0.5) - (barWidth / 2);
      final double y = size.height - heights[i] - 16;
      final Rect rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(x, y, barWidth, heights[i]),
        const Radius.circular(4),
      ).outerRect;

      canvas.drawRect(rect, paints[i]);

      // Draw Labels
      final TextPainter textPainter = TextPainter(
        text: TextSpan(
          text: labels[i],
          style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 9, fontWeight: FontWeight.bold),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(x - (textPainter.width / 4), size.height - 12));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Painter for Detection Accuracy gauge chart
class GaugeChartPainter extends CustomPainter {
  final double percentage;

  GaugeChartPainter({required this.percentage});

  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.height * 0.65;
    final Offset center = Offset(size.width / 2, size.height * 0.75);
    final Rect rect = Rect.fromCircle(center: center, radius: radius);

    final Paint trackPaint = Paint()
      ..color = AppColors.lightBorder
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    final Paint arcPaint = Paint()
      ..color = AppColors.genuineGreen
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    // Draw background track semi-circle (180 deg = PI rad)
    canvas.drawArc(rect, 3.14, 3.14, false, trackPaint);

    // Draw active arc representation
    final double activeSweep = 3.14 * (percentage / 100);
    canvas.drawArc(rect, 3.14, activeSweep, false, arcPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
