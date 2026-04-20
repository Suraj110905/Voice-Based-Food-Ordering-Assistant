from fastapi import APIRouter
from pydantic import BaseModel
from data import restaurants, food_keywords
from database import orders_collection, favorites_collection, history_collection
from datetime import datetime
from ai_service import get_ai_response, get_recommendations, get_combo_suggestion

router = APIRouter()

# This defines what a user message looks like
class UserMessage(BaseModel):
    message: str

class AddItemRequest(BaseModel):
    item: str
    restaurant: str
    price: int

# Cart stored in memory
cart = []

# Conversation context
context = {
    "last_food": None,
    "last_options": [],
    "awaiting_restaurant": False,
    "awaiting_confirmation": False,
}

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
    global context
    message = user_input.message.lower()

    # ---- CONTEXT: Waiting for restaurant selection ----
    if context["awaiting_restaurant"] and context["last_options"]:
        for option in context["last_options"]:
            if option["restaurant"].lower() in message:
                existing = next(
                    (i for i in cart if i["item"] == option["item"]), None
                )
                if existing:
                    existing["quantity"] += 1
                else:
                    cart.append({
                        "item": option["item"],
                        "restaurant": option["restaurant"],
                        "price": option["price"],
                        "quantity": 1
                    })
                context["awaiting_restaurant"] = False
                context["last_options"] = []
                return {
                    "response": f"✅ Added {option['item']} from {option['restaurant']} to cart! Want anything else or shall I confirm the order?",
                    "cart": cart,
                    "total": calculate_total()
                }

    # ---- Check specific item by name ----
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

    # ---- Check cart/bill ----
    if "cart" in message or "bill" in message or "total" in message:
        if len(cart) == 0:
            return {"response": "Your cart is empty. What would you like to order?"}
        total = calculate_total()
        cart_summary = ", ".join(
            f"{item['item']} x{item['quantity']}" for item in cart
        )
        return {
            "response": f"Your cart has: {cart_summary}. Total bill is ₹{total}. Say confirm to place order!",
            "cart": cart,
            "total": total
        }

    # ---- Confirm order ----
    if "confirm" in message or "place order" in message:
        if len(cart) == 0:
            return {"response": "Your cart is empty. Please add items first."}
        total = calculate_total()
        order = {
            "items": cart.copy(),
            "total": total,
            "status": "placed",
            "timestamp": datetime.now().isoformat(),
        }
        await orders_collection.insert_one(order)
        await history_collection.insert_one(order)
        cart.clear()
        context["awaiting_confirmation"] = False
        return {
            "response": f"🎉 Order placed! Total paid ₹{total}. Food is on the way!",
            "order_placed": True
        }

    # ---- Yes/No handling ----
    if message.strip() in ["yes", "yeah", "yep", "sure", "ok", "okay"]:
        if context["awaiting_confirmation"]:
            if len(cart) == 0:
                return {"response": "Your cart is empty. Please add items first."}
            total = calculate_total()
            order = {
                "items": cart.copy(),
                "total": total,
                "status": "placed",
                "timestamp": datetime.now().isoformat(),
            }
            await orders_collection.insert_one(order)
            await history_collection.insert_one(order)
            cart.clear()
            context["awaiting_confirmation"] = False
            return {
                "response": f"🎉 Order placed! Total paid ₹{total}. Food is on the way!",
                "order_placed": True
            }
        return {
            "response": "What would you like to order? Try saying 'I want a burger'!"
        }

    # ---- Clear cart ----
    if "clear" in message or "remove all" in message or "cancel" in message:
        cart.clear()
        context = {
            "last_food": None,
            "last_options": [],
            "awaiting_restaurant": False,
            "awaiting_confirmation": False,
        }
        return {"response": "Cart cleared! What would you like to order?"}

    # ---- Order usual ----
    if "usual" in message or "order my usual" in message:
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
        context["awaiting_confirmation"] = True
        return {
            "response": f"✅ Added all your favorites to cart! Total is ₹{calculate_total()}. Shall I confirm the order?",
            "cart": cart,
            "total": calculate_total()
        }

    # ---- Food keyword matching ----
    food_keyword, items = find_food_in_message(message)
    if food_keyword:
        options = find_restaurants_for_food(food_keyword)
        if options:
            # If only one option just add it
            if len(options) == 1:
                first = options[0]
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
                return {
                    "response": f"✅ Added {first['item']} from {first['restaurant']}! Want anything else?",
                    "cart": cart,
                    "options": options
                }

            # Multiple options — ask user to choose
            context["last_food"] = food_keyword
            context["last_options"] = options
            context["awaiting_restaurant"] = True

            restaurant_names = list(set(o["restaurant"] for o in options))
            restaurants_text = " or ".join(restaurant_names)

            options_text = " | ".join(
                f"{o['item']} from {o['restaurant']} (₹{o['price']})"
                for o in options
            )

            return {
                "response": f"I found {food_keyword} at {restaurants_text}. Which restaurant do you prefer?",
                "cart": cart,
                "options": options
            }

    return {
        "response": "I didn't understand that. Try saying 'I want a burger', 'show my cart', or 'confirm order'."
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
class AIMessage(BaseModel):
    message: str

@router.post("/ai/chat")
async def ai_chat(user_input: AIMessage):
    """AI powered natural language endpoint"""
    
    # Get order history for personalization
    order_history = []
    async for order in history_collection.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(3):
        order_history.append(order)

    # Get AI response with history context
    ai_response = await get_ai_response(
        user_input.message, cart, order_history
    )

    if not ai_response:
        return {
            "response": "Sorry I couldn't understand that. Try saying 'I want a burger'!",
            "cart": cart,
            "total": calculate_total()
        }

    # Still process order logic alongside AI response
    message = user_input.message.lower()

    # Check for confirm
    if "confirm" in message or "place order" in message:
        if len(cart) > 0:
            total = calculate_total()
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
                "response": ai_response,
                "order_placed": True
            }

    # Check for specific items in message
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
                    "response": ai_response,
                    "cart": cart,
                    "total": calculate_total()
                }

    # Check food keywords
    food_keyword, items = find_food_in_message(message)
    if food_keyword:
        options = find_restaurants_for_food(food_keyword)
        if options:
            first = options[0]
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
            return {
                "response": ai_response,
                "cart": cart,
                "options": options,
                "total": calculate_total()
            }

    return {
        "response": ai_response,
        "cart": cart,
        "total": calculate_total()
    }
    
