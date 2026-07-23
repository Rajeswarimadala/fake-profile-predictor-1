import os
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = "aiguard"

client = MongoClient(MONGODB_URL)
db = client[DB_NAME]

# Collections
users_col = db["users"]
scans_col = db["scans"]
alerts_col = db["alerts"]

def init_db():
    """Initialize collections, indexes, and seed sample data if empty."""
    print("Initializing Database...")
    
    # Create indexes for performance and uniqueness
    users_col.create_index("username", unique=True)
    users_col.create_index("email", unique=True)
    scans_col.create_index("timestamp")
    scans_col.create_index("username")
    alerts_col.create_index("timestamp")
    
    # Check if database seeding is required
    if users_col.count_documents({}) == 0:
        seed_users()
        
    if scans_col.count_documents({}) == 0:
        seed_scans_and_alerts()

def seed_users():
    print("Seeding default users...")
    # Simple plain-text hashing equivalent for the seed.
    # We will use hashlib for simplicity and dependency-free hashing
    import hashlib
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    admin_user = {
        "username": "admin",
        "email": "admin@aiguard.com",
        "hashed_password": hash_password("admin123"),
        "full_name": "Admin User",
        "created_at": datetime.utcnow()
    }
    try:
        users_col.insert_one(admin_user)
        print("Default admin user seeded (username: admin, password: admin123)")
    except Exception as e:
        print(f"Error seeding user: {e}")

