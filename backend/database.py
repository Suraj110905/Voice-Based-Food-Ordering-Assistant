import motor.motor_asyncio

# Connect to MongoDB
MONGO_URL = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

# Create database
db = client.voice_food_app

# Collections
orders_collection = db.orders
favorites_collection = db.favorites
history_collection = db.history
wallets_collection = db.wallets
reviews_collection = db.reviews
tracking_collection = db.tracking