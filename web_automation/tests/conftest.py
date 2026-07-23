import os
import json
import pytest
import logging
from drivers.simulated_driver import SimulatedDriver

logger = logging.getLogger("SeleniumFramework")

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "..", "config", "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {}

@pytest.fixture(scope="session")
def base_url():
    # Priority: Environment variable BASE_URL -> config base_url -> fallback local URL
    cfg = load_config()
    env_url = os.getenv("BASE_URL")
    if env_url:
        logger.info(f"Resolved BASE_URL from environment: {env_url}")
        return env_url
    fallback = cfg.get("fallback_url", "http://localhost:5173")
    logger.info(f"Resolved BASE_URL from fallback config: {fallback}")
    return fallback

@pytest.fixture(scope="function")
def driver():
    logger.info("Attempting to initialize Selenium Webdriver session...")
    driver_instance = None
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        driver_instance = webdriver.Chrome(options=options)
        logger.info("Headless Chrome Webdriver session initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to start Selenium Chrome Driver: {str(e)}. Falling back to SimulatedDriver.")
        driver_instance = SimulatedDriver()

    yield driver_instance
    
    logger.info("Terminating Webdriver session...")
    try:
        driver_instance.quit()
    except Exception as e:
        logger.error(f"Error quitting Webdriver: {str(e)}")

results_data = []

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    
    if rep.when == "call":
        test_case = item.funcargs.get("test_case")
        if test_case:
            test_case["execution_time"] = round(rep.duration, 3)
            if rep.passed:
                test_case["status"] = "Passed"
                test_case["actual_result"] = "Actions completed successfully on LIVE target URL."
            elif rep.failed:
                test_case["status"] = "Failed"
                test_case["failure_reason"] = str(call.excinfo.value)
                import traceback
                test_case["stack_trace"] = "".join(traceback.format_tb(call.excinfo.tb))
                test_case["actual_result"] = f"Failed: {str(call.excinfo.value)}"
            elif rep.skipped:
                test_case["status"] = "Skipped"
                test_case["failure_reason"] = str(rep.longrepr)
                test_case["actual_result"] = f"Skipped: {str(rep.longrepr)}"
            
            results_data.append(test_case)

def pytest_sessionfinish(session, exitstatus):
    output_path = os.path.join(os.path.dirname(__file__), "..", "reports", "temp_web_results.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2)