def seed_scans_and_alerts():
    print("Seeding sample scans and alerts...")
    
    # Let's create realistic scans spanning the last 30 days
    base_time = datetime.utcnow()
    platforms = ["Instagram", "X", "Facebook"]
    
    sample_profiles = [
        {
            "owner": "admin",
            "username": "crypto_moon_elon99",
            "platform": "X",
            "url": "https://x.com/crypto_moon_elon99",
            "risk_score": 94,
            "category": "High-Risk Fake Profile",
            "text_score": 95,
            "image_score": 88,
            "behavior_score": 96,
            "network_score": 97,
            "details": {
                "text": "Profile description contains typical crypto spam keywords ('airdrop', 'guaranteed returns', 'dm for collab') and repetitive bot-like hashtags. High density of emoji usage without grammatical coherence.",
                "image": "Deepfake/GAN signature detected on profile picture. Artificial eye alignment symmetry and blurry outer hair boundaries strongly indicate AI-generated human face.",
                "behavior": "Extremely high posting frequency (average of 84 tweets per day) with automated interval clustering (exactly every 3 minutes, 24/7). Spams replies containing duplicate marketing links.",
                "network": "GNN analysis shows dense connection with a known cluster of 1,200 bot accounts. 94% of followers have identical account creation dates (May 2026)."
            }
        },
        {
            "owner": "admin",
            "username": "sarah_travel_adventures",
            "platform": "Instagram",
            "url": "https://instagram.com/sarah_travel_adventures",
            "risk_score": 12,
            "category": "Genuine Account",
            "text_score": 10,
            "image_score": 15,
            "behavior_score": 8,
            "network_score": 15,
            "details": {
                "text": "Natural text structure with high context diversity. Bio contains local travel blogs and unique description layout. Conversational slang and consistent syntax.",
                "image": "High authenticity index. Camera metadata matches typical smartphone capture. Visual content matches background contexts of images. No digital manipulation or GAN artifact patterns.",
                "behavior": "Human-like scheduling. Active hours align with normal timezone behavior (8 AM - 11 PM). Interaction rate matches organic follower patterns.",
                "network": "Healthy diverse graph. Followed by and following active real-life accounts. No spam clusters or massive coordinated activity groupings."
            }
        },
        {
            "owner": "admin",
            "username": "john_doe_fashion88",
            "platform": "Facebook",
            "url": "https://facebook.com/john_doe_fashion88",
            "risk_score": 68,
            "category": "Suspicious Account",
            "text_score": 72,
            "image_score": 40,
            "behavior_score": 82,
            "network_score": 78,
            "details": {
                "text": "Bio copy-pasted directly from online clothing brands. High volume of promotional links. Post content is almost entirely promotional templates with little customization.",
                "image": "Profile photo is a stock photo index match found on multiple commercial websites. However, no direct AI generation artifacts observed.",
                "behavior": "Repetitive sharing of promotional content. Posting activity spikes dramatically during sales periods, with 40-50 posts in quick succession, followed by days of absolute silence.",
                "network": "High centrality overlap with suspicious promotional networks. Followed by a disproportionate number of empty/new accounts."
            }
        },
        {
            "owner": "admin",
            "username": "bot_follower_generator",
            "platform": "Instagram",
            "url": "https://instagram.com/bot_follower_generator",
            "risk_score": 89,
            "category": "High-Risk Fake Profile",
            "text_score": 90,
            "image_score": 75,
            "behavior_score": 95,
            "network_score": 96,
            "details": {
                "text": "Advertises follower injection services. Bio uses character symbols to bypass spam filters (e.g. 'fоllоwеrs' with cyrillic characters).",
                "image": "Profile photo is heavily pixelated, matching a scraped thumbnail. Post photos show high structural similarity and duplicated stock promotional banners.",
                "behavior": "Mass following-unfollowing patterns. Follows up to 1,000 accounts per day, then drops them. Automated likes and automated comments containing emojis like 🔥 and 🙌 on unrelated popular tags.",
                "network": "Directly links back to payment gateways and bot-hosting command servers. Network matches known clusters of automated commercial hubs."
            }
        },
        {
            "owner": "admin",
            "username": "clara_cooking_secrets",
            "platform": "Instagram",
            "url": "https://instagram.com/clara_cooking_secrets",
            "risk_score": 18,
            "category": "Genuine Account",
            "text_score": 15,
            "image_score": 20,
            "behavior_score": 12,
            "network_score": 25,
            "details": {
                "text": "Organic, recipes and daily food diaries written with personal commentary. Interacts with cooking enthusiasts in the comment sections.",
                "image": "Original images representing actual dishes cooked in real home kitchens. Metadata is consistent and pixels display normal compression patterns.",
                "behavior": "Normal daily routines. Spontaneous posts at varying times, mostly around lunch and dinner. Engagement includes video reels showing direct face speaking.",
                "network": "Interacts with standard local community networks. Normal peer-to-peer follower relationship ratios."
            }
        }
    ]
    
    # Create 35 randomized scans historical log to populate trends and stats
    import random
    scans_to_insert = []
    
    for i in range(40):
        # Subtracting days to create historical trend line
        scan_date = base_time - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        # Decide profile type randomly but with realistic ratios: 45% Fake, 25% Suspicious, 30% Real
        rand = random.random()
        if rand < 0.45:
            username = f"spam_acc_{random.randint(100, 999)}"
            platform = random.choice(platforms)
            risk_score = random.randint(75, 98)
            category = "High-Risk Fake Profile"
            text_score = random.randint(75, 98)
            image_score = random.choice([random.randint(20, 40), random.randint(70, 95)]) # Stock or GAN
            behavior_score = random.randint(80, 99)
            network_score = random.randint(80, 99)
            text_desc = "Highly repetitive templates, promotional keywords, and spam tags. Bot-signature hashtags detected."
            image_desc = "GAN-generated artifacts identified in profile face image or pixelated scraped avatar."
            behavior_desc = "Automated post interval structure matching bot scheduling behaviors."
            network_desc = "Nodes closely clustered with coordinated malicious botnets."
        elif rand < 0.70:
            username = f"promo_user_{random.randint(10, 99)}"
            platform = random.choice(platforms)
            risk_score = random.randint(40, 74)
            category = "Suspicious Account"
            text_score = random.randint(45, 75)
            image_score = random.randint(30, 70)
            behavior_score = random.randint(45, 80)
            network_score = random.randint(40, 75)
            text_desc = "Copy-pasted bios and heavy reliance on promotional links. High percentage of copy-pasted posts."
            image_desc = "Stock photo identified. Profile matches multiple existing online indices."
            behavior_desc = "Spikes in daily activity followed by prolonged periods of silence."
            network_desc = "High frequency of connections with recently registered marketing accounts."
        else:
            username = f"genuine_net_{random.randint(100, 999)}"
            platform = random.choice(platforms)
            risk_score = random.randint(5, 30)
            category = "Genuine Account"
            text_score = random.randint(5, 25)
            image_score = random.randint(5, 25)
            behavior_score = random.randint(5, 25)
            network_score = random.randint(5, 30)
            text_desc = "Conversational structure, diverse context, natural slang, and genuine profile bio formatting."
            image_desc = "Authentic image capture. Camera metadata checks out. No anomalies."
            behavior_desc = "Organic, scattered scheduling. Posting patterns reflect standard human circadian rhythm."
            network_desc = "Decentralized social graph matching normal friendship circles."
            
        scan_doc = {
            "owner": "admin",
            "username": username,
            "platform": platform,
            "url": f"https://{platform.lower()}.com/{username}",
            "risk_score": risk_score,
            "category": category,
            "text_score": text_score,
            "image_score": image_score,
            "behavior_score": behavior_score,
            "network_score": network_score,
            "details": {
                "text": text_desc,
                "image": image_desc,
                "behavior": behavior_desc,
                "network": network_desc
            },
            "timestamp": scan_date
        }
        scans_to_insert.append(scan_doc)
        
    # Insert scans
    scans_col.insert_many(scans_to_insert)
    print(f"Inserted {len(scans_to_insert)} historical scan logs.")
    
    # Seed active alerts for High-Risk and Suspicious scans
    alerts_to_insert = []
    high_risk_scans = [s for s in scans_to_insert if s["risk_score"] >= 75][:8]
    for hrs in high_risk_scans:
        alerts_to_insert.append({
            "owner": "admin",
            "username": hrs["username"],
            "platform": hrs["platform"],
            "risk_score": hrs["risk_score"],
            "type": "High-Risk Profile Detected",
            "timestamp": hrs["timestamp"] + timedelta(minutes=5),
            "status": "active"
        })
        
    if alerts_to_insert:
        alerts_col.insert_many(alerts_to_insert)
        print(f"Inserted {len(alerts_to_insert)} live notifications.")
