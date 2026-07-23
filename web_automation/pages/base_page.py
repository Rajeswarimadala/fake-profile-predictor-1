import logging
from typing import Any, List

logger = logging.getLogger("SeleniumFramework")

class BaseWebPage:
    def __init__(self, driver: Any, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip('/')

    def open_url(self, path: str = ""):
        target_url = f"{self.base_url}/{path.lstrip('/')}"
        logger.info(f"Opening URL: {target_url}")
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            return
        self.driver.get(target_url)

    def find_element(self, by: str, value: str) -> Any:
        logger.info(f"Finding web element by {by}: {value}")
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            return self.driver.find_element(by, value)
        return self.driver.find_element(by, value)

    def click(self, by: str, value: str):
        logger.info(f"Clicking web element by {by}: {value}")
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            self.driver.click(by, value)
            return
        element = self.find_element(by, value)
        element.click()

    def type_text(self, by: str, value: str, text: str):
        logger.info(f"Typing '{text}' into web element by {by}: {value}")
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            self.driver.send_keys(by, value, text)
            return
        element = self.find_element(by, value)
        element.clear()
        element.send_keys(text)

    def get_text(self, by: str, value: str) -> str:
        logger.info(f"Getting text from web element by {by}: {value}")
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            return f"Simulated text for {value}"
        element = self.find_element(by, value)
        return element.text

    def get_browser_logs(self) -> List[str]:
        if hasattr(self.driver, "is_simulated") and self.driver.is_simulated:
            return ["[Simulated] Browser console log: NO_ERRORS"]
        try:
            logs = self.driver.get_log('browser')
            return [f"[{entry['level']}] {entry['message']}" for entry in logs]
        except Exception:
            return ["Unable to retrieve browser logs."]
