# Live GitHub Pages Selenium E2E Automation Framework

This module contains an enterprise-grade Selenium WebDriver automation framework and CI/CD workflow designed to build the React application, deploy it to GitHub Pages, and run 470+ automated Web E2E test cases against the **LIVE deployed GitHub Pages URL**.

---

## Directory Structure & Deliverables

```
web_automation/
├── pages/                  # Page Object Model DOM classes
│   ├── base_page.py        # Webdriver interaction wrappers, explicit waits & console log catchers
│   ├── splash_page.py      # Hero landing screen mappings
│   ├── auth_page.py        # Login & registration forms
│   └── dashboard_page.py   # Main dashboard screens
├── tests/                  # Pytest test suites
│   ├── conftest.py         # Selenium Headless Chrome fixture with BASE_URL resolution
│   └── test_web_e2e.py     # Parameterized test cases executing against live BASE_URL
├── data/                   # Metadata generators
│   ├── generate_web_cases.py # Script generating 470 test scenarios
│   └── web_test_cases.json   # 470 web test scenarios database
├── config/                 # Environment options
│   └── config.json         # Base URL, browser parameters, timeouts
├── utils/                  # Report generators & utilities
│   ├── excel_reporter.py   # Openpyxl multi-tab Excel generator
│   ├── html_reporter.py    # Responsive HTML dashboard compiler
│   ├── screenshot_util.py  # Viewport screenshot generator on error
│   └── logger_util.py      # Console and file logger
├── requirements.txt        # Python manifest (selenium, pytest, openpyxl, jinja2)
└── run_web_tests.py        # Master test orchestrator & report compiler

Test Results/               # Output Directory (Deliverables)
├── Excel/                  # XLSX sheets (Automation_Test_Report.xlsx, Failed_Test_Cases.xlsx, Passed_Test_Cases.xlsx, Summary_Report.xlsx)
├── HTML/                   # execution-report.html & dashboard.html
├── JSON/                   # execution-results.json
├── Screenshots/            # Viewport screenshot images for failed cases
├── Logs/                   # Browser console logs and stack traces
└── Summary/                # summary.md execution summary
```

---

## Local Execution Guide

### Step 1: Install Python Requirements
```bash
cd web_automation
python -m pip install -r requirements.txt
```

### Step 2: Set Target Base URL Environment Variable
Always specify the target `BASE_URL` (defaults to local fallback or live GitHub Pages URL):
```powershell
$env:BASE_URL="https://<username>.github.io/<repository>/"
$env:OPENBLAS_NUM_THREADS="1"
python run_web_tests.py
```

---

## Repository & GitHub Pages Setup Guide

To enable automated deployment to GitHub Pages:
1. Go to your GitHub repository -> **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
3. Under **Branch**, choose `gh-pages` and `/ (root)`, then click **Save**.
4. Go to **Settings** -> **Actions** -> **General** -> **Workflow permissions**, select **Read and write permissions**, and click **Save**.
5. Push changes to `main` or `master`. The workflow defined in [.github/workflows/deploy-and-test.yml](file:///C:/Users/rm662/Downloads/fake-profile-predictor-1/fake-profile-predictor-1/.github/workflows/deploy-and-test.yml) will automatically build the app, push build artifacts to `gh-pages`, verify HTTP 200 availability at your Pages URL, run the Selenium E2E suite, and upload all report artifacts.
