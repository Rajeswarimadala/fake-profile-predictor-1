import os
import logging

def setup_logger(log_dir: str) -> logging.Logger:
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "web_automation.log")
    
    logger = logging.getLogger("SeleniumFramework")
    logger.setLevel(logging.DEBUG)
    
    if logger.handlers:
        return logger

    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s')

    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
