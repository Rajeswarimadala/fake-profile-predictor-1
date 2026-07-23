import 'package:flutter/material.dart';
import 'dart:async';
import '../theme/colors.dart';

class NewScanWizardView extends StatefulWidget {
  const NewScanWizardView({Key? key}) : super(key: key);

  @override
  _NewScanWizardViewState createState() => _NewScanWizardViewState();
}

class _NewScanWizardViewState extends State<NewScanWizardView> {
  int _currentStep = 0; // 0: Platform, 1: Details, 2: Upload, 3: Configure, 4: Analysis, 5: Result

  // Form Fields State
  String _selectedPlatform = 'Instagram';
  final _usernameController = TextEditingController();
  final _urlController = TextEditingController();
  bool _hasCustomImage = false;

  // Analysis Switches
  bool _profileInfoAnalysis = true;
  bool _imageAnalysis = true;
  bool _textBioAnalysis = true;
  bool _behaviorAnalysis = true;
  bool _networkAnalysis = true;
  bool _botPatternAnalysis = true;

  // Analysis Progress State
  double _analysisProgress = 0.0;
  List<String> _diagnosticLogs = [];
  Timer? _analysisTimer;
  int _logIndex = 0;

  // Result Metrics State (simulated based on username)
  int _riskScore = 0;
  String _category = 'Genuine';
  int _textScore = 0;
  int _imageScore = 0;
  int _behaviorScore = 0;
  int _networkScore = 0;
  int _botScore = 0;

  final List<String> _allLogs = [
    'Connecting to socket nodes...',
    'Resolving username registry markers...',
    'Fetching metadata parameters...',
    'Downloading avatar binaries...',
    'Running computer vision filters on image profile...',
    'Analysing deepfake probabilities (CNN)...',
    'Executing NLP text bio heuristics...',
    'Auditing chronobiology timelines...',
    'Computing follower/following network graph vectors...',
    'Evaluating automation patterns and bot likelihood...',
    'Synthesising scoring metrics...',
    'Scan Report generated successfully.'
  ];

  @override
  void initState() {
    super.initState();
    _usernameController.addListener(_updateUrlPreview);
  }

  @override
  void dispose() {
    _usernameController.removeListener(_updateUrlPreview);
    _usernameController.dispose();
    _urlController.dispose();
    _analysisTimer?.cancel();
    super.dispose();
  }

  void _updateUrlPreview() {
    final text = _usernameController.text.trim().replaceAll('@', '');
    if (text.isNotEmpty) {
      final domain = _selectedPlatform.toLowerCase().replaceAll('/x', '').replaceAll(' ', '');
      setState(() {
        _urlController.text = 'https://$domain.com/$text';
      });
    } else {
      setState(() {
        _urlController.text = '';
      });
    }
  }

  void _startAnalysisSimulation() {
    setState(() {
      _currentStep = 4;
      _analysisProgress = 0.0;
      _diagnosticLogs = ['Initializing ImposterX Diagnostic Port...'];
      _logIndex = 0;
    });

    _analysisTimer = Timer.periodic(const Duration(milliseconds: 700), (timer) {
      if (_logIndex < _allLogs.length) {
        setState(() {
          _diagnosticLogs.add(_allLogs[_logIndex]);
          _analysisProgress = (_logIndex + 1) / _allLogs.length;
          _logIndex++;
        });
      } else {
        timer.cancel();
        _generateSimulatedResult();
        setState(() {
          _currentStep = 5;
        });
      }
    });
  }

  void _generateSimulatedResult() {
    // Generate deterministic values based on username length to make scanning interactive
    final username = _usernameController.text.trim().toLowerCase();
    
    // Default mock scores
    int text = 25;
    int img = 18;
    int beh = 30;
    int net = 15;
    
    if (username.contains('crypto') || username.contains('fake') || username.contains('99')) {
      text = 85;
      img = 78;
      beh = 92;
      net = 89;
    } else if (username.length % 2 == 0) {
      text = 52;
      img = 41;
      beh = 64;
      net = 48;
    }

    int bot = ((beh * 0.9) + 5).toInt();
    int risk = ((text + img + beh + net + bot) / 5).toInt();
    
    String cat = 'Genuine Account';
    if (risk >= 75) {
      cat = 'High-Risk Fake Profile';
    } else if (risk >= 40) {
      cat = 'Suspicious Account';
    }

    setState(() {
      _textScore = text;
      _imageScore = img;
      _behaviorScore = beh;
      _networkScore = net;
      _botScore = bot;
      _riskScore = risk;
      _category = cat;
    });
  }

