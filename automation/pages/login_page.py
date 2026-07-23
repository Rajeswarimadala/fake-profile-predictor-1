from pages.base_page import BasePage

class LoginPage(BasePage):
    # Locators (Appium ID or XPath mapping)
    USERNAME_FIELD = ("id", "com.example.aiguard:id/username_input")
    PASSWORD_FIELD = ("id", "com.example.aiguard:id/password_input")
    LOGIN_BUTTON = ("id", "com.example.aiguard:id/btn_login")
    ERROR_ALERT = ("id", "com.example.aiguard:id/error_message")
    REGISTER_LINK = ("id", "com.example.aiguard:id/register_link")

    def login(self, username: str, password: str):
        self.send_keys(*self.USERNAME_FIELD, username)
        self.send_keys(*self.PASSWORD_FIELD, password)
        self.click(*self.LOGIN_BUTTON)

    def get_error_message(self) -> str:
        return self.get_text(*self.ERROR_ALERT)

    def navigate_to_register(self):
        self.click(*self.REGISTER_LINK)
