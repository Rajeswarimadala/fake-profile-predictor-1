from pages.base_page import BasePage

class DashboardPage(BasePage):
    # Locators
    DASHBOARD_HEADER = ("id", "com.example.aiguard:id/dashboard_title")
    NEW_SCAN_WIZARD_BTN = ("id", "com.example.aiguard:id/btn_trigger_wizard")
    USERNAME_SEARCH_FIELD = ("id", "com.example.aiguard:id/search_query_input")
    PROFILE_SCAN_BTN = ("id", "com.example.aiguard:id/btn_start_profile_scan")
    SCAN_RESULT_VERDICT = ("id", "com.example.aiguard:id/scan_result_risk_score")
    NAV_DRAWER_BTN = ("id", "com.example.aiguard:id/btn_nav_drawer")
    LOGOUT_MENU_ITEM = ("id", "com.example.aiguard:id/nav_menu_logout")

    def open_scan_wizard(self):
        self.click(*self.NEW_SCAN_WIZARD_BTN)

    def scan_profile(self, target_username: str):
        self.send_keys(*self.USERNAME_SEARCH_FIELD, target_username)
        self.click(*self.PROFILE_SCAN_BTN)

    def get_risk_score(self) -> str:
        return self.get_text(*self.SCAN_RESULT_VERDICT)

    def perform_logout(self):
        self.click(*self.NAV_DRAWER_BTN)
        self.click(*self.LOGOUT_MENU_ITEM)
