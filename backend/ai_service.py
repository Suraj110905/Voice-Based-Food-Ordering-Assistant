from groq import Groq
from dotenv import load_dotenv
from data import restaurants
import os

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Build restaurant menu context for AI
def get_menu_context():
    context = "Available restaurants and menus:\n"
    for restaurant in restaurants:
        context += f"\n{restaurant['name']} ({restaurant['cuisine']}):\n"
        for item in restaurant['menu']:
            context += f"  - {item['item']}: ₹{item['price']}\n"
    return context

# System prompt for the AI
SYSTEM_PROMPT = f"""
You are a friendly voice-based food ordering assistant for an Indian food delivery app.
Your job is to help users order food through natural conversation.

{get_menu_context()}

Rules:
1. Always respond in a friendly, conversational tone
2. Keep responses SHORT and CLEAR — under 2 sentences
3. When user mentions food, suggest specific items from the menu
4. Always mention the price when suggesting items
5. If user is confused suggest popular items
6. At the end of suggestions always ask if they want to add to cart
7. Use Indian currency (₹) for prices
8. Never make up items that are not in the menu

Examples of good responses:
- "I found Margherita Pizza from Domino's for ₹150! Want me to add it to your cart?"
- "You can try McAloo Tikki from McDonald's for ₹50 or Zinger Burger from KFC for ₹120. Which one?"
- "Your cart total is ₹180. Shall I confirm the order?"
"""

async def get_ai_response(user_message: str, cart: list) -> str:
    """Get AI response for user message using Groq"""
    try:
        # Build cart context
        cart_context = ""
        if cart:
            cart_items = ", ".join(
                f"{item['item']} x{item['quantity']}" for item in cart
            )
            total = sum(item['price'] * item['quantity'] for item in cart)
            cart_context = f"\nCurrent cart: {cart_items}. Total: ₹{total}"

        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT + cart_context
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=150,
            temperature=0.7,
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Groq error: {e}")
        return None