  void _resetWizard() {
    setState(() {
      _currentStep = 0;
      _usernameController.clear();
      _urlController.clear();
      _hasCustomImage = false;
      _analysisProgress = 0.0;
      _diagnosticLogs.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Stepper Header
        _buildStepperProgress(),

        // Wizard Body Scrollable
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: _buildStepContent(),
          ),
        ),

        // Action Buttons Bar (Except when scanning)
        if (_currentStep != 4) _buildActionBar(),
      ],
    );
  }

  Widget _buildStepperProgress() {
    final List<String> stepLabels = ['Platform', 'Details', 'Image', 'Configs', 'Result'];
    final int displayStep = _currentStep >= 4 ? (_currentStep == 4 ? 3 : 4) : _currentStep;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 12.0),
      decoration: const BoxDecoration(
        color: AppColors.lightBgSecondary,
        border: Border(bottom: BorderSide(color: AppColors.lightBorder, width: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(stepLabels.length, (index) {
          final isCompleted = index < displayStep;
          final isActive = index == displayStep;
          
          return Expanded(
            child: Row(
              children: [
                // Step Indicator Bubble
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.primaryBlue
                        : (isActive ? AppColors.primaryBlue.withOpacity(0.1) : Colors.transparent),
                    border: Border.all(
                      color: isCompleted || isActive ? AppColors.primaryBlue : AppColors.lightTextMuted.withOpacity(0.5),
                      width: 2,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 12)
                        : Text(
                            '${index + 1}',
                            style: TextStyle(
                              color: isActive ? AppColors.primaryBlue : AppColors.lightTextMuted,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 4),
                // Step Label Text
                Expanded(
                  child: Text(
                    stepLabels[index],
                    style: TextStyle(
                      color: isActive ? AppColors.lightTextPrimary : AppColors.lightTextSecondary.withOpacity(0.6),
                      fontSize: 10,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (index < stepLabels.length - 1)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 8,
                      color: AppColors.lightTextMuted.withOpacity(0.5),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildPlatformSelectionStep();
      case 1:
        return _buildDetailsStep();
      case 2:
        return _buildUploadStep();
      case 3:
        return _buildConfigurationStep();
      case 4:
        return _buildAnalysisSimulationStep();
      case 5:
        return _buildResultReportStep();
      default:
        return Container();
    }
  }

  Widget _buildPlatformSelectionStep() {
    final List<Map<String, dynamic>> platforms = [
      {'name': 'Instagram', 'icon': Icons.camera_alt_outlined, 'color': const Color(0xFFE1306C)},
      {'name': 'Twitter/X', 'icon': Icons.alternate_email_outlined, 'color': Colors.black87},
      {'name': 'Facebook', 'icon': Icons.facebook_outlined, 'color': const Color(0xFF1877F2)},
      {'name': 'LinkedIn', 'icon': Icons.business_center_outlined, 'color': const Color(0xFF0077B5)},
      {'name': 'TikTok', 'icon': Icons.music_note_outlined, 'color': const Color(0xFF010101)},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Platform',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Choose the social media platform to scan',
          style: TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 24),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
          ),
          itemCount: platforms.length,
          itemBuilder: (context, index) {
            final p = platforms[index];
            final isSelected = _selectedPlatform == p['name'];
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedPlatform = p['name'];
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryBlue.withOpacity(0.06) : AppColors.lightBgSecondary,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppColors.primaryBlue : AppColors.lightBorder,
                    width: isSelected ? 2 : 1,
                  ),
                  boxShadow: isSelected
                      ? [BoxShadow(color: AppColors.primaryBlue.withOpacity(0.1), blurRadius: 10, spreadRadius: 1)]
                      : null,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      p['icon'],
                      color: isSelected ? AppColors.primaryBlue : p['color'].withOpacity(0.7),
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      p['name'],
                      style: TextStyle(
                        color: AppColors.lightTextPrimary,
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Enter Username',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Enter target account credentials on $_selectedPlatform',
          style: const TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 24),
        
        const Text(
          'Target Handle / Username',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _usernameController,
          style: const TextStyle(color: AppColors.lightTextPrimary, fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.alternate_email_rounded, color: AppColors.lightTextSecondary, size: 18),
            hintText: 'e.g. username_here',
            hintStyle: const TextStyle(color: AppColors.lightTextMuted, fontSize: 13),
            filled: true,
            fillColor: AppColors.lightBgSecondary,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryBlue)),
          ),
        ),
        const SizedBox(height: 24),

        const Text(
          'Profile URL Preview',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _urlController,
          readOnly: true,
          style: const TextStyle(color: AppColors.lightTextSecondary, fontSize: 13),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.link_rounded, color: AppColors.lightTextMuted, size: 18),
            filled: true,
            fillColor: AppColors.lightBgPrimary,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
          ),
        ),
      ],
    );
  }

  Widget _buildUploadStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upload Profile Image',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Provide profile picture snapshot for deepfake & image forensics',
          style: TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 32),

        Center(
          child: Column(
            children: [
              GestureDetector(
                onTap: () {
                  setState(() {
                    _hasCustomImage = !_hasCustomImage;
                  });
                },
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppColors.lightBgSecondary,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _hasCustomImage ? AppColors.primaryBlue : AppColors.lightBorder,
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: _hasCustomImage
                        ? ClipOval(
                            child: Image.network(
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
                              width: 176,
                              height: 176,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return const Icon(Icons.person, color: AppColors.primaryBlue, size: 64);
                              },
                            ),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.cloud_upload_outlined, color: AppColors.primaryBlue, size: 44),
                              SizedBox(height: 12),
                              Text(
                                'Select Image',
                                style: TextStyle(
                                  color: AppColors.primaryBlue,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              if (_hasCustomImage)
                OutlinedButton.icon(
                  onPressed: () {
                    setState(() => _hasCustomImage = false);
                  },
                  icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.alertRed),
                  label: const Text('REMOVE IMAGE', style: TextStyle(color: AppColors.alertRed, fontSize: 11, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.alertRed),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                )
              else
                const Text(
                  'Accepted: JPG, PNG, WEBP (Max 5MB)',
                  style: TextStyle(
                    color: AppColors.lightTextMuted,
                    fontSize: 11,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConfigurationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Scan Configuration',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Select analysis modules to run',
          style: TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 20),

        _buildConfigSwitchTile(
          title: 'Profile Information Analysis',
          subtitle: 'Check keywords, account handles & registrations',
          value: _profileInfoAnalysis,
          onChanged: (val) => setState(() => _profileInfoAnalysis = val),
        ),
        _buildConfigSwitchTile(
          title: 'Image Analysis (Deepfake Detection)',
          subtitle: 'Audit avatar metadata and visual facial manipulation signatures',
          value: _imageAnalysis,
          onChanged: (val) => setState(() => _imageAnalysis = val),
        ),
        _buildConfigSwitchTile(
          title: 'Text / Bio Analysis (NLP)',
          subtitle: 'Analyse bio semantics and posting language heuristics',
          value: _textBioAnalysis,
          onChanged: (val) => setState(() => _textBioAnalysis = val),
        ),
        _buildConfigSwitchTile(
          title: 'Behavior Analysis',
          subtitle: 'Audit chronobiology charts & publishing patterns',
          value: _behaviorAnalysis,
          onChanged: (val) => setState(() => _behaviorAnalysis = val),
        ),
        _buildConfigSwitchTile(
          title: 'Network Analysis',
          subtitle: 'Analyze cluster graph configurations of followers',
          value: _networkAnalysis,
          onChanged: (val) => setState(() => _networkAnalysis = val),
        ),
        _buildConfigSwitchTile(
          title: 'Bot Pattern Analysis',
          subtitle: 'Identify automated triggers & automated bot templates',
          value: _botPatternAnalysis,
          onChanged: (val) => setState(() => _botPatternAnalysis = val),
        ),
      ],
    );
  }

  Widget _buildConfigSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        color: AppColors.lightBgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: SwitchListTile.adaptive(
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
      ),
    );
  }

  Widget _buildAnalysisSimulationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Scanning Diagnostics Console',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Connecting to terminal port evaluating @${_usernameController.text}',
          style: const TextStyle(
            color: AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 24),

        // Progress bar
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: _analysisProgress,
            minHeight: 12,
            backgroundColor: AppColors.lightBorder,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryBlue),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progress: ${(_analysisProgress * 100).toInt()}%',
              style: const TextStyle(
                color: AppColors.lightTextSecondary,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Text(
              'Engine Active',
              style: TextStyle(
                color: AppColors.primaryBlue,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Dark log terminal box
        Container(
          width: double.infinity,
          height: 260,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.darkBgSecondary,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.darkGlassBorder),
          ),
          child: ListView.builder(
            itemCount: _diagnosticLogs.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 6.0),
                child: Text(
                  '> ${_diagnosticLogs[index]}',
                  style: const TextStyle(
                    color: AppColors.cyanGlow,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildResultReportStep() {
    Color riskColor = AppColors.genuineGreen;
    if (_riskScore >= 75) {
      riskColor = AppColors.alertRed;
    } else if (_riskScore >= 40) {
      riskColor = AppColors.warningYellow;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Scan Analysis Complete',
              style: TextStyle(
                color: AppColors.lightTextPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
                fontFamily: 'Outfit',
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.primaryBlue),
              onPressed: _resetWizard,
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Overall risk dashboard score card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.lightBgSecondary,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.lightBorder),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '@${_usernameController.text.trim().replaceAll('@', '')}',
                        style: const TextStyle(
                          color: AppColors.lightTextPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Platform: $_selectedPlatform',
                        style: const TextStyle(
                          color: AppColors.lightTextSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: riskColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _category,
                      style: TextStyle(
                        color: riskColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 110,
                        height: 110,
                        child: CircularProgressIndicator(
                          value: _riskScore / 100,
                          strokeWidth: 10,
                          backgroundColor: AppColors.lightBorder,
                          valueColor: AlwaysStoppedAnimation<Color>(riskColor),
                        ),
                      ),
                      Column(
                        children: [
                          Text(
                            '$_riskScore',
                            style: const TextStyle(
                              color: AppColors.lightTextPrimary,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Outfit',
                            ),
                          ),
                          const Text(
                            'Risk Index',
                            style: TextStyle(
                              color: AppColors.lightTextSecondary,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        const Text(
          'Score Breakdowns',
          style: TextStyle(
            color: AppColors.lightTextPrimary,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            fontFamily: 'Outfit',
          ),
        ),
        const SizedBox(height: 12),

        _buildScoreBar('Profile Information', _textScore),
        _buildScoreBar('Image Manipulation', _imageScore),
        _buildScoreBar('NLP Bio & Language Text', _textScore),
        _buildScoreBar('Posting behavior Heuristics', _behaviorScore),
        _buildScoreBar('Graph Connection Density', _networkScore),
        _buildScoreBar('Automated Bot Indicators', _botScore),
      ],
    );
  }

  Widget _buildScoreBar(String module, int score) {
    Color barColor = AppColors.genuineGreen;
    if (score >= 75) {
      barColor = AppColors.alertRed;
    } else if (score >= 40) {
      barColor = AppColors.warningYellow;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.lightBgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.lightBorder),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                module,
                style: const TextStyle(
                  color: AppColors.lightTextSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                '$score/100',
                style: TextStyle(
                  color: barColor,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: score / 100,
              minHeight: 6,
              backgroundColor: AppColors.lightBorder,
              valueColor: AlwaysStoppedAnimation<Color>(barColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionBar() {
    final bool canGoBack = _currentStep > 0 && _currentStep < 4;
    final bool isLastInputStep = _currentStep == 3;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: const BoxDecoration(
        color: AppColors.lightBgSecondary,
        border: Border(top: BorderSide(color: AppColors.lightBorder, width: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (canGoBack)
            TextButton(
              onPressed: () {
                setState(() {
                  _currentStep--;
                });
              },
              child: const Text('BACK', style: TextStyle(color: AppColors.lightTextSecondary, fontWeight: FontWeight.bold)),
            )
          else if (_currentStep == 5)
            TextButton(
              onPressed: _resetWizard,
              child: const Text('SCAN NEW', style: TextStyle(color: AppColors.lightTextSecondary, fontWeight: FontWeight.bold)),
            )
          else
            const SizedBox(width: 10),

          ElevatedButton(
            onPressed: () {
              if (_currentStep == 1 && _usernameController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a username.')),
                );
                return;
              }

              if (isLastInputStep) {
                _startAnalysisSimulation();
              } else if (_currentStep < 3) {
                setState(() {
                  _currentStep++;
                });
              } else if (_currentStep == 5) {
                _resetWizard();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isLastInputStep ? 'START ANALYSIS' : (_currentStep == 5 ? 'DONE' : 'NEXT'),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
