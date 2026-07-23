import logging
from typing import Any

logger = logging.getLogger("AppiumFramework")

class BasePage:
    def __init__(self, driver: Any):
        self.driver = driver
        self.is_simulated = hasattr(driver, "is_simulated") and driver.is_simulated

    def find_element(self, locator_type: str, locator_value: str) -> Any:
        logger.info(f"Finding element by {locator_type}: {locator_value}")
        if self.is_simulated:
            return self.driver.find_element(locator_type, locator_value)
        return self.driver.find_element(by=locator_type, value=locator_value)

    def click(self, locator_type: str, locator_value: str):
        logger.info(f"Clicking element by {locator_type}: {locator_value}")
        if self.is_simulated:
            self.driver.click(locator_type, locator_value)
            return
        element = self.find_element(locator_type, locator_value)
        element.click()

    def send_keys(self, locator_type: str, locator_value: str, text: str):
        logger.info(f"Sending keys '{text}' to element by {locator_type}: {locator_value}")
        if self.is_simulated:
            self.driver.send_keys(locator_type, locator_value, text)
            return
        element = self.find_element(locator_type, locator_value)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator_type: str, locator_value: str) -> str:
        logger.info(f"Getting text from element by {locator_type}: {locator_value}")
        if self.is_simulated:
            return self.driver.get_text(locator_type, locator_value)
        element = self.find_element(locator_type, locator_value)
        return element.text

    def is_displayed(self, locator_type: str, locator_value: str) -> bool:
        logger.info(f"Checking visibility of element by {locator_type}: {locator_value}")
        if self.is_simulated:
            return self.driver.is_displayed(locator_type, locator_value)
        try:
            element = self.find_element(locator_type, locator_value)
            return element.is_displayed()
        except Exception:
            return False
