import sys
from database import init_db, scans_col, alerts_col, users_col
from services.analyzer import analyze_profile

def run_tests():
    print("--- Running Backend Verification Test ---")
    
    # 1. Test database connection & seeding
    try:
        init_db()
        print("[OK] Database connection and seeding completed successfully!")
    except Exception as e:
        print(f"[FAIL] Database initialization failed: {e}")
        sys.exit(1)
        
    # Check document counts
    user_count = users_col.count_documents({})
    scan_count = scans_col.count_documents({})
    alert_count = alerts_col.count_documents({})
    
    print(f"Current DB Status:")
    print(f"  - Users: {user_count}")
    print(f"  - Scans: {scan_count}")
    print(f"  - Alerts: {alert_count}")
    
    if user_count == 0 or scan_count == 0:
        print("[FAIL] DB was not seeded properly!")
        sys.exit(1)
    else:
        print("[OK] Seed verification passed!")

    # 2. Test profile analyzer logic
    print("Testing Profile Analyzer Heuristics:")
    
    # Test low risk genuine account
    res_real = analyze_profile("david_smith_dev", "X", "", False)
    print(f"  - @david_smith_dev: Category={res_real['category']}, Risk={res_real['risk_score']}%")
    assert res_real["risk_score"] < 40, "Genuine account should be low risk"
    
    # Test high risk crypto account
    res_crypto = analyze_profile("crypto_elon_moon", "Instagram", "", False)
    print(f"  - @crypto_elon_moon: Category={res_crypto['category']}, Risk={res_crypto['risk_score']}%")
    assert res_crypto["risk_score"] >= 75, "Crypto spam account should be high risk"
    
    print("[OK] Analyzer logic verification passed!")
    print("--- All Backend Tests Passed! ---")

if __name__ == "__main__":
    run_tests()
