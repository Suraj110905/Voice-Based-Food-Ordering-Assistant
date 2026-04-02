from fastapi import APIRouter
from pydantic import BaseModel
from data import restaurants, food_keywords
from database import orders_collection, favorites_collection, history_collection
from datetime import datetime

router = APIRouter()

# This defines what a user message looks like
class UserMessage(BaseModel):
    message: str

class AddItemRequest(BaseModel):
    item: str
    restaurant: str
    price: int

# Cart stored in memory for now
cart = []

# --------- HELPER FUNCTIONS ---------

def find_food_in_message(message: str):
    """Check if user mentioned any food item"""
    message = message.lower()
    for keyword, items in food_keywords.items():
        if keyword in message:
            return keyword, items
    return None, None

def find_restaurants_for_food(food_keyword: str):
    """Find which restaurants serve this food"""
    matching = []
    for restaurant in restaurants:
        for menu_item in restaurant["menu"]:
            for keyword, items in food_keywords.items():
                if keyword == food_keyword and menu_item["item"] in items:
                    matching.append({
                        "restaurant": restaurant["name"],
                        "item": menu_item["item"],
                        "price": menu_item["price"]
                    })
    return matching

def calculate_total():
    """Calculate total bill"""
    return sum(item["price"] * item["quantity"] for item in cart)

# --------- API ENDPOINTS ---------

@router.get("/restaurants")
def get_restaurants():
    """Get all restaurants"""
    return {"restaurants": restaurants}

@router.post("/order/process")
async def process_order(user_input: UserMessage):
    """Main endpoint - processes user voice message"""
    message = user_input.message.lower()

    # Check if user wants to add specific item by name
    for restaurant in restaurants:
        for menu_item in restaurant["menu"]:
            if menu_item["item"].lower() in message:
                existing = next(
                    (i for i in cart if i["item"] == menu_item["item"]), None
                )
                if existing:
                    existing["quantity"] += 1
                else:
                    cart.append({
                        "item": menu_item["item"],
                        "restaurant": restaurant["name"],
                        "price": menu_item["price"],
                        "quantity": 1
                    })
                return {
                    "response": f"✅ Added {menu_item['item']} from {restaurant['name']} to your cart! Want anything else?",
                    "cart": cart,
                    "total": calculate_total()
                }

    # Check if user wants to see cart
    if "cart" in message or "bill" in message or "total" in message:
        if len(cart) == 0:
            return {"response": "Your cart is empty. What would you like to order?"}
        total = calculate_total()
        cart_summary = ", ".join(
            f"{item['item']} x{item['quantity']}" for item in cart
        )
        return {
            "response": f"Your cart has: {cart_summary}. Total bill is ₹{total}.",
            "cart": cart,
            "total": total
        }

    # Check if user wants to confirm order
    if "confirm" in message or "place order" in message or "yes" in message:
        if len(cart) == 0:
            return {"response": "Your cart is empty. Please add items first."}
        total = calculate_total()

        # Save order to MongoDB
        order = {
            "items": cart.copy(),
            "total": total,
            "status": "placed",
            "timestamp": datetime.now().isoformat(),
        }
        await orders_collection.insert_one(order)
        await history_collection.insert_one(order)

        cart.clear()
        return {
            "response": f"🎉 Order placed successfully! Total paid: ₹{total}. Your food is on the way!",
            "order_placed": True
        }
    # Check if user wants to order usual favorites
    if "order my usual" in message or "usual" in message:
        favorites = []
        async for fav in favorites_collection.find({}, {"_id": 0}):
            favorites.append(fav)

        if not favorites:
            return {"response": "You have no favorites yet! Add some first."}

        for fav in favorites:
            existing = next(
                (i for i in cart if i["item"] == fav["item"]), None
            )
            if existing:
                existing["quantity"] += 1
            else:
                cart.append({
                    "item": fav["item"],
                    "restaurant": fav["restaurant"],
                    "price": fav["price"],
                    "quantity": 1
                })

        return {
            "response": f"✅ Added all your favorites to cart! Total is ₹{calculate_total()}. Want to confirm order?",
            "cart": cart,
            "total": calculate_total()
        }
    # Check if user wants to clear cart
    if "clear" in message or "remove all" in message or "cancel" in message:
        cart.clear()
        return {"response": "Cart cleared. What would you like to order?"}

    # Check what food the user wants
    food_keyword, items = find_food_in_message(message)

    if food_keyword:
        options = find_restaurants_for_food(food_keyword)
        if options:
            # Add first result to cart automatically
            first = options[0]

            # Check if item already in cart
            existing = next(
                (i for i in cart if i["item"] == first["item"]), None
            )
            if existing:
                existing["quantity"] += 1
            else:
                cart.append({
                    "item": first["item"],
                    "restaurant": first["restaurant"],
                    "price": first["price"],
                    "quantity": 1
                })

            # Build response with all options
            options_text = " | ".join(
                f"{o['item']} from {o['restaurant']} (₹{o['price']})"
                for o in options
            )

            return {
                "response": f"I found {food_keyword} options: {options_text}. I've added {first['item']} from {first['restaurant']} to your cart. Want anything else?",
                "cart": cart,
                "options": options
            }

    return {
        "response": "I didn't understand that. Try saying something like 'I want a burger' or 'show my cart'."
    }

