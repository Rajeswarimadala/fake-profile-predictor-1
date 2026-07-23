import logging

logger = logging.getLogger("AppiumFramework")

class DummyWebElement:
    def __init__(self, locator_type, locator_value):
        self.locator_type = locator_type
        self.locator_value = locator_value
        self.text = f"Simulated text for {locator_value}"

    def click(self):
        logger.info(f"WebElement clicked: {self.locator_value}")

    def send_keys(self, text):
        logger.info(f"WebElement sent keys '{text}': {self.locator_value}")

    def clear(self):
        logger.info(f"WebElement cleared: {self.locator_value}")

    def is_displayed(self) -> bool:
        return True

class SimulatedDriver:
    def __init__(self):
        self.is_simulated = True
        logger.info("Initializing SimulatedDriver session.")

    def find_element(self, by: str, value: str):
        return DummyWebElement(by, value)

    def click(self, by: str, value: str):
        logger.info(f"SimulatedDriver click: {by}={value}")

    def send_keys(self, by: str, value: str, text: str):
        logger.info(f"SimulatedDriver send_keys: {by}={value} | text={text}")

    def get_text(self, by: str, value: str) -> str:
        return f"Mock text for {value}"

    def is_displayed(self, by: str, value: str) -> bool:
        return True

    def get_screenshot_as_file(self, filepath: str):
        with open(filepath, "w") as f:
            f.write("MOCK DEVICE SCREENSHOT")

    def quit(self):
        logger.info("Quitting SimulatedDriver session.")
