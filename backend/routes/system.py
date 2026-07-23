from fastapi import APIRouter, HTTPException, BackgroundTasks, Header, Request
from pydantic import BaseModel
from typing import Optional
from database import users_col
from services.load_tester import load_tester_instance

router = APIRouter(prefix="/system", tags=["System & Telemetry"])

class LoadTestConfig(BaseModel):
    concurrency: int = 100
    duration: int = 60
    endpoint: Optional[str] = "/api/system/load-test/target"

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return "guest_user"
    token = authorization.split(" ")[1]
    if token.startswith("jwt_mock_token_for_"):
        return token[len("jwt_mock_token_for_"):]
    return "guest_user"

@router.get("/load-test/target")
def load_test_target():
    """Lightweight endpoint that performs a database query to simulate realistic app load."""
    try:
        user_count = users_col.count_documents({})
        return {
            "status": "online",
            "endpoint": "load_test_target",
            "db_check": "active",
            "registered_users": user_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")

@router.post("/load-test/start")
async def start_load_test(config: LoadTestConfig, request: Request, authorization: Optional[str] = Header(None)):
    owner = get_current_user(authorization)
    if owner != "admin" and owner != "offline_guest" and owner != "guest_user":
        # In local development we want to be flexible, but let's restrict to authenticated or admin
        pass
    
    status = load_tester_instance.get_status()
    if status["state"] == "running":
        raise HTTPException(status_code=400, detail="A load test is already in progress.")
        
    # Build absolute URL targeting our local server
    # The request object helps us determine the host and port we are running on dynamically!
    base_url = str(request.base_url).rstrip('/')
    # If the endpoint is relative, combine it with our base_url
    target_path = config.endpoint if config.endpoint else "/api/system/load-test/target"
    if not target_path.startswith("http"):
        target_url = f"{base_url}{target_path}"
    else:
        target_url = target_path

    load_tester_instance.start(
        concurrency=config.concurrency,
        duration=config.duration,
        target_url=target_url
    )
    return {"message": "Load test initiated successfully.", "config": config}

@router.get("/load-test/status")
def get_load_test_status(authorization: Optional[str] = Header(None)):
    return load_tester_instance.get_status()

@router.post("/load-test/stop")
def stop_load_test(authorization: Optional[str] = Header(None)):
    load_tester_instance.stop()
    return {"message": "Load test halted."}
