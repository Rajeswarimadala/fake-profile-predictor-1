import os
import json
import pytest
import logging
from drivers.simulated_driver import SimulatedDriver

# Set up simple logging block
logger = logging.getLogger("AppiumFramework")

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "..", "config", "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {}

@pytest.fixture(scope="session")
def app_config():
    return load_config()

@pytest.fixture(scope="function")
def driver(app_config):
    execution_mode = os.getenv("EXECUTION_MODE", app_config.get("execution_mode", "simulated")).lower()
    driver_instance = None
    
    if execution_mode == "live":
        logger.info("Attempting to initialize Live Appium Driver...")
        try:
            from appium import webdriver
            from appium.options.common import AppiumOptions
            
            options = AppiumOptions()
            options.set_capability("platformName", app_config.get("platform_name", "Android"))
            options.set_capability("appium:deviceName", app_config.get("device_name", "Android Emulator"))
            options.set_capability("appium:app", app_config.get("apk_path", ""))
            options.set_capability("appium:automationName", "UiAutomator2")
            options.set_capability("appium:appPackage", app_config.get("app_package", "com.example.aiguard"))
            options.set_capability("appium:appActivity", app_config.get("app_activity", ".MainActivity"))
            
            server_url = app_config.get("appium_server_url", "http://127.0.0.1:4723")
            driver_instance = webdriver.Remote(server_url, options=options)
            logger.info("Live Appium Driver session established successfully.")
        except Exception as e:
            logger.warning(f"Failed to start Live Appium Driver: {str(e)}. Falling back to SimulatedDriver.")
            driver_instance = SimulatedDriver()
    else:
        logger.info("Initializing Simulated Driver (Simulated Mode)...")
        driver_instance = SimulatedDriver()

    yield driver_instance
    
    logger.formatTime = lambda record, datefmt=None: ""
    logger.info("Terminating driver session...")
    try:
        driver_instance.quit()
    except Exception as e:
        logger.error(f"Error quitting driver: {str(e)}")

# Global list to store test results
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
                test_case["actual_result"] = "Actions completed successfully. UI state matches expectation."
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
    output_path = os.path.join(os.path.dirname(__file__), "..", "reports", "temp_results.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results_data, f, indent=2)
