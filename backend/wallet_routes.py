from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import wallets_collection, orders_collection, history_collection
from datetime import datetime

wallet_router = APIRouter(prefix="/wallet", tags=["Wallet"])

# --------- MODELS ---------
class CreateWalletRequest(BaseModel):
    username: str
    secret_code: str

class AddMoneyRequest(BaseModel):
    username: str
    amount: float

class VoicePaymentRequest(BaseModel):
    username: str
    spoken_code: str
    order_total: float
    cart: list

class UpdateSecretCodeRequest(BaseModel):
    username: str
    new_code: str

# --------- CREATE WALLET ---------
@wallet_router.post("/create")
async def create_wallet(request: CreateWalletRequest):
    """Create wallet for user"""
    existing = await wallets_collection.find_one(
        {"username": request.username}
    )
    if existing:
        return {"message": "Wallet already exists!", "balance": existing["balance"]}

    wallet = {
        "username": request.username,
        "balance": 500.0,  # Free ₹500 welcome bonus!
        "secret_code": request.secret_code.upper(),
        "transactions": [],
        "created_at": datetime.now().isoformat(),
    }
    await wallets_collection.insert_one(wallet)
    return {
        "message": f"🎉 Wallet created! Welcome bonus ₹500 added!",
        "balance": 500.0,
        "username": request.username
    }

# --------- GET WALLET ---------
@wallet_router.get("/{username}")
async def get_wallet(username: str):
    """Get wallet details"""
    wallet = await wallets_collection.find_one(
        {"username": username}, {"_id": 0, "secret_code": 0}
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found!")
    return wallet

# --------- ADD MONEY ---------
@wallet_router.post("/add-money")
async def add_money(request: AddMoneyRequest):
    """Add money to wallet"""
    wallet = await wallets_collection.find_one(
        {"username": request.username}
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found!")

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive!")

    if request.amount > 10000:
        raise HTTPException(status_code=400, detail="Maximum add limit is ₹10,000!")

    new_balance = wallet["balance"] + request.amount

    transaction = {
        "type": "credit",
        "amount": request.amount,
        "description": "Money added to wallet",
        "timestamp": datetime.now().isoformat(),
        "balance_after": new_balance
    }

    await wallets_collection.update_one(
        {"username": request.username},
        {
            "$set": {"balance": new_balance},
            "$push": {"transactions": transaction}
        }
    )
    return {
        "message": f"✅ ₹{request.amount} added to wallet!",
        "new_balance": new_balance
    }

# --------- VOICE PAYMENT ---------
@wallet_router.post("/voice-payment")
async def voice_payment(request: VoicePaymentRequest):
    """Process payment using voice secret code"""
    wallet = await wallets_collection.find_one(
        {"username": request.username}
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found!")

    # Verify secret code
    if request.spoken_code.upper().strip() != wallet["secret_code"].upper().strip():
        raise HTTPException(
            status_code=401,
            detail="❌ Wrong secret code! Payment failed."
        )

    # Check balance
    total_with_delivery = request.order_total + 30
    if wallet["balance"] < total_with_delivery:
        raise HTTPException(
            status_code=400,
            detail=f"❌ Insufficient balance! You need ₹{total_with_delivery} but have ₹{wallet['balance']}"
        )

    # Deduct balance
    new_balance = wallet["balance"] - total_with_delivery

    transaction = {
        "type": "debit",
        "amount": total_with_delivery,
        "description": f"Food order payment",
        "timestamp": datetime.now().isoformat(),
        "balance_after": new_balance
    }

    await wallets_collection.update_one(
        {"username": request.username},
        {
            "$set": {"balance": new_balance},
            "$push": {"transactions": transaction}
        }
    )

    # Save order to DB
    order = {
        "username": request.username,
        "items": request.cart,
        "total": request.order_total,
        "delivery_fee": 30,
        "grand_total": total_with_delivery,
        "status": "confirmed",
        "payment_method": "wallet",
        "timestamp": datetime.now().isoformat(),
    }
    await orders_collection.insert_one(order)
    await history_collection.insert_one({**order, "_id": None})

    return {
        "message": f"✅ Payment successful! ₹{total_with_delivery} deducted.",
        "new_balance": new_balance,
        "order_placed": True,
        "response": f"🎉 Payment of ₹{total_with_delivery} successful! Wallet balance: ₹{new_balance:.0f}. Your food is on the way!"
    }

# --------- GET TRANSACTIONS ---------
@wallet_router.get("/{username}/transactions")
async def get_transactions(username: str):
    """Get wallet transaction history"""
    wallet = await wallets_collection.find_one(
        {"username": username}, {"_id": 0, "secret_code": 0}
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found!")

    transactions = wallet.get("transactions", [])
    transactions.reverse()  # Latest first
    return {
        "transactions": transactions,
        "balance": wallet["balance"]
    }

# --------- UPDATE SECRET CODE ---------
@wallet_router.put("/update-secret-code")
async def update_secret_code(request: UpdateSecretCodeRequest):
    """Update wallet secret code"""
    wallet = await wallets_collection.find_one(
        {"username": request.username}
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found!")

    await wallets_collection.update_one(
        {"username": request.username},
        {"$set": {"secret_code": request.new_code.upper()}}
    )
    return {"message": "✅ Secret code updated successfully!"}