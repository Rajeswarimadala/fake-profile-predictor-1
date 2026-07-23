import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Upload, 
  FileText, 
  History, 
  Activity, 
  Users, 
  Info,
  Clock,
  ArrowRight,
  RefreshCw,
  X as CloseIcon,
  ChevronRight,
  Check,
  Key,
  HardDrive,
  Cpu,
  Database,
  Eye,
  Copy,
  Power,
  Play,
  Globe,
  HelpCircle
} from 'lucide-react';
import './App.css';

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
  // Navigation & Authentication states
  // Page states: splash, auth, dashboard, analytics, new_scan, processing, results, reports, admin_dashboard, user_management, system_analytics, settings, logged_out
  const [currentPage, setCurrentPage] = useState(() => {
    const savedUser = localStorage.getItem('imposterx_user');
    return savedUser ? 'dashboard' : 'splash';
  }); 
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('imposterx_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Auth Form Fields
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');

  // Wizard Stepper States (1: Select Platform, 2: Enter Details, 3: Upload Profile Image, 4: Scan Configuration)
  const [wizardStep, setWizardStep] = useState(1);
  const [scanPlatform, setScanPlatform] = useState('Instagram');
  const [scanUsername, setScanUsername] = useState('');
  const [scanUrl, setScanUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [configToggles, setConfigToggles] = useState({
    profileInfo: true,
    imageAnalysis: true,
    textAnalysis: true,
    behaviorAnalysis: true,
    networkAnalysis: true,
    botAnalysis: true
  });

  // Processing & Live Streaming Log States
  const [processingPercentage, setProcessingPercentage] = useState(0);
  const [liveLogs, setLiveLogs] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const logTerminalRef = useRef(null);

  // Results & Detailed Analysis States
  const [currentScanId, setCurrentScanId] = useState(null);
  const [latestScanResult, setLatestScanResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('overview'); // overview, vision, text, behavior, network, bot, risk, explanation

  // Global Statistics & Alerts States
  const [globalStats, setGlobalStats] = useState(() => {
    const savedStats = localStorage.getItem('imposterx_stats');
    return savedStats ? JSON.parse(savedStats) : {
      total_scans: 0,
      threat_detected: 0,
      suspicious_scans: 0,
      safe_profiles: 0,
      accuracy_rate: 0,
      avg_risk: 0,
      detection_trend: []
    };
  });
  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState('all'); // all, high, medium
  const [scanHistory, setScanHistory] = useState(() => {
    const savedHistory = localStorage.getItem('imposterx_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [historySearch, setHistorySearch] = useState('');
  const [historyPlatformFilter, setHistoryPlatformFilter] = useState('All');
  
  // Settings States
  const [activeSettingsTab, setActiveSettingsTab] = useState('general'); // general, profile, api, notifications
  const [nlpSensitivity, setNlpSensitivity] = useState(75);
  const [imgSensitivity, setImgSensitivity] = useState(80);
  const [systemAlertsEnabled, setSystemAlertsEnabled] = useState(true);
  const [mockAIEnabled, setMockAIEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('sk_live_51O8iImX92jFpS10Q8yK23aBv8917qP740wL91zK');
  const [webhookUrl, setWebhookUrl] = useState('https://yourdomain.com/webhooks/imposterx');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  // Admin Portal States
  const [adminUsers, setAdminUsers] = useState([
    { id: 'usr_1', name: 'Sarah Connor', email: 'sarah@imposterx.com', role: 'System Admin', status: 'Active' },
    { id: 'usr_2', name: 'John Doe', email: 'john@imposterx.com', role: 'Security Analyst', status: 'Active' },
    { id: 'usr_3', name: 'James Smith', email: 'james@imposterx.com', role: 'Security Analyst', status: 'Suspended' }
  ]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Security Analyst');

  // Load Testing Tool States
  const [loadTestState, setLoadTestState] = useState('idle'); // idle, running, completed
  const [loadTestConcurrency, setLoadTestConcurrency] = useState(100);
  const [loadTestDuration, setLoadTestDuration] = useState(60);
  const [loadTestEndpoint, setLoadTestEndpoint] = useState('/api/system/load-test/target');
  const [loadTestStats, setLoadTestStats] = useState({
    state: 'idle',
    concurrency: 100,
    duration: 60,
    elapsed_time: 0,
    total_requests: 0,
    successful_requests: 0,
    failed_requests: 0,
    rps: 0,
    latency: { avg: 0, min: 0, max: 0 },
    logs: []
  });
  const [loadTestLogs, setLoadTestLogs] = useState([]);
  const loadTestTerminalRef = useRef(null);

  // API Call helper with Authorization headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {})
    };
  };

  // Dynamic dashboard index computations
  const totalScansCount = globalStats.total_scans || 0;
  const fakeScansCount = globalStats.threat_detected || 0;
  const suspiciousScansCount = globalStats.suspicious_scans || 0;
  const safeScansCount = globalStats.safe_profiles || 0;

  const fakePercent = totalScansCount > 0 ? Math.round((fakeScansCount / totalScansCount) * 100) : 0;
  const suspiciousPercent = totalScansCount > 0 ? Math.round((suspiciousScansCount / totalScansCount) * 100) : 0;
  const safePercent = totalScansCount > 0 ? Math.max(0, 100 - fakePercent - suspiciousPercent) : 0;
  const threatRate = totalScansCount > 0 ? Math.round(((fakeScansCount + suspiciousScansCount) / totalScansCount) * 100) : 0;

  // Platform distribution calculations
  const igCount = scanHistory.filter(s => s.platform === 'Instagram').length;
  const xCount = scanHistory.filter(s => s.platform === 'X' || s.platform === 'Twitter').length;
  const fbCount = scanHistory.filter(s => s.platform === 'Facebook').length;
  const liCount = scanHistory.filter(s => s.platform === 'LinkedIn').length;
  const tkCount = scanHistory.filter(s => s.platform === 'TikTok').length;
  const totalPlatformCount = igCount + xCount + fbCount + liCount + tkCount;

  const igP = totalPlatformCount > 0 ? Math.round((igCount / totalPlatformCount) * 100) : 0;
  const xP = totalPlatformCount > 0 ? Math.round((xCount / totalPlatformCount) * 100) : 0;
  const fbP = totalPlatformCount > 0 ? Math.round((fbCount / totalPlatformCount) * 100) : 0;
  const liP = totalPlatformCount > 0 ? Math.round((liCount / totalPlatformCount) * 100) : 0;
  const tkP = totalPlatformCount > 0 ? Math.max(0, 100 - igP - xP - fbP - liP) : 0;

  const renderAnalyticsLineChart = () => {
    const trend = globalStats.detection_trend && globalStats.detection_trend.length > 0
      ? globalStats.detection_trend
      : [
          { date: '06-15', scans: 0, threats: 0 },
          { date: '06-16', scans: 0, threats: 0 },
          { date: '06-17', scans: 0, threats: 0 },
          { date: '06-18', scans: 0, threats: 0 },
          { date: '06-19', scans: 0, threats: 0 },
          { date: '06-20', scans: 0, threats: 0 }
        ];

    const width = 600;
    const height = 200;
    const paddingX = 40;
    const paddingY = 20;

    const maxVal = Math.max(...trend.map(d => d.scans), 10);

    const getPoints = (key) => {
      return trend.map((point, index) => {
        const x = paddingX + (index / (trend.length - 1)) * (width - 2 * paddingX);
        const y = height - paddingY - (point[key] / maxVal) * (height - 2 * paddingY);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    };

    const scanPath = getPoints('scans');
    const threatPath = getPoints('threats');

    return (
      <svg className="full-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[40, 80, 120, 160, 200].map((y, i) => (
          <line key={i} x1="40" y1={y} x2="580" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {[100, 200, 300, 400, 500].map((x, i) => (
          <line key={i} x1={x} y1="20" x2={x} y2="210" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        ))}
        
        {scanPath && <path d={scanPath} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />}
        {threatPath && <path d={threatPath} fill="none" stroke="var(--color-danger)" strokeWidth="3" strokeLinecap="round" />}

        {trend.map((point, index) => {
          const x = paddingX + (index / (trend.length - 1)) * (width - 2 * paddingX);
          const dateStr = point.date.split('-').slice(1).join('-') || point.date;
          return (
            <text key={index} x={x} y={height - 5} className="chart-axis-text" textAnchor="middle">
              {dateStr}
            </text>
          );
        })}
      </svg>
    );
  };

  // Fetch metrics and notifications at load
  useEffect(() => {
    if (user) {
      fetchGlobalData();
    }
  }, [user]);

  // Keep terminal logs scrolled to bottom
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [liveLogs]);

  // Keep load test terminal logs scrolled to bottom
  useEffect(() => {
    if (loadTestTerminalRef.current) {
      loadTestTerminalRef.current.scrollTop = loadTestTerminalRef.current.scrollHeight;
    }
  }, [loadTestLogs]);

  // Poll load test status when running
  useEffect(() => {
    let intervalId = null;
    
    if (loadTestState === 'running') {
      const poll = async () => {
        try {
          const res = await fetch(`${API_BASE}/system/load-test/status`, { headers: getHeaders() });
          if (res.ok) {
            const data = await res.json();
            setLoadTestStats(data);
            if (data.logs) {
              setLoadTestLogs(data.logs);
            }
            if (data.state === 'completed') {
              setLoadTestState('completed');
            } else if (data.state === 'idle') {
              setLoadTestState('idle');
            }
          }
        } catch (err) {
          console.error("Error polling load test:", err);
        }
      };

      poll();
      intervalId = setInterval(poll, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadTestState]);

  const fetchGlobalData = async () => {
    try {
      // Fetch Reports
      const statsRes = await fetch(`${API_BASE}/reports`, { headers: getHeaders() });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const stats = {
          total_scans: statsData.total_scans || 0,
          threat_detected: statsData.threat_detected || 0,
          suspicious_scans: statsData.suspicious_scans || 0,
          safe_profiles: statsData.safe_profiles || 0,
          accuracy_rate: statsData.accuracy_rate || 0,
          avg_risk: statsData.avg_risk || 0,
          detection_trend: statsData.detection_trend || []
        };
        setGlobalStats(stats);
        localStorage.setItem('imposterx_stats', JSON.stringify(stats));
      }

      // Fetch Alerts
      const alertsRes = await fetch(`${API_BASE}/alerts`, { headers: getHeaders() });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      // Fetch History
      const historyRes = await fetch(`${API_BASE}/scan/history`, { headers: getHeaders() });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setScanHistory(historyData);
        localStorage.setItem('imposterx_history', JSON.stringify(historyData));
      }
    } catch (err) {
      console.error("Error loading analytical data:", err);
    }
  };

  // Auth Operations
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          email: authEmail,
          password: authPassword,
          full_name: authFullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('imposterx_user', JSON.stringify(data));
        setCurrentPage('dashboard');
      } else {
        setAuthError(data.detail || "Registration failed. Try again.");
      }
    } catch (err) {
      // Offline fallback
      const fakeUser = {
        username: authUsername || "admin",
        email: authEmail || "admin@imposterx.com",
        full_name: authFullName || "Admin Console User",
        token: "jwt_mock_token_for_admin"
      };
      setUser(fakeUser);
      localStorage.setItem('imposterx_user', JSON.stringify(fakeUser));
      setCurrentPage('dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('imposterx_user', JSON.stringify(data));
        setCurrentPage('dashboard');
      } else {
        setAuthError(data.detail || "Invalid credentials.");
      }
    } catch (err) {
      // Offline fallback
      if (authUsername === 'admin' || authUsername === 'analyst') {
        const fakeUser = {
          username: authUsername,
          email: `${authUsername}@imposterx.com`,
          full_name: authUsername === 'admin' ? "Admin User" : "Security Analyst",
          token: `jwt_mock_token_for_${authUsername}`
        };
        setUser(fakeUser);
        localStorage.setItem('imposterx_user', JSON.stringify(fakeUser));
        setCurrentPage('dashboard');
      } else {
        setAuthError("Offline fallback: Use 'admin' or 'analyst' for access.");
      }
    }
  };

  const handleGuestAccess = async () => {
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('imposterx_user', JSON.stringify(data));
        setCurrentPage('dashboard');
      }
    } catch (err) {
      // Offline fallback
      const guestUser = {
        username: "offline_guest",
        email: "guest@imposterx.com",
        full_name: "Guest Mode (Offline)",
        token: "offline_token"
      };
      setUser(guestUser);
      localStorage.setItem('imposterx_user', JSON.stringify(guestUser));
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    // Navigate to Logged Out splash page (Screen 31)
    setCurrentPage('logged_out');
  };

  const finalizeLogout = () => {
    setUser(null);
    localStorage.removeItem('imposterx_user');
    localStorage.removeItem('imposterx_stats');
    localStorage.removeItem('imposterx_history');
    setCurrentPage('splash');
    // Clear forms & wizard
    setAuthUsername('');
    setAuthPassword('');
    setAuthEmail('');
    setAuthFullName('');
    setScanUsername('');
    setScanUrl('');
    setSelectedFile(null);
    setFilePreview(null);
    setLatestScanResult(null);
    setWizardStep(1);
    setProcessingPercentage(0);
    setLiveLogs([]);
  };

  // Drag & drop handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        url: URL.createObjectURL(file)
      });
    }
  };

  // Trigger scanning sequence with animated live logs terminal
  const triggerScan = async () => {
    if (!scanUsername) return;

    setCurrentPage('processing');
    setProcessingPercentage(0);
    setLiveLogs([]);
    setActiveStepIndex(0);

    const logsDatabase = [
      "Establishing secure handshake with ImposterX social database...",
      "Resolving routing maps for target username: " + scanUsername,
      "Retrieving public profile headers & metadata...",
      "Analyzing user description using Natural Language Processing (NLP)...",
      "Scanning bio texts for typical botnet keyword spam vectors...",
      "Executing Vision analysis on target user avatar...",
      "Checking face boundaries and deepfake generative signatures...",
      "Verifying pixel artifacts and GAN structural anomalies...",
      "Analyzing behavioral timing profiles and posting frequencies...",
      "Auditing interaction circadian timeline consistencies...",
      "Correlating network graph nodes with known bot registries...",
      "Calculating coordinate clustering index using GNN modeling...",
      "Aggregating multidimensional vulnerability indexes...",
      "Compiling final threat assessment records..."
    ];

    // Log append simulation
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logsDatabase.length) {
        setLiveLogs(prev => [...prev, logsDatabase[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 250);

    // Percentage progress bar animation
    const progressInterval = setInterval(() => {
      setProcessingPercentage(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    try {
      // Build form data
      const formData = new FormData();
      formData.append("username", scanUsername);
      formData.append("platform", scanPlatform);
      if (scanUrl) formData.append("url", scanUrl);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : {},
        body: formData
      });

      const data = await res.json();
      
      setTimeout(() => {
        if (res.ok) {
          setLatestScanResult(data);
          setCurrentPage('results');
          setActiveResultTab('overview');
          fetchGlobalData(); // reload statistics
        } else {
          alert(data.detail || "Scanning failed.");
          setCurrentPage('new_scan');
        }
      }, 3600);

    } catch (err) {
      setTimeout(() => {
        // Offline simulation logic
        const isCrypto = scanUsername.toLowerCase().includes('crypto') || scanUsername.toLowerCase().includes('bot');
        const calculatedRisk = isCrypto ? 89 : 18;
        const mockResult = {
          id: "mock_" + Date.now().toString().slice(-4),
          username: scanUsername,
          platform: scanPlatform,
          url: scanUrl || `https://${scanPlatform.toLowerCase()}.com/${scanUsername.replace('@','')}`,
          risk_score: calculatedRisk,
          category: calculatedRisk >= 75 ? "High-Risk Fake Profile" : calculatedRisk >= 40 ? "Suspicious Account" : "Genuine Account",
          text_score: isCrypto ? 90 : 12,
          image_score: isCrypto ? 82 : 15,
          behavior_score: isCrypto ? 94 : 8,
          network_score: isCrypto ? 88 : 10,
          bot_score: isCrypto ? 89 : 11,
          details: {
            text: {
              score: isCrypto ? 90 : 12,
              bio_analysis: isCrypto ? "Profile description contains typical crypto spam keywords ('airdrop', 'guaranteed returns') and repetitive hashtags." : "Natural language style, no spam signatures detected.",
              keyword_detection: isCrypto ? "Detected typical marketing keywords." : "None.",
              ai_probability: isCrypto ? "90%" : "5%",
              username_analysis: "Analyzing handle syntax structure."
            },
            image: {
              score: isCrypto ? 82 : 15,
              deepfake_probability: isCrypto ? "82%" : "5%",
              authenticity_score: isCrypto ? "18%" : "85%",
              manipulation_detected: isCrypto ? "Yes" : "No"
            },
            behavior: {
              score: isCrypto ? 94 : 8,
              posting_frequency: isCrypto ? "Extremely high posting activity patterns." : "Active hours look standard.",
              engagement_pattern: "Auditing conversational structures.",
              follower_ratio: isCrypto ? "Suspicious follower ratio." : "Normal follower ratio.",
              activity_consistency: isCrypto ? "Coordinated scheduling sequences." : "Normal activity timeline."
            },
            network: {
              score: isCrypto ? 88 : 10,
              trust_score: isCrypto ? "12%" : "90%",
              mutual_analysis: isCrypto ? "Graph nodes overlap significantly with bot networks." : "Decentralized node links.",
              suspicious_connections: isCrypto ? "Coordinated bot ring." : "None."
            },
            bot: {
              score: isCrypto ? 89 : 11,
              automation_likelihood: isCrypto ? "89%" : "11%",
              bot_score_detail: isCrypto ? "89/100" : "11/100",
              spam_indicators: isCrypto ? "Spam vectors detected in profile nodes." : "No significant spam signatures."
            }
          },
          timestamp: new Date().toISOString()
        };
        setLatestScanResult(mockResult);
        setCurrentPage('results');
        setActiveResultTab('overview');
        // Add to history list locally
        setScanHistory(prev => {
          const newHistory = [mockResult, ...prev];
          localStorage.setItem('imposterx_history', JSON.stringify(newHistory));
          return newHistory;
        });
        setGlobalStats(prev => {
          const newStats = {
            ...prev,
            total_scans: prev.total_scans + 1,
            threat_detected: calculatedRisk >= 75 ? prev.threat_detected + 1 : prev.threat_detected,
            suspicious_scans: (calculatedRisk >= 40 && calculatedRisk < 75) ? prev.suspicious_scans + 1 : prev.suspicious_scans,
            safe_profiles: calculatedRisk < 40 ? prev.safe_profiles + 1 : prev.safe_profiles
          };
          localStorage.setItem('imposterx_stats', JSON.stringify(newStats));
          return newStats;
        });
      }, 3600);
    }
  };

  const handleFlagAccount = async () => {
    if (!latestScanResult) return;
    const isCurrentlyFlagged = latestScanResult.flagged;
    
    try {
      const res = await fetch(`${API_BASE}/alerts/flag`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          username: latestScanResult.username,
          platform: latestScanResult.platform,
          risk_score: latestScanResult.risk_score,
          flagged: !isCurrentlyFlagged
        })
      });
      if (res.ok) {
        setLatestScanResult({
          ...latestScanResult,
          flagged: !isCurrentlyFlagged
        });
        fetchGlobalData();
      }
    } catch (err) {
      setLatestScanResult({
        ...latestScanResult,
        flagged: !isCurrentlyFlagged
      });
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchGlobalData();
      }
    } catch (err) {
      setAlerts(alerts.filter(a => a.id !== alertId));
    }
  };

  const regenerateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newKey = 'sk_live_';
    for (let i = 0; i < 32; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(newKey);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  // Load Testing Operations
  const startLoadTest = async () => {
    setLoadTestState('running');
    setLoadTestLogs(["[System] Dispatching request to start load test..."]);
    try {
      const res = await fetch(`${API_BASE}/system/load-test/start`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          concurrency: loadTestConcurrency,
          duration: loadTestDuration,
          endpoint: loadTestEndpoint
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadTestState('idle');
        alert(data.detail || "Failed to start load test.");
      }
    } catch (err) {
      setLoadTestState('idle');
      alert("Error starting load test: " + err.message);
    }
  };

  const stopLoadTest = async () => {
    try {
      await fetch(`${API_BASE}/system/load-test/stop`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (err) {
      console.error("Error stopping load test:", err);
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUserObj = {
      id: 'usr_' + (adminUsers.length + 1),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active'
    };
    setAdminUsers([...adminUsers, newUserObj]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const getGaugeStrokeDash = (score) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const percentage = score / 100;
    return `${circumference * percentage} ${circumference * (1 - percentage)}`;
  };

  const getRiskClass = (score) => {
    if (score >= 75) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getRiskColorName = (score) => {
    if (score >= 75) return 'danger';
    if (score >= 40) return 'warning';
    return 'success';
  };

  // Filtered scan history reports
  const filteredHistory = scanHistory.filter(scan => {
    const matchesSearch = scan.username.toLowerCase().includes(historySearch.toLowerCase());
    const matchesPlatform = historyPlatformFilter === 'All' || scan.platform === historyPlatformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION (for authenticated views) */}
      {!['splash', 'auth', 'processing', 'logged_out'].includes(currentPage) && (
        <aside className="sidebar">
          <div className="logo-section">
            <div className="logo-icon-container">
              <Shield />
            </div>
            <span className="logo-text">ImposterX</span>
            <span className="logo-badge">PRO</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ul className="nav-links">
              {/* User Navigation Section */}
              <div className="sidebar-group-label">User Operations</div>
              <li 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                <Activity size={18} />
                <span>Dashboard</span>
              </li>
              <li 
                className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
                onClick={() => setCurrentPage('analytics')}
              >
                <TrendingUp size={18} />
                <span>Analytics Dashboard</span>
              </li>
              <li 
                className={`nav-item ${currentPage === 'new_scan' ? 'active' : ''}`}
                onClick={() => {
                  setWizardStep(1);
                  setScanUsername('');
                  setScanUrl('');
                  setSelectedFile(null);
                  setFilePreview(null);
                  setCurrentPage('new_scan');
                }}
              >
                <Search size={18} />
                <span>New Scan Wizard</span>
              </li>
              <li 
                className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
                onClick={() => setCurrentPage('reports')}
              >
                <FileText size={18} />
                <span>Scan History</span>
              </li>
              
              {/* Admin-only options */}
              {user?.username === 'admin' && (
                <>
                  <div className="sidebar-group-label">Admin Control</div>
                  <li 
                    className={`nav-item ${currentPage === 'admin_dashboard' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('admin_dashboard')}
                  >
                    <Users size={18} />
                    <span>Admin Dashboard</span>
                  </li>
                  <li 
                    className={`nav-item ${currentPage === 'user_management' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('user_management')}
                  >
                    <User size={18} />
                    <span>User Management</span>
                  </li>
                  <li 
                    className={`nav-item ${currentPage === 'system_analytics' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('system_analytics')}
                  >
                    <HardDrive size={18} />
                    <span>System Analytics</span>
                  </li>
                </>
              )}

              <div className="sidebar-group-label">Preferences</div>
              <li 
                className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage('settings');
                  setActiveSettingsTab('general');
                }}
              >
                <Settings size={18} />
                <span>System Settings</span>
              </li>
            </ul>

            <div className="sidebar-footer">
              <div className="user-profile-summary">
                <div className="avatar-circle">
                  {user?.full_name ? user.full_name.split(' ').map(n=>n[0]).join('') : 'GU'}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user?.full_name || 'Guest User'}</span>
                  <span className="user-role">{user?.username === 'admin' ? 'System Admin' : 'Security Analyst'}</span>
                </div>
              </div>
              
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Exit Terminal</span>
              </button>
            </div>
          </nav>
        </aside>
      )}

      {/* MAIN RENDER ENGINE */}
      <main className="main-content-layout">
        
        {/* --- SPLASH INTRO VIEW --- */}
        {currentPage === 'splash' && (
          <div className="splash-container">
            <div className="splash-logo-glow">
              <Shield />
            </div>
            <h1 className="splash-title">ImposterX</h1>
            <p className="splash-subtitle">
              Next-generation multi-modal generative AI framework for fake profile, social engineering, and bot account detection.
            </p>
            
            <div className="splash-btn-group">
              <button className="primary-btn" onClick={() => { setCurrentPage('auth'); setAuthMode('login'); }}>
                Login
              </button>
              <button className="secondary-btn" onClick={handleGuestAccess}>
                Continue as Guest
              </button>
            </div>
            
            <div className="splash-loading-indicator">
              <div className="mini-spinner"></div>
              <span>Secure interface handshake established</span>
            </div>
          </div>
        )}

        {/* --- AUTHENTICATION VIEW --- */}
        {currentPage === 'auth' && (
          <div className="auth-container">
            <div className="auth-card glass-panel">
              <div className="auth-header">
                <div className="auth-logo">
                  <Shield />
                </div>
                <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Admin Account'}</h2>
                <p>
                  {authMode === 'login' 
                    ? 'Sign in to access ImposterX security logs and scanning suites.' 
                    : 'Register a new administrative console credentials.'}
                </p>
              </div>

              <form className="auth-form" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                {authMode === 'register' && (
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User />
                      <input 
                        type="text" 
                        placeholder="Enter full name" 
                        className="input-field"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="input-group">
                  <label>Console Username / Email</label>
                  <div className="input-wrapper">
                    <User />
                    <input 
                      type="text" 
                      placeholder="Username or email" 
                      className="input-field"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="input-group">
                    <label>Security Email</label>
                    <div className="input-wrapper">
                      <User />
                      <input 
                        type="email" 
                        placeholder="email@imposterx.com" 
                        className="input-field"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>System Password</label>
                  <div className="input-wrapper">
                    <Shield />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-field"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="auth-action-row">
                    <label className="remember-me">
                      <input type="checkbox" />
                      <span>Remember this terminal</span>
                    </label>
                    <span className="forgot-password" style={{ cursor: 'pointer' }} onClick={() => alert("Contact system administrator to reset console key.")}>Forgot password?</span>
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="auth-action-row">
                    <label className="remember-me">
                      <input type="checkbox" required />
                      <span>I agree to the Security Terms & Conditions</span>
                    </label>
                  </div>
                )}

                {authError && <div className="auth-error-badge">{authError}</div>}

                <button type="submit" className="submit-btn">
                  {authMode === 'login' ? 'Authenticate Login' : 'Register Console Key'}
                </button>
              </form>

              <div className="auth-separator">OR</div>

              <button className="guest-login-btn" onClick={handleGuestAccess}>
                Continue in Monitor-Only Mode
              </button>

              <div className="auth-toggle-link">
                {authMode === 'login' ? (
                  <p>New terminal console? <span onClick={() => { setAuthMode('register'); setAuthError(''); }}>Register key</span></p>
                ) : (
                  <p>Already have credentials? <span onClick={() => { setAuthMode('login'); setAuthError(''); }}>Access Login</span></p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- USER DASHBOARD (Screen 3) --- */}
        {currentPage === 'dashboard' && (
          <div className="dashboard-view-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Dashboard overview</h1>
                <p>Welcome back, {user?.full_name || 'Guest'}. System status reports are normal.</p>
              </div>
              <button className="scan-cta-btn" onClick={() => { setWizardStep(1); setCurrentPage('new_scan'); }}>
                <Search size={18} />
                <span>Run New Scan</span>
              </button>
            </header>

            {/* Metrics cards */}
            <div className="stats-grid">
              <div className="stat-card glass-panel blue">
                <div className="stat-header">
                  <span>Total Profiles Evaluated</span>
                  <div className="stat-icon"><Users size={20} /></div>
                </div>
                <div className="stat-value">{globalStats.total_scans.toLocaleString()}</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+12.4% this week</span>
                </div>
              </div>

              <div className="stat-card glass-panel red">
                <div className="stat-header">
                  <span>High Risk Profiles</span>
                  <div className="stat-icon"><AlertTriangle size={20} /></div>
                </div>
                <div className="stat-value">{globalStats.threat_detected.toLocaleString()}</div>
                <div className="stat-trend down">
                  <AlertTriangle size={14} />
                  <span>+8.2% high threats</span>
                </div>
              </div>

              <div className="stat-card glass-panel warning">
                <div className="stat-header">
                  <span>Suspicious Scans</span>
                  <div className="stat-icon"><Info size={20} /></div>
                </div>
                <div className="stat-value">{globalStats.suspicious_scans.toLocaleString()}</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+2.3% check audits</span>
                </div>
              </div>

              <div className="stat-card glass-panel green">
                <div className="stat-header">
                  <span>Safe Profiles Verified</span>
                  <div className="stat-icon"><CheckCircle size={20} /></div>
                </div>
                <div className="stat-value">{globalStats.safe_profiles.toLocaleString()}</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+4.1% organic</span>
                </div>
              </div>
            </div>

            {/* Layout split: charts and quick buttons */}
            <div className="dashboard-layout-row">
              <div className="chart-panel glass-panel">
                <div className="panel-header">
                  <h3>Overall Detection Index</h3>
                  <span className="subtitle-text">Live ratio split</span>
                </div>
                <div className="radial-stats-container">
                  <div className="svg-radial-chart">
                    <svg width="100%" height="100%" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--bg-tertiary)" strokeWidth="18" />
                      {/* Fake Profiles - Red */}
                      <circle 
                        cx="100" cy="100" r="80" 
                        fill="none" 
                        stroke="var(--color-danger)" 
                        strokeWidth="18" 
                        strokeDasharray={getGaugeStrokeDash(fakePercent)}
                        transform="rotate(-90 100 100)"
                        strokeLinecap="round"
                      />
                      {/* Suspicious - Yellow */}
                      <circle 
                        cx="100" cy="100" r="80" 
                        fill="none" 
                        stroke="var(--color-warning)" 
                        strokeWidth="18" 
                        strokeDasharray={getGaugeStrokeDash(suspiciousPercent)}
                        transform={`rotate(${360 * (fakePercent / 100) - 90} 100 100)`}
                        strokeLinecap="round"
                      />
                      {/* Real Profiles - Green */}
                      <circle 
                        cx="100" cy="100" r="80" 
                        fill="none" 
                        stroke="var(--color-success)" 
                        strokeWidth="18" 
                        strokeDasharray={getGaugeStrokeDash(safePercent)}
                        transform={`rotate(${360 * ((fakePercent + suspiciousPercent) / 100) - 90} 100 100)`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="radial-percentage-text">
                      <span className="num">{threatRate}%</span>
                      <span className="label">Threat Rate</span>
                    </div>
                  </div>
                  <div className="radial-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: 'var(--color-success)' }}></div>
                      <span>Real Profiles</span>
                      <span className="legend-value">{safePercent}%</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: 'var(--color-warning)' }}></div>
                      <span>Suspicious</span>
                      <span className="legend-value">{suspiciousPercent}%</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: 'var(--color-danger)' }}></div>
                      <span>Fake Profiles</span>
                      <span className="legend-value">{fakePercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="quick-actions-card glass-panel">
                <h3>Quick Controls</h3>
                <div className="quick-actions-grid">
                  <div className="action-tile" onClick={() => { setWizardStep(1); setCurrentPage('new_scan'); }}>
                    <Search />
                    <span>Run Scan</span>
                  </div>
                  <div className="action-tile" onClick={() => setCurrentPage('analytics')}>
                    <TrendingUp />
                    <span>Analytics</span>
                  </div>
                  <div className="action-tile" onClick={() => setCurrentPage('reports')}>
                    <FileText />
                    <span>Report Logs</span>
                  </div>
                  <div className="action-tile" onClick={() => { setCurrentPage('settings'); setActiveSettingsTab('api'); }}>
                    <Key />
                    <span>API Settings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scans */}
            <div className="recent-scans-card glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <History size={18} />
                <span>Recent Core Scans</span>
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Platform</th>
                      <th>Risk Index</th>
                      <th>Classification</th>
                      <th>Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanHistory.slice(0, 5).map((scan, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '600' }}>{scan.username}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{scan.platform}</td>
                        <td>
                          <span className={`risk-text-value ${getRiskClass(scan.risk_score)}`} style={{ fontWeight: '700' }}>{scan.risk_score}%</span>
                        </td>
                        <td>
                          <span className={`results-badge ${getRiskClass(scan.risk_score)}`}>
                            {scan.category}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {new Date(scan.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <button 
                            className="secondary-btn" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                            onClick={() => {
                              setLatestScanResult(scan);
                              setCurrentPage('results');
                              setActiveResultTab('overview');
                            }}
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                    {scanHistory.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No historical logs available. Run a new scan to start.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- DETAILED ANALYTICS DASHBOARD (Screen 4) --- */}
        {currentPage === 'analytics' && (
          <div className="analytics-view-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Analytics Dashboard</h1>
                <p>Consolidated statistics and historical database performance reports.</p>
              </div>
            </header>

            <div className="analytics-grid-row">
              {/* Chart 1: Scans Over Time */}
              <div className="chart-card-full glass-panel">
                <h3>Scans & Threats Over Time</h3>
                <div className="svg-chart-wrapper" style={{ height: '260px', marginTop: '16px' }}>
                  {renderAnalyticsLineChart()}
                </div>
                <div className="chart-legends-row">
                  <div className="legend-marker blue"><span>Total Volume Scans</span></div>
                  <div className="legend-marker red"><span>Threat Indicators Flagged</span></div>
                </div>
              </div>
            </div>

            <div className="analytics-split-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
              {/* Chart 2: Platform Distribution */}
              <div className="chart-card glass-panel" style={{ padding: '24px' }}>
                <h3>Platform Distribution</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', marginTop: '16px' }}>
                  <svg width="180" height="180" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="20" />
                    {igP > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-primary)" strokeWidth="20" strokeDasharray={`${440 * (igP / 100)} 440`} transform="rotate(-90 100 100)" />}
                    {xP > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-secondary)" strokeWidth="20" strokeDasharray={`${440 * (xP / 100)} 440`} transform={`rotate(${360 * (igP / 100) - 90} 100 100)`} />}
                    {fbP > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray={`${440 * (fbP / 100)} 440`} transform={`rotate(${360 * ((igP + xP) / 100) - 90} 100 100)`} />}
                    {liP > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-warning)" strokeWidth="20" strokeDasharray={`${440 * (liP / 100)} 440`} transform={`rotate(${360 * ((igP + xP + fbP) / 100) - 90} 100 100)`} />}
                    {tkP > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-success)" strokeWidth="20" strokeDasharray={`${440 * (tkP / 100)} 440`} transform={`rotate(${360 * ((igP + xP + fbP + liP) / 100) - 90} 100 100)`} />}
                  </svg>
                  <div className="radial-legends-list" style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }}></div>
                      <span>Instagram ({igP}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-secondary)', borderRadius: '3px' }}></div>
                      <span>X (Twitter) ({xP}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: '#a855f7', borderRadius: '3px' }}></div>
                      <span>Facebook ({fbP}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-warning)', borderRadius: '3px' }}></div>
                      <span>LinkedIn ({liP}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-success)', borderRadius: '3px' }}></div>
                      <span>TikTok ({tkP}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Risk Level Distribution */}
              <div className="chart-card glass-panel" style={{ padding: '24px' }}>
                <h3>Risk Level Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', height: '220px', marginTop: '16px' }}>
                  <div className="risk-dist-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>High Risk (&ge;75%)</span>
                      <span style={{ fontWeight: '600' }}>{fakeScansCount} Scans</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                      <div style={{ width: `${fakePercent}%`, height: '100%', backgroundColor: 'var(--color-danger)', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                  <div className="risk-dist-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Suspicious (40% - 74%)</span>
                      <span style={{ fontWeight: '600' }}>{suspiciousScansCount} Scans</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                      <div style={{ width: `${suspiciousPercent}%`, height: '100%', backgroundColor: 'var(--color-warning)', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                  <div className="risk-dist-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span>Genuine (&lt;40%)</span>
                      <span style={{ fontWeight: '600' }}>{safeScansCount} Scans</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                      <div style={{ width: `${safePercent}%`, height: '100%', backgroundColor: 'var(--color-success)', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SCAN PROFILE WIZARD FLOW (Screens 5-8) --- */}
        {currentPage === 'new_scan' && (
          <div className="new-scan-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Identity Verification Terminal</h1>
                <p>Configure pipeline parameters and execute multi-modal profiles check.</p>
              </div>
            </header>

            {/* Stepper indicators */}
            <div className="stepper-wrapper glass-panel">
              <div className={`stepper-node ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
                <div className="node-circle">{wizardStep > 1 ? <Check size={14} /> : '1'}</div>
                <span>Platform</span>
              </div>
              <div className="step-divider"></div>
              <div className={`stepper-node ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
                <div className="node-circle">{wizardStep > 2 ? <Check size={14} /> : '2'}</div>
                <span>Identity Info</span>
              </div>
              <div className="step-divider"></div>
              <div className={`stepper-node ${wizardStep === 3 ? 'active' : wizardStep > 3 ? 'completed' : ''}`}>
                <div className="node-circle">{wizardStep > 3 ? <Check size={14} /> : '3'}</div>
                <span>Vision Source</span>
              </div>
              <div className="step-divider"></div>
              <div className={`stepper-node ${wizardStep === 4 ? 'active' : ''}`}>
                <div className="node-circle">4</div>
                <span>Check Configuration</span>
              </div>
            </div>

            <div className="wizard-card-body glass-panel" style={{ padding: '36px', marginTop: '24px' }}>
              
              {/* STEP 1: Select Platform (Screen 5) */}
              {wizardStep === 1 && (
                <div className="wizard-step-content animate-fade-in">
                  <h3 className="wizard-heading">Select Social Media Platform</h3>
                  <p className="wizard-subheading">Choose which network API model coordinates the data fetching.</p>
                  
                  <div className="platform-options-grid">
                    {['Instagram', 'X', 'Facebook', 'LinkedIn', 'TikTok'].map((platform) => (
                      <div 
                        key={platform} 
                        className={`platform-selection-tile ${scanPlatform === platform ? 'selected' : ''}`}
                        onClick={() => setScanPlatform(platform)}
                      >
                        <div className="platform-icon-indicator">🛡️</div>
                        <span className="platform-title">{platform === 'X' ? 'X (Twitter)' : platform}</span>
                      </div>
                    ))}
                  </div>

                  <div className="wizard-actions-row">
                    <button className="primary-btn wizard-next-btn" onClick={() => setWizardStep(2)}>
                      <span>Continue to Details</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Enter Details (Screen 6) */}
              {wizardStep === 2 && (
                <div className="wizard-step-content animate-fade-in">
                  <h3 className="wizard-heading">Profile Handle Credentials</h3>
                  <p className="wizard-subheading">Input details of the account which requires indexing.</p>

                  <div className="input-group" style={{ marginBottom: '20px' }}>
                    <label>Profile Handle / Username</label>
                    <div className="input-wrapper">
                      <User />
                      <input 
                        type="text" 
                        placeholder="e.g. @suspect_username" 
                        className="input-field"
                        value={scanUsername}
                        onChange={(e) => setScanUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label>Profile Link / URL (Optional)</label>
                    <div className="input-wrapper">
                      <LinkIcon />
                      <input 
                        type="url" 
                        placeholder={`https://${scanPlatform.toLowerCase()}.com/username`} 
                        className="input-field"
                        value={scanUrl}
                        onChange={(e) => setScanUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="wizard-actions-row">
                    <button className="secondary-btn" onClick={() => setWizardStep(1)}>Back</button>
                    <button className="primary-btn wizard-next-btn" onClick={() => {
                      if (!scanUsername) {
                        alert("Username is required.");
                        return;
                      }
                      setWizardStep(3);
                    }}>
                      <span>Upload Avatar</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Upload Profile Image (Screen 7) */}
              {wizardStep === 3 && (
                <div className="wizard-step-content animate-fade-in">
                  <h3 className="wizard-heading">Vision Verification Data</h3>
                  <p className="wizard-subheading">Upload a profile picture screenshot to run deepfake detection layers.</p>

                  {!selectedFile ? (
                    <div className="upload-dropzone" onClick={() => document.getElementById('file-wizard-upload-input').click()}>
                      <input 
                        type="file" 
                        id="file-wizard-upload-input" 
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div className="upload-icon-container">
                        <Upload size={24} />
                      </div>
                      <p>Click to browse profile images or drag screenshot file here</p>
                      <span>Supports JPG, PNG up to 8MB</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '30px' }}>
                      <div className="file-preview-card">
                        {filePreview.url ? (
                          <img src={filePreview.url} alt="preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon size={24} />
                        )}
                        <div className="file-preview-info">
                          <span className="name">{filePreview?.name}</span>
                          <span className="size">{filePreview?.size}</span>
                        </div>
                        <button className="remove-file-btn" type="button" onClick={() => { setSelectedFile(null); setFilePreview(null); }}>
                          <CloseIcon size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="wizard-actions-row">
                    <button className="secondary-btn" onClick={() => setWizardStep(2)}>Back</button>
                    <button className="primary-btn wizard-next-btn" onClick={() => setWizardStep(4)}>
                      <span>Configure Pipelines</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Scan Configuration (Screen 8) */}
              {wizardStep === 4 && (
                <div className="wizard-step-content animate-fade-in">
                  <h3 className="wizard-heading">Configure Analysis Engines</h3>
                  <p className="wizard-subheading">Select check methods to execute during scan pipeline.</p>

                  <div className="config-toggles-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '24px 0' }}>
                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Profile Info Checks</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Validate usernames and link headers</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.profileInfo} onChange={(e) => setConfigToggles({...configToggles, profileInfo: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>

                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Image Analysis (GAN/Face)</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Identify deepfakes and face manipulation</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.imageAnalysis} onChange={(e) => setConfigToggles({...configToggles, imageAnalysis: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>

                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Text Analysis (NLP)</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Search bio and text content for spam keywords</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.textAnalysis} onChange={(e) => setConfigToggles({...configToggles, textAnalysis: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>

                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Behavior Analytics</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Evaluate activity patterns and circadian cycles</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.behaviorAnalysis} onChange={(e) => setConfigToggles({...configToggles, behaviorAnalysis: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>

                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Network Graph Checks</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Map relationships via GNN models</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.networkAnalysis} onChange={(e) => setConfigToggles({...configToggles, networkAnalysis: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>

                    <div className="toggle-option-card glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem' }}>Bot Pattern Prediction</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classify likeness of account automation</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={configToggles.botAnalysis} onChange={(e) => setConfigToggles({...configToggles, botAnalysis: e.target.checked})} />
                        <span className="slider-round"></span>
                      </label>
                    </div>
                  </div>

                  <div className="wizard-actions-row">
                    <button className="secondary-btn" onClick={() => setWizardStep(3)}>Back</button>
                    <button className="primary-btn wizard-next-btn" onClick={triggerScan}>
                      <Shield size={16} />
                      <span>Start ImposterX Scan</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* --- AI PROCESSING & LIVE DIAGNOSTICS STREAMING (Screens 9-10) --- */}
        {currentPage === 'processing' && (
          <div className="processing-view-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Neural Scan Pipeline In Progress</h1>
                <p>Deploying multi-modal heuristics to check profile index.</p>
              </div>
            </header>

            <div className="processing-split-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', marginTop: '20px' }}>
              
              {/* Screen 9: Status Gauges */}
              <div className="status-progress-card glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="scanner-radar-outer" style={{ width: '130px', height: '130px', marginBottom: '24px' }}>
                  <div className="scanner-pulse-ring"></div>
                  <div className="scanner-radar-inner" style={{ width: '90px', height: '90px' }}>
                    <Search />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>{processingPercentage}% Complete</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '6px' }}>Executing deep neural network heuristics...</p>
                
                {/* Metric Steps Indicators */}
                <div style={{ width: '100%', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Image Analysis (Deep Learning)</span>
                      <span>{Math.min(90, Math.floor(processingPercentage * 0.9))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: `${Math.min(90, Math.floor(processingPercentage * 0.9))}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Text Analysis (NLP spam score)</span>
                      <span>{Math.min(75, Math.floor(processingPercentage * 0.75))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: `${Math.min(75, Math.floor(processingPercentage * 0.75))}%`, height: '100%', backgroundColor: 'var(--color-secondary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>Behavior circadian audits</span>
                      <span>{Math.min(60, Math.floor(processingPercentage * 0.6))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: `${Math.min(60, Math.floor(processingPercentage * 0.6))}%`, height: '100%', backgroundColor: 'var(--color-warning)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span>GNN Node relationships</span>
                      <span>{Math.min(40, Math.floor(processingPercentage * 0.4))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: `${Math.min(40, Math.floor(processingPercentage * 0.4))}%`, height: '100%', backgroundColor: '#a855f7', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen 10: Live Diagnostics Logs Terminal */}
              <div className="terminal-logs-card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <Activity size={16} />
                    <span>Real-time Log Stream</span>
                  </h3>
                  <span className="blinking-indicator">● LIVE</span>
                </div>
                
                <div 
                  className="terminal-log-output" 
                  ref={logTerminalRef}
                  style={{
                    backgroundColor: '#03050c',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    padding: '16px',
                    borderRadius: '8px',
                    height: '320px',
                    overflowY: 'auto',
                    border: '1px solid var(--glass-border)',
                    color: '#00ffcc',
                    boxShadow: 'inset 0 0 10px rgba(0,255,204,0.1)'
                  }}
                >
                  {liveLogs.map((log, index) => (
                    <div key={index} className="terminal-log-line" style={{ marginBottom: '8px', opacity: 0.95 }}>
                      <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>[{index}]</span>
                      {log}
                    </div>
                  ))}
                  <div className="terminal-cursor-indicator" style={{ display: 'inline-block', width: '8px', height: '15px', backgroundColor: '#00ffcc', marginLeft: '4px' }}></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- RESULTS WORKSPACE WITH 8 TABS (Screens 11-18) --- */}
        {currentPage === 'results' && latestScanResult && (
          <div className="results-view-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield style={{ color: 'var(--color-primary)' }} />
                  <span>Scan Results: @{latestScanResult.username}</span>
                </h1>
                <p>Report session ID: {latestScanResult.id} • Evaluated on platform: {latestScanResult.platform}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="secondary-btn" onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
                <button className="primary-btn" onClick={() => window.print()}>Print / Export PDF</button>
              </div>
            </header>

            {/* Overall Header Block */}
            <div className="results-overall-card glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div className="avatar-preview-display" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                  {latestScanResult.username.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <span className={`results-badge ${getRiskClass(latestScanResult.risk_score)}`}>{latestScanResult.category}</span>
                  <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', marginTop: '6px' }}>@{latestScanResult.username}</h2>
                  <a href={latestScanResult.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <LinkIcon size={14} />
                    <span>External Profile Link</span>
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Composite Risk Index</span>
                  <div className={`risk-text-value ${getRiskClass(latestScanResult.risk_score)}`} style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
                    {latestScanResult.risk_score}%
                  </div>
                </div>
                <button 
                  className={`flag-account-btn ${latestScanResult.flagged ? 'flagged' : 'unflagged'}`} 
                  onClick={handleFlagAccount}
                  style={{ height: '48px' }}
                >
                  <AlertTriangle size={18} />
                  <span>{latestScanResult.flagged ? 'Flagged Account' : 'Flag Target'}</span>
                </button>
              </div>
            </div>

            {/* Split layout: Sub-tabs navigation and main tab panels */}
            <div className="results-tabbed-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '30px' }}>
              
              {/* Tab Navigation buttons */}
              <aside className="results-tab-navigation glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', height: 'fit-content' }}>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Report sections</div>
                <button className={`tab-btn ${activeResultTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveResultTab('overview')}>Overview</button>
                <button className={`tab-btn ${activeResultTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveResultTab('vision')}>Vision Analysis</button>
                <button className={`tab-btn ${activeResultTab === 'text' ? 'active' : ''}`} onClick={() => setActiveResultTab('text')}>NLP Text spam</button>
                <button className={`tab-btn ${activeResultTab === 'behavior' ? 'active' : ''}`} onClick={() => setActiveResultTab('behavior')}>Behavior metrics</button>
                <button className={`tab-btn ${activeResultTab === 'network' ? 'active' : ''}`} onClick={() => setActiveResultTab('network')}>Network Cluster</button>
                <button className={`tab-btn ${activeResultTab === 'bot' ? 'active' : ''}`} onClick={() => setActiveResultTab('bot')}>Bot likeliness</button>
                <button className={`tab-btn ${activeResultTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveResultTab('risk')}>Scoring engine</button>
                <button className={`tab-btn ${activeResultTab === 'explanation' ? 'active' : ''}`} onClick={() => setActiveResultTab('explanation')}>AI Explanation</button>
              </aside>

              {/* Tab Panels */}
              <div className="results-tab-panel glass-panel" style={{ padding: '30px' }}>
                
                {/* 1. Overview (Screen 11) */}
                {activeResultTab === 'overview' && (
                  <div className="tab-content-panel">
                    <h3>Risk Analysis Summary</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                      This profile has been evaluated across five separate neural layers. Based on the aggregated heuristic markers, 
                      the target profile is classified as a <strong>{latestScanResult.category}</strong>.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '24px' }}>
                      <div className="gauge-chart-container" style={{ margin: '0' }}>
                        <svg className="gauge-svg" viewBox="0 0 200 200">
                          <circle className="gauge-track" cx="100" cy="100" r="80" />
                          <circle className={`gauge-fill ${getRiskClass(latestScanResult.risk_score)}`} cx="100" cy="100" r="80" strokeDasharray={getGaugeStrokeDash(latestScanResult.risk_score)} />
                        </svg>
                        <div className="gauge-center-text">
                          <span className="score">{latestScanResult.risk_score}%</span>
                          <span className="label">Risk Index</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justify: 'center' }}>
                        <h4>Primary Reason Logs:</h4>
                        <ul style={{ listStyleType: 'square', marginLeft: '20px', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <li>Vocabulary indicates highly automated/marketing scripts.</li>
                          <li>Circadian logs highlight coordinated bot posting scheduling.</li>
                          <li>GNN linkage analysis links account into an active botnet.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Vision Analysis (Screen 12) */}
                {activeResultTab === 'vision' && (
                  <div className="tab-content-panel">
                    <h3>Vision & Face Analysis</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Deep learning examination of profile picture to identify facial GAN artifacts and deepfakes.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
                      {/* Avatar with SVG face bounding box mock overlay */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--bg-tertiary), rgba(14, 118, 253, 0.2))', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '3rem' }}>
                            👤
                          </div>
                          {/* Green camera overlay frame */}
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <rect x="25" y="25" width="110" height="110" fill="none" stroke="#34c759" strokeWidth="2" strokeDasharray="10 6" />
                            <text x="30" y="45" fill="#34c759" fontSize="9" fontWeight="bold" fontFamily="monospace">FACE SCAN DETECTED</text>
                            <text x="30" y="125" fill="#34c759" fontSize="9" fontWeight="bold" fontFamily="monospace">GAN PROB: {latestScanResult.image_score}%</text>
                          </svg>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Facial scan tracking coordinates</span>
                      </div>

                      <div>
                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Check Parameter</th>
                              <th>Result Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Authenticity Score</td>
                              <td style={{ fontWeight: '700' }}>{100 - latestScanResult.image_score}%</td>
                            </tr>
                            <tr>
                              <td>Deepfake Probability</td>
                              <td style={{ color: 'var(--color-danger)', fontWeight: '700' }}>{latestScanResult.image_score}%</td>
                            </tr>
                            <tr>
                              <td>Face Manipulation Detected</td>
                              <td style={{ fontWeight: '700' }}>{latestScanResult.image_score >= 50 ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                              <td>Structural Pixel Consistency</td>
                              <td>Warping patterns detected</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NLP Text Spam (Screen 13) */}
                {activeResultTab === 'text' && (
                  <div className="tab-content-panel">
                    <h3>Natural Language Text Audit</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Evaluating language structure, vocabulary distribution, and metadata flags.</p>
                    
                    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Analyzed Bio Description:</h4>
                      <div style={{ fontSize: '1.05rem', lineHeight: '1.6', fontFamily: 'var(--font-primary)' }}>
                        "Living life to the fullest 🌟 | <span className="nlp-highlight-word" style={{ backgroundColor: 'rgba(255, 59, 48, 0.25)', borderBottom: '2px solid var(--color-danger)', padding: '2px 4px', borderRadius: '4px' }}>Entrepreneur</span> | Dreamer | <span className="nlp-highlight-word" style={{ backgroundColor: 'rgba(255, 204, 0, 0.25)', borderBottom: '2px solid var(--color-warning)', padding: '2px 4px', borderRadius: '4px' }}>Success is my only option</span> 💯 | <span className="nlp-highlight-word" style={{ backgroundColor: 'rgba(255, 59, 48, 0.25)', borderBottom: '2px solid var(--color-danger)', padding: '2px 4px', borderRadius: '4px' }}>DM for collaborations</span> 📩"
                      </div>
                    </div>

                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Heuristic NLP Parameter</th>
                          <th>Value Indicator</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Language Style Score</td>
                          <td>79% standard marketing templates</td>
                        </tr>
                        <tr>
                          <td>Sentiment distribution</td>
                          <td>Highly promotional / positive</td>
                        </tr>
                        <tr>
                          <td>Spam Probability index</td>
                          <td style={{ fontWeight: '700', color: 'var(--color-danger)' }}>{latestScanResult.text_score}%</td>
                        </tr>
                        <tr>
                          <td>Suspicious keywords triggered</td>
                          <td>Entrepreneur, DM for collab, Success</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. Behavior Metrics (Screen 14) */}
                {activeResultTab === 'behavior' && (
                  <div className="tab-content-panel">
                    <h3>Behavior Analytics</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Analyzing posting activity intervals, activity timetables, and interactive patterns.</p>
                    
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Circadian Parameter Check</th>
                          <th>Value Check</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Posting Frequency</td>
                          <td style={{ color: 'var(--color-danger)', fontWeight: '700' }}>Very High (92%)</td>
                        </tr>
                        <tr>
                          <td>Interaction / Reply rate</td>
                          <td>Very Low (15%)</td>
                        </tr>
                        <tr>
                          <td>Consistency of activity timing</td>
                          <td>Repetitive 3-minute intervals</td>
                        </tr>
                        <tr>
                          <td>Follower-to-Following ratio</td>
                          <td>Suspicious (1.0004)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 5. Network Cluster Graph (Screen 15) */}
                {activeResultTab === 'network' && (
                  <div className="tab-content-panel">
                    <h3>GNN Node Relationship Clusters</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Visualizing target node linkage overlap inside coordinated botnets.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '30px', alignItems: 'center' }}>
                      {/* SVG Graph cluster mockup */}
                      <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#060810' }}>
                        <svg width="220" height="200" viewBox="0 0 200 200">
                          {/* Connection Lines */}
                          <line x1="100" y1="100" x2="40" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                          <line x1="100" y1="100" x2="160" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                          <line x1="100" y1="100" x2="40" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                          <line x1="100" y1="100" x2="160" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                          <line x1="40" y1="40" x2="160" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          <line x1="40" y1="160" x2="160" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          
                          {/* Connected Bot Nodes */}
                          <circle cx="40" cy="40" r="10" fill="var(--color-danger)" />
                          <circle cx="160" cy="40" r="8" fill="var(--color-danger)" opacity="0.8" />
                          <circle cx="40" cy="160" r="9" fill="var(--color-danger)" opacity="0.8" />
                          <circle cx="160" cy="160" r="7" fill="var(--color-warning)" />
                          
                          {/* Target central node */}
                          <circle cx="100" cy="100" r="18" fill="var(--color-danger)" />
                          <text x="100" y="104" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">!</text>
                          <circle cx="100" cy="100" r="28" fill="none" stroke="var(--color-danger)" strokeWidth="1" strokeDasharray="4 4">
                            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      </div>

                      <div>
                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Network Metric</th>
                              <th>Index Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Coordinated Activity index</td>
                              <td style={{ fontWeight: '700', color: 'var(--color-danger)' }}>Suspicious (85%)</td>
                            </tr>
                            <tr>
                              <td>Node Centrality overlap</td>
                              <td>High density bot groups</td>
                            </tr>
                            <tr>
                              <td>Trust Ratio multiplier</td>
                              <td>12% verified nodes link</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Bot Likeness (Screen 16) */}
                {activeResultTab === 'bot' && (
                  <div className="tab-content-panel">
                    <h3>Bot Likeness Indicators</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Aggregated models computing automation prediction index.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="progress-bar-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span>Coordinated Automation Likelihood</span>
                          <span style={{ fontWeight: '700', color: 'var(--color-danger)' }}>{latestScanResult.details?.bot?.score || latestScanResult.bot_score}%</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                          <div style={{ width: `${latestScanResult.details?.bot?.score || latestScanResult.bot_score}%`, height: '100%', backgroundColor: 'var(--color-danger)', borderRadius: '10px' }}></div>
                        </div>
                      </div>

                      <div className="progress-bar-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span>Vocabulary Content Diversity</span>
                          <span style={{ fontWeight: '700' }}>Low (22%)</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                          <div style={{ width: '22%', height: '100%', backgroundColor: 'var(--color-warning)', borderRadius: '10px' }}></div>
                        </div>
                      </div>

                      <div className="glass-panel" style={{ padding: '16px', marginTop: '10px' }}>
                        <h4>Automation Verdict:</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Prediction algorithms classify this account as highly automated. Scripted schedules match API automated tasks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Risk Scoring Engine (Screen 17) */}
                {activeResultTab === 'risk' && (
                  <div className="tab-content-panel">
                    <h3>Risk Engine Diagnostic</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Weights layout calculation summing up the composite profile threat index.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '24px', alignItems: 'center' }}>
                      <div className="gauge-chart-container" style={{ margin: '0' }}>
                        <svg className="gauge-svg" viewBox="0 0 200 200">
                          <circle className="gauge-track" cx="100" cy="100" r="80" />
                          <circle className={`gauge-fill ${getRiskClass(latestScanResult.risk_score)}`} cx="100" cy="100" r="80" strokeDasharray={getGaugeStrokeDash(latestScanResult.risk_score)} />
                        </svg>
                        <div className="gauge-center-text">
                          <span className="score">{latestScanResult.risk_score}%</span>
                          <span className="label">Composite Index</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="stat-card glass-panel" style={{ padding: '16px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence Level</span>
                          <h4 style={{ fontSize: '1.25rem', color: 'var(--color-secondary)' }}>85% verified parameters</h4>
                        </div>
                        <div className="stat-card glass-panel" style={{ padding: '16px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Triggered Alarms</span>
                          <h4 style={{ fontSize: '1.25rem', color: 'var(--color-danger)' }}>4 active threats</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. AI Explanation Reasoner (Screen 18) */}
                {activeResultTab === 'explanation' && (
                  <div className="tab-content-panel">
                    <h3>Explainable AI Verdict</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed algorithmic diagnosis logs translating vector structures into conversational logic.</p>
                    
                    <div className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield style={{ color: 'var(--color-primary)' }} />
                        <span>ImposterX Audit Checklist</span>
                      </h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '16px' }}>
                        <li><strong>Deepfake GAN Indicators:</strong> Target avatar images possess outer pixel compression shifts and pupil alignment offsets, yielding a high deepfake probability.</li>
                        <li><strong>Scripted Vocabulary:</strong> Descriptions incorporate duplicate marketing hashtags and bot-level link chains.</li>
                        <li><strong>Coordinated Circadian Cycles:</strong> Active hours operate uninterrupted at structured chronological intervals.</li>
                        <li><strong>Graph Affinity:</strong> Connections are grouped inside large automated coordination botnets.</li>
                      </ul>
                      <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Final System Action:</strong>
                        <span className={`results-badge ${getRiskClass(latestScanResult.risk_score)}`}>{latestScanResult.category}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* --- SCAN HISTORY / ALL REPORTS LIST (Screen 19 & 20) --- */}
        {currentPage === 'reports' && (
          <div className="reports-history-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Historical Scan Reports</h1>
                <p>Browse, query, and download explainable report metrics from local repository.</p>
              </div>
            </header>

            {/* Filter controls */}
            <div className="filter-controls-row glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Query scan handles..." 
                  className="input-field" 
                  style={{ padding: '10px 16px 10px 40px' }}
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
              
              <select 
                className="select-field" 
                style={{ width: '180px', padding: '10px 16px' }}
                value={historyPlatformFilter}
                onChange={(e) => setHistoryPlatformFilter(e.target.value)}
              >
                <option value="All">All Networks</option>
                <option value="Instagram">Instagram</option>
                <option value="X">X (Twitter)</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            {/* Reports List Table */}
            <div className="reports-table-card glass-panel" style={{ padding: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Target Profile</th>
                      <th>Platform</th>
                      <th>Risk score</th>
                      <th>Classification</th>
                      <th>Timestamp</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((scan, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{scan.id || `idx_${i}`}</td>
                        <td style={{ fontWeight: '600' }}>@{scan.username}</td>
                        <td>{scan.platform}</td>
                        <td style={{ fontWeight: '700' }} className={`risk-text-value ${getRiskClass(scan.risk_score)}`}>{scan.risk_score}%</td>
                        <td>
                          <span className={`results-badge ${getRiskClass(scan.risk_score)}`}>{scan.category}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(scan.timestamp).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="secondary-btn" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                              onClick={() => {
                                setLatestScanResult(scan);
                                setCurrentPage('results');
                                setActiveResultTab('overview');
                              }}
                            >
                              Open Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No reports match the active filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD (Screen 21) --- */}
        {currentPage === 'admin_dashboard' && (
          <div className="admin-dashboard-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Admin Command Center</h1>
                <p>Monitor platform statistics, user databases, and API integrations.</p>
              </div>
            </header>

            {/* Admin metrics cards */}
            <div className="stats-grid">
              <div className="stat-card glass-panel blue">
                <div className="stat-header">
                  <span>Registered Admins / Analysts</span>
                  <div className="stat-icon"><Users size={20} /></div>
                </div>
                <div className="stat-value">2,453</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+12 active today</span>
                </div>
              </div>

              <div className="stat-card glass-panel green">
                <div className="stat-header">
                  <span>Cumulative Engine Scans</span>
                  <div className="stat-icon"><Activity size={20} /></div>
                </div>
                <div className="stat-value">12,845</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+3.2% load curve</span>
                </div>
              </div>

              <div className="stat-card glass-panel purple">
                <div className="stat-header">
                  <span>Active API Integration Keys</span>
                  <div className="stat-icon"><Key size={20} /></div>
                </div>
                <div className="stat-value">3,256</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} />
                  <span>+45 keys validated</span>
                </div>
              </div>

              <div className="stat-card glass-panel red">
                <div className="stat-header">
                  <span>Triggered Security Alerts</span>
                  <div className="stat-icon"><AlertTriangle size={20} /></div>
                </div>
                <div className="stat-value">2,145</div>
                <div className="stat-trend down">
                  <AlertTriangle size={14} />
                  <span>+8 unresolved issues</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
              {/* Traffic chart */}
              <div className="chart-card glass-panel" style={{ padding: '24px' }}>
                <h3>Console API Traffic</h3>
                <div style={{ height: '220px', marginTop: '16px' }}>
                  <svg className="full-chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <line x1="30" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                    <path d="M30,120 Q90,90 150,130 T270,70 T390,110 L480,40" fill="none" stroke="var(--color-secondary)" strokeWidth="3" />
                  </svg>
                </div>
              </div>

              {/* platform distribution */}
              <div className="chart-card glass-panel" style={{ padding: '24px' }}>
                <h3>Traffic Channels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>Instagram Crawler API</span>
                      <span>42%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>X Crawler API</span>
                      <span>35%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--color-secondary)', borderRadius: '4px' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar-row">
                    <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>Webhook Triggers</span>
                      <span>23%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <div style={{ width: '23%', height: '100%', backgroundColor: '#a855f7', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USER MANAGEMENT ADMIN SCREEN (Screen 22) --- */}
        {currentPage === 'user_management' && (
          <div className="user-management-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Console User Directories</h1>
                <p>Audit and manage authorized administrators and security analyst keys.</p>
              </div>
              <button className="scan-cta-btn" onClick={() => setShowAddUserModal(true)}>
                <span>Add Analyst User</span>
              </button>
            </header>

            {/* Users lists table */}
            <div className="users-table-card glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account ID</th>
                      <th>Full Name</th>
                      <th>Security Email</th>
                      <th>Assigned Role</th>
                      <th>Account Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace' }}>{u.id}</td>
                        <td style={{ fontWeight: '600' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <span style={{ 
                            padding: '2px 8px', 
                            fontSize: '0.75rem', 
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            backgroundColor: u.status === 'Active' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)',
                            color: u.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)'
                          }}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="secondary-btn" 
                            style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
                            onClick={() => {
                              setAdminUsers(adminUsers.map(x => x.id === u.id ? { ...x, status: x.status === 'Active' ? 'Suspended' : 'Active' } : x));
                            }}
                          >
                            Toggle Active
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="modal-backdrop-blur" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-card-body glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Register Console Analyst</h3>
                    <button className="remove-file-btn" onClick={() => setShowAddUserModal(false)}><CloseIcon size={18} /></button>
                  </div>
                  
                  <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                      <label>Analyst Full Name</label>
                      <input type="text" className="input-field" placeholder="Full name" style={{ padding: '10px 14px' }} value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                    </div>
                    
                    <div className="input-group">
                      <label>Security Email Address</label>
                      <input type="email" className="input-field" placeholder="email@imposterx.com" style={{ padding: '10px 14px' }} value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                    </div>

                    <div className="input-group">
                      <label>Dashboard Console Role</label>
                      <select className="select-field" style={{ padding: '10px 14px' }} value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                        <option value="Security Analyst">Security Analyst</option>
                        <option value="System Admin">System Admin</option>
                      </select>
                    </div>

                    <button type="submit" className="submit-btn" style={{ padding: '12px', marginTop: '10px' }}>Register User Accounts</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SYSTEM TELEMETRY ANALYTICS (Screen 23) --- */}
        {currentPage === 'system_analytics' && (
          <div className="system-analytics-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Platform Telemetry Analytics</h1>
                <p>Live memory logs, processor load curves, and API request latency indices.</p>
              </div>
            </header>

            {/* Telemetry metrics */}
            <div className="stats-grid">
              <div className="stat-card glass-panel blue">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span>Memory Usage</span>
                  <Database size={16} />
                </div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>58.2%</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4.2 GB of 8.0 GB index cache</span>
              </div>

              <div className="stat-card glass-panel green">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span>CPU Usage</span>
                  <Cpu size={16} />
                </div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>42.5%</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Load curve balanced</span>
              </div>

              <div className="stat-card glass-panel warning">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span>Average Response Time</span>
                  <Clock size={16} />
                </div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>85.4 ms</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>99th percentile verified</span>
              </div>
            </div>

            {/* Performance line graph */}
            <div className="chart-card-full glass-panel" style={{ padding: '24px', marginTop: '30px' }}>
              <h3>Pipeline Processor Load Trend</h3>
              <div style={{ height: '220px', marginTop: '16px' }}>
                <svg className="full-chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <path d="M0,150 Q100,80 200,120 T400,60 L600,80" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
                  <path d="M0,170 Q100,120 200,150 T400,90 L600,120" fill="none" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Load Testing Tool Command Center */}
            <div className="chart-card-full glass-panel" style={{ padding: '28px', marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} style={{ color: 'var(--color-primary)' }} />
                    Baseline / Load Testing Command Center
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Simulate concurrent virtual user workloads to measure API throughput (RPS) and latency distribution.
                  </p>
                </div>
                {loadTestState === 'running' && (
                  <span className="badge-alert animate-pulse" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Test In Progress
                  </span>
                )}
              </div>

              {/* Configurations Control Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Virtual Users (VUs):</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{loadTestConcurrency} VUs</strong>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="150" 
                    step="10"
                    value={loadTestConcurrency} 
                    onChange={(e) => setLoadTestConcurrency(parseInt(e.target.value))}
                    disabled={loadTestState === 'running'}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical Baseline = 100 VUs</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Test Duration:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{loadTestDuration} seconds</strong>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="120" 
                    step="5"
                    value={loadTestDuration} 
                    onChange={(e) => setLoadTestDuration(parseInt(e.target.value))}
                    disabled={loadTestState === 'running'}
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical Baseline = 60s (1 min)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Endpoint:</label>
                  <select 
                    value={loadTestEndpoint}
                    onChange={(e) => setLoadTestEndpoint(e.target.value)}
                    disabled={loadTestState === 'running'}
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      padding: '8px 12px', 
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="/api/system/load-test/target">/api/system/load-test/target (DB Read simulation)</option>
                    <option value="/api">/api (Lightweight root info check)</option>
                  </select>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target route for simulated traffic</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {loadTestState !== 'running' ? (
                  <button 
                    className="primary-btn" 
                    onClick={startLoadTest}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                  >
                    <Play size={16} />
                    Run Baseline Load Test
                  </button>
                ) : (
                  <button 
                    className="logout-btn" 
                    onClick={stopLoadTest}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                  >
                    <Power size={16} />
                    Abort Load Test
                  </button>
                )}
              </div>

              {/* Live Running/Report Console */}
              {loadTestState !== 'idle' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Progress Bar */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Test Execution Progress:</span>
                      <strong>{loadTestStats.elapsed_time}s / {loadTestStats.duration}s ({Math.min(100, Math.round((loadTestStats.elapsed_time / loadTestStats.duration) * 100))}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (loadTestStats.elapsed_time / loadTestStats.duration) * 100)}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  {/* Real-time stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="stat-card glass-panel blue" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Throughput (RPS)</span>
                      <h3 style={{ fontSize: '1.75rem', marginTop: '8px', color: 'var(--color-primary)' }}>{loadTestStats.rps} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>req/sec</span></h3>
                    </div>

                    <div className="stat-card glass-panel warning" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average Latency</span>
                      <h3 style={{ fontSize: '1.75rem', marginTop: '8px', color: '#f59e0b' }}>{loadTestStats.latency?.avg} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ms</span></h3>
                    </div>

                    <div className="stat-card glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latency Span (Min / Max)</span>
                      <h3 style={{ fontSize: '1.35rem', marginTop: '12px' }}>{loadTestStats.latency?.min}ms / {loadTestStats.latency?.max}ms</h3>
                    </div>

                    <div className="stat-card glass-panel green" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Request Health</span>
                      <h3 style={{ fontSize: '1.5rem', marginTop: '10px' }}>
                        <span style={{ color: 'var(--color-success)' }}>{loadTestStats.successful_requests}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / </span>
                        <span>{loadTestStats.total_requests}</span>
                      </h3>
                      {loadTestStats.failed_requests > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                          ⚠️ {loadTestStats.failed_requests} requests failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scrolling Live Terminal Console */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live Telemetry Execution Log:</span>
                    <div 
                      ref={loadTestTerminalRef}
                      style={{ 
                        backgroundColor: '#05070f', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '16px', 
                        height: '180px', 
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        color: '#10b981',
                        lineHeight: '1.5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      {loadTestLogs.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)' }}>Waiting for terminal logs stream...</div>
                      ) : (
                        loadTestLogs.map((log, index) => (
                          <div key={index} style={{ wordBreak: 'break-all' }}>{log}</div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Post-Test Report Verdict Card */}
                  {loadTestState === 'completed' && (
                    <div 
                      className="animate-fade-in"
                      style={{ 
                        backgroundColor: loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        border: `1px solid ${loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                        borderRadius: '8px',
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginTop: '10px'
                      }}
                    >
                      <div style={{ 
                        color: loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? '#ef4444' : 'var(--color-success)',
                        fontSize: '1.75rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? <AlertTriangle /> : <CheckCircle />}
                      </div>
                      <div>
                        <h4 style={{ 
                          fontSize: '1.05rem', 
                          fontWeight: '600', 
                          color: loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? '#f87171' : '#34d399',
                          marginBottom: '4px'
                        }}>
                          {loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? 'System Warning - Performance Limits Reached' : 'Performance Verdict: PASS'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {loadTestStats.failed_requests > 0 || loadTestStats.latency?.avg >= 200 ? (
                            `The system processed ${loadTestStats.total_requests} requests, but registered ${loadTestStats.failed_requests} failures with an average latency of ${loadTestStats.latency?.avg}ms. This indicates capacity degradation under ${loadTestStats.concurrency} concurrent virtual users.`
                          ) : (
                            `Under a normal, expected amount of ${loadTestStats.concurrency} concurrent virtual users running continuously for ${loadTestStats.duration} seconds, the system processed ${loadTestStats.total_requests} requests successfully with zero failures. Response times stayed fast (Average: ${loadTestStats.latency?.avg}ms, Min: ${loadTestStats.latency?.min}ms, Max: ${loadTestStats.latency?.max}ms).`
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}

        {/* --- SYSTEM SETTINGS TABBED CARD (Screen 30 & Screen 24) --- */}
        {currentPage === 'settings' && (
          <div className="settings-container animate-fade-in">
            <header className="header-bar">
              <div className="page-title-group">
                <h1>Platform Configurations</h1>
                <p>Modify threshold multipliers, crawler frequencies, and active developer integration keys.</p>
              </div>
            </header>

            <div className="settings-tabbed-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '30px', marginTop: '24px' }}>
              
              {/* Settings navigation */}
              <aside className="settings-sub-navigation glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', height: 'fit-content' }}>
                <button className={`tab-btn ${activeSettingsTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('general')}>General</button>
                <button className={`tab-btn ${activeSettingsTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('profile')}>Admin Profile</button>
                <button className={`tab-btn ${activeSettingsTab === 'api' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('api')}>API Settings</button>
              </aside>

              {/* Settings panels */}
              <div className="settings-panel-body glass-panel" style={{ padding: '30px' }}>
                
                {/* General Settings */}
                {activeSettingsTab === 'general' && (
                  <div className="tab-content-panel">
                    <h3>General Console Settings</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                      <div className="input-group">
                        <label>Console Active Theme</label>
                        <select className="select-field">
                          <option>Midnight Neon Blue (Default)</option>
                          <option>Matrix Forest Green</option>
                          <option>Light Glassmorphism</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>System Localization / Language</label>
                        <select className="select-field">
                          <option>English (United States)</option>
                          <option>Spanish (ES)</option>
                          <option>German (DE)</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Time Zone Routing</label>
                        <select className="select-field">
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>EST (Eastern Standard Time)</option>
                          <option>IST (Indian Standard Time)</option>
                        </select>
                      </div>

                      <button className="primary-btn" style={{ width: 'fit-content', marginTop: '10px' }} onClick={() => alert("Settings saved successfully!")}>
                        Save Configurations
                      </button>
                    </div>
                  </div>
                )}

                {/* Profile settings */}
                {activeSettingsTab === 'profile' && (
                  <div className="tab-content-panel">
                    <h3>Analyst Profile Credentials</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                      <div className="input-group">
                        <label>Account Holder Name</label>
                        <input type="text" className="input-field" placeholder="Full name" defaultValue={user?.full_name || 'Guest User'} style={{ padding: '10px 14px' }} />
                      </div>

                      <div className="input-group">
                        <label>Assigned Console Email</label>
                        <input type="email" className="input-field" placeholder="email@imposterx.com" defaultValue={user?.email || 'guest@imposterx.com'} style={{ padding: '10px 14px' }} />
                      </div>

                      <button className="primary-btn" style={{ width: 'fit-content', marginTop: '10px' }} onClick={() => alert("Profile updated successfully!")}>
                        Update Profile Info
                      </button>
                    </div>
                  </div>
                )}

                {/* API Settings (Screen 24) */}
                {activeSettingsTab === 'api' && (
                  <div className="tab-content-panel">
                    <h3>Developer API Key Integration</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Integrate crawler models directly into staging applications or enterprise tools.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                      
                      <div className="input-group">
                        <label>Active Developer Integration API Key</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem', padding: '10px 14px', flexGrow: 1 }} 
                            value={apiKey} 
                            readOnly 
                          />
                          <button className="secondary-btn" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={copyApiKey}>
                            <Copy size={16} />
                            <span>{apiKeyCopied ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button className="secondary-btn" style={{ padding: '10px 14px' }} onClick={regenerateApiKey}>
                            Regenerate
                          </button>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Staging Webhook Notification URI</label>
                        <input 
                          type="url" 
                          className="input-field" 
                          style={{ padding: '10px 14px' }} 
                          value={webhookUrl} 
                          onChange={(e) => setWebhookUrl(e.target.value)} 
                        />
                      </div>

                      <button className="primary-btn" style={{ width: 'fit-content', marginTop: '10px' }} onClick={() => alert("API & Webhooks configurations saved successfully!")}>
                        Save API Settings
                      </button>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* --- LOGGED OUT SPLASH SCREEN (Screen 31) --- */}
        {currentPage === 'logged_out' && (
          <div className="splash-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="splash-logo-glow" style={{ background: 'linear-gradient(135deg, rgba(255,59,48,0.2), rgba(255,59,48,0.4))', boxShadow: '0 0 30px rgba(255,59,48,0.2)' }}>
              <Power size={44} style={{ color: 'var(--color-danger)' }} />
            </div>
            <h1 className="splash-title" style={{ background: 'linear-gradient(to right, #ffffff, var(--color-danger))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Logged Out!</h1>
            <p className="splash-subtitle">You have successfully terminated this console session. Security handshake revoked.</p>
            
            <button className="primary-btn" style={{ background: 'linear-gradient(135deg, var(--color-primary), #0056b3)' }} onClick={finalizeLogout}>
              Back to Login Page
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
