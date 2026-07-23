import os
import json
from datetime import datetime

class HtmlReporter:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_reports(self, test_results: list, device_info: dict, duration: float):
        total = len(test_results)
        passed = len([t for t in test_results if t["status"] == "Passed"])
        failed = len([t for t in test_results if t["status"] == "Failed"])
        skipped = len([t for t in test_results if t["status"] == "Skipped"])
        pass_rate = (passed / total * 100) if total > 0 else 0

        # Create output directories for assets
        os.makedirs(os.path.join(self.output_dir, "Screenshots"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "Logs"), exist_ok=True)

        # 1. Generate execution-report.html
        self.generate_execution_report(test_results, device_info, duration, total, passed, failed, skipped, pass_rate)

        # 2. Generate dashboard.html
        self.generate_dashboard(test_results, device_info, duration, total, passed, failed, skipped, pass_rate)

        # 3. Generate trends.html
        self.generate_trends(test_results, device_info, duration, total, passed, failed, skipped, pass_rate)

        # 4. Generate JSON results
        self.generate_json_results(test_results, device_info, duration)

    def generate_execution_report(self, results, device_info, duration, total, passed, failed, skipped, pass_rate):
        file_path = os.path.join(self.output_dir, "execution-report.html")
        
        # Build list of rows
        rows_html = ""
        for tc in results:
            status_class = tc["status"].lower()
            badge_class = f"badge-{status_class}"
            
            failure_detail_html = ""
            if tc["status"] == "Failed":
                failure_detail_html = f"""
                <tr class="failure-detail-row" id="detail-{tc['id']}" style="display: none;">
                    <td colspan="6">
                        <div class="failure-box">
                            <strong>Failure Cause:</strong> {tc.get('failure_reason', 'Assertion Failed')}<br>
                            <strong>Stack Trace:</strong>
                            <pre>{tc.get('stack_trace', 'No traceback logged.')}</pre>
                            <strong>Artifact Screenshot:</strong><br>
                            <img src="Screenshots/{tc['id']}.png" onerror="this.src='https://placehold.co/400x200?text=No+Screenshot'" class="fail-screenshot">
                        </div>
                    </td>
                </tr>
                """
            
            rows_html += f"""
            <tr class="test-row status-{status_class}" onclick="toggleFailureDetail('{tc['id']}')">
                <td style="font-family: monospace; font-weight: bold;">{tc['id']}</td>
                <td>{tc['module']}</td>
                <td>{tc['name']}</td>
                <td><span class="badge badge-priority">{tc['priority']}</span></td>
                <td><span class="badge {badge_class}">{tc['status']}</span></td>
                <td align="center">{tc.get('execution_time', 0.05):.3f}s</td>
            </tr>
            {failure_detail_html}
            """

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ImposterX Android E2E Execution Report</title>
    <style>
        :root {{
            --bg-primary: #0a0e17;
            --bg-secondary: #121824;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --color-primary: #3b82f6;
            --color-success: #10b981;
            --color-danger: #ef4444;
            --color-warning: #f59e0b;
            --border-color: rgba(255, 255, 255, 0.08);
        }}
        body {{
            background-color: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 24px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        h1 {{ margin: 0; font-size: 1.8rem; color: var(--color-primary); }}
        .meta-text {{ color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }}
        
        /* Stats Grid */
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}
        .stat-card {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }}
        .stat-card h3 {{ margin: 0; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; }}
        .stat-card p {{ margin: 8px 0 0 0; font-size: 1.8rem; font-weight: bold; }}
        .stat-card.pass p {{ color: var(--color-success); }}
        .stat-card.fail p {{ color: var(--color-danger); }}
        .stat-card.skip p {{ color: var(--color-warning); }}
        
        /* Device Metadata */
        .device-info {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            font-size: 0.85rem;
        }}
        .device-info-item strong {{ color: var(--text-secondary); }}

        /* Filter Controls */
        .controls {{
            display: flex;
            gap: 12px;
            margin-bottom: 18px;
            align-items: center;
        }}
        select, input {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            border-radius: 6px;
            padding: 8px 12px;
            outline: none;
        }}
        
        /* Results Table */
        table {{
            width: 100%;
            border-collapse: collapse;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            font-size: 0.9rem;
        }}
        th, td {{
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }}
        th {{
            background-color: rgba(255,255,255,0.02);
            color: var(--text-secondary);
            font-weight: 600;
        }}
        .test-row {{ cursor: pointer; transition: background-color 0.2s; }}
        .test-row:hover {{ background-color: rgba(255,255,255,0.03); }}
        
        /* Badges */
        .badge {{
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .badge-passed {{ background-color: rgba(16, 185, 129, 0.15); color: var(--color-success); }}
        .badge-failed {{ background-color: rgba(239, 68, 68, 0.15); color: var(--color-danger); }}
        .badge-skipped {{ background-color: rgba(245, 158, 11, 0.15); color: var(--color-warning); }}
        .badge-priority {{ background-color: rgba(255,255,255,0.08); color: var(--text-primary); }}
        
        /* Failure Box */
        .failure-box {{
            background-color: rgba(239, 68, 68, 0.04);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 6px;
            padding: 16px;
            margin: 8px;
            font-size: 0.85rem;
        }}
        pre {{
            background-color: #07090e;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            color: #f87171;
            font-family: monospace;
        }}
        .fail-screenshot {{
            max-width: 320px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            margin-top: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }}
    </style>
    <script>
        function toggleFailureDetail(id) {{
            var el = document.getElementById("detail-" + id);
            if (el) {{
                el.style.display = el.style.display === "none" ? "table-row" : "none";
            }}
        }}

        function filterResults() {{
            var statusFilter = document.getElementById("status-filter").value;
            var searchFilter = document.getElementById("search-input").value.toLowerCase();
            
            var rows = document.getElementsByClassName("test-row");
            for (var i = 0; i < rows.length; i++) {{
                var row = rows[i];
                var id = row.cells[0].innerText.toLowerCase();
                var module = row.cells[1].innerText.toLowerCase();
                var name = row.cells[2].innerText.toLowerCase();
                
                var matchesStatus = (statusFilter === "all") || row.classList.contains("status-" + statusFilter);
                var matchesSearch = id.includes(searchFilter) || module.includes(searchFilter) || name.includes(searchFilter);
                
                if (matchesStatus && matchesSearch) {{
                    row.style.display = "";
                }} else {{
                    row.style.display = "none";
                    // Close details row if open
                    var detailId = "detail-" + row.cells[0].innerText;
                    var detailEl = document.getElementById(detailId);
                    if (detailEl) detailEl.style.display = "none";
                }}
            }}
        }}
    </script>
</head>
<body>
    <div class="header">
        <div>
            <h1>ImposterX Mobile Test Suite</h1>
            <div class="meta-text">E2E Android Automation Framework Execution Dashboard</div>
        </div>
        <div style="text-align: right;">
            <div class="meta-text">Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</div>
            <div class="meta-text">Test Engine: Appium + Pytest</div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <h3>Total Tests</h3>
            <p>{total}</p>
        </div>
        <div class="stat-card pass">
            <h3>Passed</h3>
            <p>{passed}</p>
        </div>
        <div class="stat-card fail">
            <h3>Failed</h3>
            <p>{failed}</p>
        </div>
        <div class="stat-card skip">
            <h3>Skipped</h3>
            <p>{skipped}</p>
        </div>
        <div class="stat-card" style="border-color: rgba(59, 130, 246, 0.3);">
            <h3>Pass Rate</h3>
            <p style="color: var(--color-primary);">{pass_rate:.1f}%</p>
        </div>
        <div class="stat-card">
            <h3>Duration</h3>
            <p>{duration:.1f}s</p>
        </div>
    </div>

    <!-- Device Details -->
    <div class="device-info">
        <div class="device-info-item"><strong>Device:</strong> {device_info.get("device_name", "Android Emulator")}</div>
        <div class="device-info-item"><strong>Android Version:</strong> {device_info.get("platform_version", "13.0")}</div>
        <div class="device-info-item"><strong>Package:</strong> {device_info.get("app_package", "com.example.aiguard")}</div>
        <div class="device-info-item"><strong>Uvicorn API Port:</strong> 8000</div>
    </div>

    <!-- Controls -->
    <div class="controls">
        <select id="status-filter" onchange="filterResults()">
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
        </select>
        <input type="text" id="search-input" placeholder="Search ID, Module, Name..." onkeyup="filterResults()" style="width: 280px;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: auto;">Click on failed rows to expand stack traces and screenshot details.</span>
    </div>

    <!-- Results Table -->
    <table>
        <thead>
            <tr>
                <th width="10%">Test ID</th>
                <th width="15%">Module</th>
                <th width="45%">Test Name</th>
                <th width="10%">Priority</th>
                <th width="10%">Status</th>
                <th width="10%" style="text-align: center;">Duration</th>
            </tr>
        </thead>
        <tbody>
            {rows_html}
        </tbody>
    </table>
</body>
</html>
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    def generate_dashboard(self, results, device_info, duration, total, passed, failed, skipped, pass_rate):
        file_path = os.path.join(self.output_dir, "dashboard.html")
        
        # Simple inline iframe or redirect to main execution report for simplified navigation
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=execution-report.html">
    <title>Redirecting to Dashboard</title>
</head>
<body>
    Redirecting to <a href="execution-report.html">execution-report.html</a>.
</body>
</html>
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    def generate_trends(self, results, device_info, duration, total, passed, failed, skipped, pass_rate):
        file_path = os.path.join(self.output_dir, "trends.html")
        
        # Simple visualization page for trend logging
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>ImposterX Automation Trends</title>
    <style>
        body {{
            background-color: #0a0e17;
            color: #f1f5f9;
            font-family: sans-serif;
            padding: 40px;
            text-align: center;
        }}
        .card {{
            background-color: #121824;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
        }}
        h1 {{ color: #3b82f6; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>Historical Trends</h1>
        <p>This panel displays pipeline performance over successive builds.</p>
        <div style="margin: 30px 0; border: 1px dashed rgba(255,255,255,0.15); padding: 40px; border-radius: 6px;">
            <h3>Build Pass Rate History</h3>
            <p style="font-size: 3rem; color: #10b981; font-weight: bold; margin: 10px 0;">{pass_rate:.1f}%</p>
            <span>Current Build: #{os.getenv('GITHUB_RUN_NUMBER', 'Local_Dev')}</span>
        </div>
        <a href="execution-report.html" style="color: #3b82f6; text-decoration: none;">&larr; Return to Execution Dashboard</a>
    </div>
</body>
</html>
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

    def generate_json_results(self, test_results: list, device_info: dict, duration: float):
        file_path = os.path.join(self.output_dir, "execution-results.json")
        data = {
            "summary": {
                "total": len(test_results),
                "passed": len([t for t in test_results if t["status"] == "Passed"]),
                "failed": len([t for t in test_results if t["status"] == "Failed"]),
                "skipped": len([t for t in test_results if t["status"] == "Skipped"]),
                "pass_rate": round(len([t for t in test_results if t["status"] == "Passed"]) / len(test_results) * 100, 2) if test_results else 0,
                "duration_seconds": duration,
                "timestamp": datetime.now().isoformat()
            },
            "device": device_info,
            "results": test_results
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
