import os
import logging
from typing import Any

logger = logging.getLogger("SeleniumFramework")

class WebScreenshotUtil:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def capture_screenshot(self, driver: Any, tc_id: str):
        filename = f"{tc_id}.png"
        filepath = os.path.join(self.output_dir, filename)
        
        is_simulated = hasattr(driver, "is_simulated") and driver.is_simulated
        logger.info(f"Capturing web viewport screenshot for test: {tc_id} (simulated={is_simulated})")

        try:
            if is_simulated:
                with open(filepath, "w") as f:
                    f.write(f"MOCK VIEWPORT SCREENSHOT FOR WEB TEST CASE: {tc_id}\n")
            else:
                driver.save_screenshot(filepath)
            logger.info(f"Viewport screenshot saved: {filepath}")
        except Exception as e:
            logger.error(f"Failed to capture screenshot for {tc_id}: {str(e)}")
