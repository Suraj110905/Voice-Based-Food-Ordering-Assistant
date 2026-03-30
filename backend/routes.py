from fastapi import APIRouter
from pydantic import BaseModel
from data import restaurants, food_keywords

router = APIRouter()

# This defines what a user message looks like
class UserMessage(BaseModel):
    message: str

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
def process_order(user_input: UserMessage):
    """Main endpoint - processes user voice message"""
    message = user_input.message.lower()

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
        cart.clear()
        return {
            "response": f"🎉 Order placed successfully! Total paid: ₹{total}. Your food is on the way!",
            "order_placed": True
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