@router.post("/cart/add")
async def add_specific_item(request: AddItemRequest):
    """Add a specific item directly to cart"""
    existing = next(
        (i for i in cart if i["item"] == request.item), None
    )
    if existing:
        existing["quantity"] += 1
    else:
        cart.append({
            "item": request.item,
            "restaurant": request.restaurant,
            "price": request.price,
            "quantity": 1
        })
    return {
        "response": f"✅ {request.item} from {request.restaurant} added to cart!",
        "cart": cart,
        "total": calculate_total()
    }

@router.get("/cart")
def get_cart():
    """Get current cart"""
    return {
        "cart": cart,
        "total": calculate_total()
    }

@router.delete("/cart/clear")
def clear_cart():
    """Clear the cart"""
    cart.clear()
    return {"response": "Cart cleared successfully!"}

@router.get("/orders/history")
async def get_order_history():
    """Get all past orders"""
    orders = []
    async for order in history_collection.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1):
        orders.append(order)
    return {"orders": orders}
class FavoriteItem(BaseModel):
    item: str
    restaurant: str
    price: int

@router.post("/favorites/add")
async def add_favorite(request: FavoriteItem):
    """Add item to favorites"""
    # Check if already in favorites
    existing = await favorites_collection.find_one(
        {"item": request.item}, {"_id": 0}
    )
    if existing:
        return {"response": f"{request.item} is already in your favorites!"}

    await favorites_collection.insert_one({
        "item": request.item,
        "restaurant": request.restaurant,
        "price": request.price,
    })
    return {"response": f"❤️ {request.item} added to favorites!"}

@router.get("/favorites")
async def get_favorites():
    """Get all favorites"""
    favorites = []
    async for fav in favorites_collection.find({}, {"_id": 0}):
        favorites.append(fav)
    return {"favorites": favorites}

@router.delete("/favorites/{item_name}")
async def remove_favorite(item_name: str):
    """Remove item from favorites"""
    await favorites_collection.delete_one({"item": item_name})
    return {"response": f"Removed {item_name} from favorites!"}

@router.post("/favorites/order-usual")
async def order_usual():
    """Add all favorites to cart"""
    favorites = []
    async for fav in favorites_collection.find({}, {"_id": 0}):
        favorites.append(fav)

    if not favorites:
        return {"response": "You have no favorites yet! Add some first."}

    for fav in favorites:
        existing = next(
            (i for i in cart if i["item"] == fav["item"]), None
        )
        if existing:
            existing["quantity"] += 1
        else:
            cart.append({
                "item": fav["item"],
                "restaurant": fav["restaurant"],
                "price": fav["price"],
                "quantity": 1
            })

    return {
        "response": f"✅ Added all {len(favorites)} favorites to cart!",
        "cart": cart,
        "total": calculate_total()
    }