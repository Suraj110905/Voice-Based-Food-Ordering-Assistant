from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from auth_routes import auth_router
from wallet_routes import wallet_router
from database import client

app = FastAPI(title="Voice Food Ordering Assistant")

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(router)
app.include_router(auth_router)
app.include_router(wallet_router)

@app.on_event("startup")
async def startup_db():
    """Test MongoDB connection on startup"""
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

@app.on_event("shutdown")
async def shutdown_db():
    """Close MongoDB connection on shutdown"""
    client.close()
    print("MongoDB connection closed!")

@app.get("/")
def root():
    return {"message": "Voice Food Ordering Assistant API is running!"}