import random
import re
from datetime import datetime
from typing import Dict, Any

def analyze_profile(username: str, platform: str, url: str, has_image: bool) -> Dict[str, Any]:
    """
    Simulates the multi-modal generative AI analyzer.
    Analyzes the username text structure and context to compute realistic 
    risk metrics and explainable classification reports.
    """
    cleaned_name = username.lower().strip("@")
    
    # Flags to skew risk scores
    is_crypto_spam = any(k in cleaned_name for k in ["crypto", "moon", "elon", "togo", "coin", "trade", "rich", "invest"])
    is_bot_pattern = any(k in cleaned_name for k in ["bot", "spam", "follow", "free", "gift", "giveaway", "mod", "cheat", "hack"])
    has_trailing_digits = bool(re.search(r'\d{3,}$', cleaned_name)) # 3 or more digits at end
    is_generic_spam = len(cleaned_name) < 4 or is_crypto_spam or is_bot_pattern
    
    # Base risk determination
    if is_crypto_spam:
        risk_level = "high"
        risk_base = random.randint(88, 98)
    elif is_bot_pattern:
        risk_level = "high"
        risk_base = random.randint(82, 94)
    elif has_trailing_digits:
        risk_level = "medium"
        risk_base = random.randint(58, 80)
    elif is_generic_spam:
        risk_level = "medium"
        risk_base = random.randint(45, 75)
    else:
        risk_level = "low"
        risk_base = random.randint(5, 25)

    # Compute component scores with slight random variations around the base
    text_score = min(100, max(5, risk_base + random.randint(-8, 8)))
    image_score = min(100, max(5, (risk_base if has_image or is_crypto_spam else random.randint(10, 40)) + random.randint(-10, 10)))
    behavior_score = min(100, max(5, risk_base + random.randint(-5, 5)))
    network_score = min(100, max(5, risk_base + random.randint(-6, 6)))
    bot_score = min(100, max(5, risk_base + random.randint(-5, 5)))
    
    # Re-calculate overall risk score as a weighted average
    overall_risk = int(0.3 * text_score + 0.25 * image_score + 0.25 * behavior_score + 0.2 * network_score)
    
    # Categorization
    if overall_risk >= 75:
        category = "High-Risk Fake Profile"
    elif overall_risk >= 40:
        category = "Suspicious Account"
    else:
        category = "Genuine Account"
        
    # Generate structured explainable details
    details = {
        "text": {
            "score": text_score,
            "bio_analysis": (
                f"NLP textual analysis identified a high density of financial spam templates. Contains cryptocurrency marketing buzzwords ('airdrop', 'to the moon', 'guaranteed profits')."
                if overall_risk >= 75 else
                "Bio contains generic phrasing and promotional templates with low language vocabulary diversity."
                if overall_risk >= 40 else
                "Natural language patterns detected. Structure is unique and highly conversational, containing localized interests."
            ),
            "username_analysis": (
                "Username contains spam trigger tokens or high numeric concentration."
                if overall_risk >= 40 else
                "Username structure is consistent with normal human names or brand identities."
            ),
            "keyword_detection": (
                "High density of promotional spam keywords detected."
                if overall_risk >= 40 else
                "Low density of marketing/spam keywords."
            ),
            "ai_generated_probability": f"{text_score}%"
        },
        "image": {
            "score": image_score,
            "deepfake_probability": f"{image_score}%",
            "authenticity_score": f"{100 - image_score}%",
            "manipulation_detected": "Yes" if image_score >= 50 else "No"
        },
        "behavior": {
            "score": behavior_score,
            "posting_frequency": (
                "Coordinated behavior analyzer flagged anomalous posting patterns. Active continuously 24 hours a day."
                if overall_risk >= 75 else
                "Intermittent spikes in timeline interactions, performing bulk actions."
                if overall_risk >= 40 else
                "Timeline behaviors match standard human usage with normal sleep intervals."
            ),
            "engagement_pattern": (
                "Spamming duplicate comments and promotional links."
                if overall_risk >= 40 else
                "Organic conversational responses with normal distribution of likes/shares."
            ),
            "follower_ratio": (
                "Highly anomalous follower-to-following ratio indicating automation."
                if overall_risk >= 40 else
                "Healthy, normal follower-to-following ratio."
            ),
            "activity_consistency": (
                "Coordinated automated timeline patterns."
                if overall_risk >= 40 else
                "Circadian usage patterns indicating human behavior."
            )
        },
        "network": {
            "score": network_score,
            "connection_trust_score": f"{100 - network_score}%",
            "mutual_account_analysis": (
                "Graph neural check shows dense clustering with empty bot accounts."
                if overall_risk >= 40 else
                "Decentralized connection network with high ratio of mutual accounts."
            ),
            "suspicious_connections": (
                "Linked directly to verified promotional networks or coordinate nodes."
                if overall_risk >= 40 else
                "Connected primarily to organic, verified, or diverse node sets."
            )
        },
        "bot": {
            "score": bot_score,
            "automation_likelihood": f"{bot_score}%",
            "bot_score_detail": f"{bot_score}/100",
            "spam_indicators": (
                "High density of duplicate sharing and bulk automated tags."
                if overall_risk >= 40 else
                "No automated bulk tags or spam activity registered."
            )
        }
    }

    return {
        "username": username,
        "platform": platform,
        "url": url,
        "risk_score": overall_risk,
        "category": category,
        "text_score": text_score,
        "image_score": image_score,
        "behavior_score": behavior_score,
        "network_score": network_score,
        "bot_score": bot_score,
        "details": details,
        "timestamp": datetime.utcnow()
    }
