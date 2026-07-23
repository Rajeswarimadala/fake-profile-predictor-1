from pages.base_page import BaseWebPage

class SplashPage(BaseWebPage):
    LOGIN_BUTTON = ("css selector", ".primary-btn")
    GUEST_BUTTON = ("css selector", ".secondary-btn")
    HERO_TITLE = ("css selector", ".splash-title")

    def click_login(self):
        self.click(*self.LOGIN_BUTTON)

    def click_guest(self):
        self.click(*self.GUEST_BUTTON)

    def get_title(self) -> str:
        return self.get_text(*self.HERO_TITLE)
