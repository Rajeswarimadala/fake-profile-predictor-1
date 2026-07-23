import os
import logging
from typing import Any

logger = logging.getLogger("AppiumFramework")

class ScreenshotUtil:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def capture_screenshot(self, driver: Any, tc_id: str):
        """Captures a screenshot of the current test view."""
        filename = f"{tc_id}.png"
        filepath = os.path.join(self.output_dir, filename)
        
        is_simulated = hasattr(driver, "is_simulated") and driver.is_simulated
        logger.info(f"Capturing screenshot for test: {tc_id} (simulated={is_simulated})")

        try:
            if is_simulated:
                # Write a simple placeholder file or mock drawing
                # We can generate a text screenshot indicating the test status
                with open(filepath, "w") as f:
                    f.write(f"MOCK SCREENSHOT FOR TEST CASE: {tc_id}\n")
                    f.write(f"Driver state: SIMULATED\n")
                    f.write(f"Captured: {logging.Formatter().formatTime}\n")
            else:
                # Actual Appium screen capture
                driver.get_screenshot_as_file(filepath)
            
            logger.info(f"Screenshot successfully saved: {filepath}")
        except Exception as e:
            logger.error(f"Failed to capture screenshot for {tc_id}: {str(e)}")
            # Write fallback file on exception
            try:
                with open(filepath, "w") as f:
                    f.write(f"CRITICAL: Failed to capture driver screenshot: {str(e)}")
            except Exception:
                pass
