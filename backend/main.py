from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import auth, scans, alerts, reports, system

app = FastAPI(
    title="ImposterX API",
    description="Backend API for Social Media Fake Profile & Bot Detection",
    version="1.0.0"
)

# Allow CORS for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    init_db()

@app.get("/api")
def root_info():
    return {
        "status": "online",
        "service": "ImposterX Detection Framework",
        "database": "MongoDB Connected",
        "api_version": "1.0.0"
    }

# Register API routes
app.include_router(auth.router, prefix="/api")
app.include_router(scans.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(system.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
