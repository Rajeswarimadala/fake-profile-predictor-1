from pages.base_page import BasePage

class RegisterPage(BasePage):
    # Locators
    FULLNAME_FIELD = ("id", "com.example.aiguard:id/register_fullname")
    EMAIL_FIELD = ("id", "com.example.aiguard:id/register_email")
    PASSWORD_FIELD = ("id", "com.example.aiguard:id/register_password")
    CONFIRM_PASSWORD_FIELD = ("id", "com.example.aiguard:id/register_confirm_password")
    SUBMIT_BUTTON = ("id", "com.example.aiguard:id/btn_register_submit")
    BACK_TO_LOGIN = ("id", "com.example.aiguard:id/link_back_login")

    def register_user(self, fullname: str, email: str, password: str):
        self.send_keys(*self.FULLNAME_FIELD, fullname)
        self.send_keys(*self.EMAIL_FIELD, email)
        self.send_keys(*self.PASSWORD_FIELD, password)
        self.send_keys(*self.CONFIRM_PASSWORD_FIELD, password)
        self.click(*self.SUBMIT_BUTTON)

    def navigate_back_to_login(self):
        self.click(*self.BACK_TO_LOGIN)
