# ImposterX Android E2E Automation Framework & CI/CD Guide

This folder contains the enterprise-grade mobile test automation framework for the ImposterX Android application. It utilizes Appium, Pytest, and Page Object Model (POM) patterns to execute 400+ distinct verification scenarios.

---

## Folder Structure

```
automation/
├── pages/                  # Page Object Model (POM) screen classes
│   ├── base_page.py        # Locator finders and action wrappers
│   ├── login_page.py       # Login screen mappings
│   ├── register_page.py    # Registration screen mappings
│   └── dashboard_page.py   # Main Dashboard action screen mappings
├── tests/                  # Test suites
│   ├── conftest.py         # Pytest fixtures and driver setups
│   └── test_e2e.py         # Parameterized test cases
├── data/                   # Test case databases
│   ├── generate_test_cases.py # Compiles case metadata
│   └── test_cases.json     # 510 E2E executable test scenarios
├── config/                 # Execution configurations
│   └── config.json         # Server URLs, device settings, execution mode
├── utils/                  # Reporting and file modules
│   ├── excel_reporter.py   # Compiles openpyxl Excel spreadsheets
│   ├── html_reporter.py    # Generates responsive HTML dashboards
│   ├── screenshot_util.py  # Captures screenshots on error
│   └── logger_util.py      # Standard logging formatter
├── reports/                # Test Execution Reports (Generated post-run)
│   ├── Excel/              # XLSX reports (Metrics, Defect Summary, Passed/Failed listings)
│   ├── HTML/               # Interactive dashboard and trend HTML files
│   ├── JSON/               # Raw JSON execution outcomes database
│   ├── Screenshots/        # Screenshots for failed test steps
│   ├── Logs/               # Raw log listings for failed cases and main logs
│   └── Summary/            # summary.md execution summary
├── requirements.txt        # Automation packages manifest
└── run_tests.py            # Master automation test suite runner
```

---

## Local Execution Guide

### Prerequisites
1. **Python 3.10+** installed.
2. **Node.js 18+** installed (for Appium Server).
3. **Android Studio & SDK** with an active Emulator (e.g., Pixel 6 API 33).
4. **Flutter SDK** installed (if building the APK from source).

### Step 1: Install Dependencies
Navigate to the `automation` folder and install Python requirements:
```bash
python -m pip install -r requirements.txt
```

Install the Appium Server and the Android UIAutomator2 driver globally:
```bash
npm install -g appium
appium driver install uiautomator2
```

### Step 2: Configure Framework
Modify [config.json](file:///C:/Users/rm662/Downloads/fake-profile-predictor-1/fake-profile-predictor-1/automation/config/config.json) to set your test configurations:
- `"execution_mode"`: `"live"` to execute on a real running emulator/device. Set to `"simulated"` to run in high-speed mock driver mode (ideal for CI pipelines).
- `"apk_path"`: Path to your target ImposterX debug APK.
- `"appium_server_url"`: The port Appium is listening on (default `http://127.0.0.1:4723`).

### Step 3: Run the Automation Suite
Ensure your Android Emulator is running and Appium Server is started (`appium` in terminal). Then run:
```bash
python run_tests.py
```
This launches the runner, executes all 510 test cases, captures screenshots on failures, and outputs reports to the `reports/` folder.

---

## CI/CD Execution Guide

The CI/CD pipeline runs automatically on every `push` and `pull_request` to `main`/`master` branches, as well as on manual dispatch (`workflow_dispatch`).

The pipeline is defined in [.github/workflows/android-e2e.yml](file:///C:/Users/rm662/Downloads/fake-profile-predictor-1/fake-profile-predictor-1/.github/workflows/android-e2e.yml) and performs the following stages:
1. **Checkout**: Checks out the source code.
2. **Java/Android/Flutter Setup**: Prepares SDK environments and compiles the Android APK.
3. **Appium & Emulator Initialization**: Starts the Appium server, boots a headless macOS/x86_64 emulator, installs the built APK, and checks system readiness.
4. **Execution**: Spawns the test runner in live Appium mode.
5. **Artifact Storage**: Uploads all Excel, HTML, log files, and failure screenshots. Retention is configured for 30 days.
6. **Pages Deployment**: Publishes HTML reports to GitHub Pages:
   - Latest reports are published to: `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
   - Archive reports are stored in: `reports/history/build-<run_number>/`

---

## Troubleshooting Guide

### 1. OpenBLAS Memory Allocation Errors
On certain Windows systems, running python scripts that load scientific packages (like numpy/pandas) might result in `OpenBLAS error: Memory allocation still failed after 10 retries`.
* **Solution**: Set the environment variable `OPENBLAS_NUM_THREADS` to `1` before running:
  ```powershell
  $env:OPENBLAS_NUM_THREADS="1"
  python run_tests.py
  ```

### 2. Appium Server Unreachable
If the test run fails with connection errors to `http://127.0.0.1:4723`:
* Ensure the Appium server is actively running by typing `appium` in a separate terminal.
* Check if Appium is listening on a different host/port (e.g. `localhost` vs `127.0.0.1`) and update the `appium_server_url` value inside `config/config.json`.

### 3. Emulator Boot Timeouts in GitHub Actions
If the emulator takes more than 10-15 minutes to boot on standard Ubuntu GHA runners:
* By default, the workflow is configured to run on `macos-latest` where hardware acceleration is supported, enabling the emulator to boot in under 2 minutes.
* If forced to run on Ubuntu runners, ensure the driver execution mode is set to fallback to `"simulated"` to guarantee GHA pipeline completion and report generation.

---

## Repository Configuration Guide

To enable automated reporting to GitHub Pages:
1. Go to your GitHub repository -> **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
3. Under **Branch**, select the `gh-pages` branch and click **Save**.
4. To allow GHA workflows to write to Pages, go to **Settings** -> **Actions** -> **General** -> **Workflow permissions**, and ensure **Read and write permissions** is selected. Click **Save**.