@router.get("/recommendations")
async def get_food_recommendations():
    """Get personalized food recommendations"""
    order_history = []
    async for order in history_collection.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(5):
        order_history.append(order)

    recommendation = await get_recommendations(order_history)
    return {"recommendation": recommendation}

@router.get("/cart/combo-suggestion")
async def combo_suggestion():
    """Get AI combo suggestion based on current cart"""
    if not cart:
        return {"suggestion": None}
    suggestion = await get_combo_suggestion(cart)
    return {"suggestion": suggestion}

@router.get("/search")
def search_food(q: str):
    """Search food items and restaurants"""
    query = q.lower()
    results = []

    for restaurant in restaurants:
        # Match restaurant name
        if query in restaurant["name"].lower():
            for item in restaurant["menu"]:
                results.append({
                    "item": item["item"],
                    "restaurant": restaurant["name"],
                    "price": item["price"],
                    "cuisine": restaurant["cuisine"],
                })
        else:
            # Match menu items
            for item in restaurant["menu"]:
                if query in item["item"].lower():
                    results.append({
                        "item": item["item"],
                        "restaurant": restaurant["name"],
                        "price": item["price"],
                        "cuisine": restaurant["cuisine"],
                    })

    return {"results": results}

@router.get("/stats")
async def get_statistics():
    """Get order statistics"""
    orders = []
    async for order in history_collection.find({}, {"_id": 0}):
        orders.append(order)

    if not orders:
        return {
            "total_orders": 0,
            "total_spent": 0,
            "favourite_food": None,
            "top_restaurant": None,
            "most_ordered": []
        }

    # Calculate total orders and spent
    total_orders = len(orders)
    total_spent = sum(
        order.get("total", 0) + 30 for order in orders
    )

    # Count item frequencies
    item_counts = {}
    restaurant_counts = {}

    for order in orders:
        for item in order.get("items", []):
            item_name = item["item"]
            restaurant = item["restaurant"]

            item_counts[item_name] = (
                item_counts.get(item_name, 0) + item["quantity"]
            )
            restaurant_counts[restaurant] = (
                restaurant_counts.get(restaurant, 0) + 1
            )

    # Find favourite food and top restaurant
    favourite_food = max(
        item_counts, key=item_counts.get
    ) if item_counts else None

    top_restaurant = max(
        restaurant_counts, key=restaurant_counts.get
    ) if restaurant_counts else None

    # Get top 5 most ordered items
    most_ordered = sorted(
        [{"name": k, "count": v} for k, v in item_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    return {
        "total_orders": total_orders,
        "total_spent": total_spent,
        "favourite_food": favourite_food,
        "top_restaurant": top_restaurant,
        "most_ordered": most_ordered
    }