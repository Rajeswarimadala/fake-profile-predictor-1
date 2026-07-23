import os
import json
from datetime import datetime

class WebHtmlReporter:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_reports(self, test_results: list, base_url: str, duration: float):
        total = len(test_results)
        passed = len([t for t in test_results if t["status"] == "Passed"])
        failed = len([t for t in test_results if t["status"] == "Failed"])
        skipped = len([t for t in test_results if t["status"] == "Skipped"])
        pass_rate = (passed / total * 100) if total > 0 else 0

        # 1. execution-report.html
        self.generate_execution_report(test_results, base_url, duration, total, passed, failed, skipped, pass_rate)
        
        # 2. dashboard.html
        self.generate_dashboard(test_results, base_url, duration, total, passed, failed, skipped, pass_rate)

    def generate_execution_report(self, results, base_url, duration, total, passed, failed, skipped, pass_rate):
        file_path = os.path.join(self.output_dir, "execution-report.html")
        
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
                            <strong>Failure Reason:</strong> {tc.get('failure_reason', 'Assertion Error')}<br>
                            <strong>Stack Trace:</strong>
                            <pre>{tc.get('stack_trace', 'No traceback logged.')}</pre>
                            <strong>Browser Console Logs:</strong>
                            <pre>{chr(10).join(tc.get('browser_logs', ['[INFO] Console clean.']))}</pre>
                            <strong>Viewport Screenshot:</strong><br>
                            <img src="../Screenshots/{tc['id']}.png" onerror="this.src='https://placehold.co/400x200?text=No+Screenshot'" class="fail-screenshot">
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
    <title>ImposterX Live GitHub Pages Selenium E2E Report</title>
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
        }}
    </style>
    <script>
        function toggleFailureDetail(id) {{
            var el = document.getElementById("detail-" + id);
            if (el) el.style.display = el.style.display === "none" ? "table-row" : "none";
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
                }}
            }}
        }}
    </script>
</head>
<body>
    <div class="header">
        <div>
            <h1>Live GitHub Pages E2E Execution Report</h1>
            <div class="meta-text">Target Deployment URL: <a href="{base_url}" target="_blank" style="color: var(--color-primary);">{base_url}</a></div>
        </div>
        <div style="text-align: right;">
            <div class="meta-text">Execution Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</div>
            <div class="meta-text">Engine: Selenium WebDriver (Headless Chrome)</div>
        </div>
    </div>

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
        <div class="stat-card" style="border-color: rgba(59, 130, 246, 0.3);">
            <h3>Pass Percentage</h3>
            <p style="color: var(--color-primary);">{pass_rate:.1f}%</p>
        </div>
        <div class="stat-card">
            <h3>Duration</h3>
            <p>{duration:.1f}s</p>
        </div>
    </div>

    <div class="controls">
        <select id="status-filter" onchange="filterResults()">
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
        </select>
        <input type="text" id="search-input" placeholder="Search test cases..." onkeyup="filterResults()" style="width: 280px;">
    </div>

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

    def generate_dashboard(self, results, base_url, duration, total, passed, failed, skipped, pass_rate):
        file_path = os.path.join(self.output_dir, "dashboard.html")
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=execution-report.html">
    <title>Redirecting to Report Dashboard</title>
</head>
<body>
    Redirecting to <a href="execution-report.html">execution-report.html</a>.
</body>
</html>
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
