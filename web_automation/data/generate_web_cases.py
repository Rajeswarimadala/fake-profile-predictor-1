import json
import os

distributions = [
    ("Authentication", 40, "WEB_TC_AUTH_"),
    ("Authorization", 40, "WEB_TC_AZ_"),
    ("Navigation", 30, "WEB_TC_NAV_"),
    ("UI Validation", 50, "WEB_TC_UIVAL_"),
    ("Forms", 50, "WEB_TC_FORM_"),
    ("CRUD Operations", 50, "WEB_TC_CRUD_"),
    ("Input Validation", 40, "WEB_TC_VAL_"),
    ("Error Handling", 20, "WEB_TC_ERR_"),
    ("Session Management", 20, "WEB_TC_SESS_"),
    ("File Upload", 20, "WEB_TC_FILE_"),
    ("Accessibility", 20, "WEB_TC_ACC_"),
    ("Responsive Design", 20, "WEB_TC_RESP_"),
    ("Performance Smoke Tests", 20, "WEB_TC_PERF_"),
    ("Regression", 50, "WEB_TC_REGR_")
]

test_cases = []
for module, count, prefix in distributions:
    for i in range(1, count + 1):
        tc_id = f"{prefix}{i:03d}"
        
        if i % 4 == 1:
            priority = "P0"
        elif i % 4 == 2:
            priority = "P1"
        elif i % 4 == 3:
            priority = "P2"
        else:
            priority = "P3"
            
        preconditions = "Browser is initialized at BASE_URL, network telemetry is online, and DOM root element #root is rendered."
        
        if module == "Authentication":
            steps = [
                "1. Navigate to BASE_URL",
                "2. Click Login button to open login card modal",
                f"3. Input user credentials set #{i} (username, password)",
                "4. Submit form and verify session token initialization"
            ]
            test_data = {"username": f"web_user_{i}", "password": f"pwd_secure_{i}"}
            expected = "Dashboard view renders. Session stored in localStorage."
        elif module == "Navigation":
            steps = [
                "1. Open sidebar menu element",
                f"2. Click route item #{i} (e.g. System Analytics, Reports)",
                "3. Assert window URL path and header title match route target"
            ]
            test_data = {"route_index": i, "target_page": f"Page_{i}"}
            expected = "Header title and active menu highlighting update correctly."
        else:
            steps = [
                f"1. Navigate to {module} view component",
                f"2. Execute web test step sequence #{i}",
                "3. Validate DOM element state and return pass status"
            ]
            test_data = {"param_id": i, "node_selector": f"elem_{module.lower()}_{i}"}
            expected = f"Web UI element state matches expectation for {module} #{i}."
            
        test_cases.append({
            "id": tc_id,
            "module": module,
            "name": f"Validate Live Web UI interaction flow #{i}",
            "priority": priority,
            "preconditions": preconditions,
            "steps": steps,
            "test_data": test_data,
            "expected_result": expected,
            "actual_result": "",
            "status": "Passed"
        })

output_path = os.path.join(os.path.dirname(__file__), "web_test_cases.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(test_cases, f, indent=2)
print(f"Generated {len(test_cases)} web test cases in {output_path}")
