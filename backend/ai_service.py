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
9. If order history is provided, use it to make personalized recommendations
10. If cart context is provided, suggest complementary items

Examples of good responses:
- "I found Margherita Pizza from Domino's for ₹150! Want me to add it to your cart?"
- "You can try McAloo Tikki from McDonald's for ₹50 or Zinger Burger from KFC for ₹120. Which one?"
- "Based on your history you love burgers! Try McChicken Burger from McDonald's for ₹80 today?"
- "Your cart total is ₹180. Shall I confirm the order?"
"""

async def get_ai_response(
    user_message: str,
    cart: list,
    order_history: list = None
) -> str:
    """Get AI response for user message using Groq"""
    try:
        # Build cart context
        extra_context = ""
        if cart:
            cart_items = ", ".join(
                f"{item['item']} x{item['quantity']}" for item in cart
            )
            total = sum(item['price'] * item['quantity'] for item in cart)
            extra_context += f"\nCurrent cart: {cart_items}. Total: ₹{total}"

        # Build order history context
        if order_history and len(order_history) > 0:
            history_text = "User's past orders:\n"
            for i, order in enumerate(order_history[:3]):
                items_text = ", ".join(
                    f"{item['item']}" for item in order.get('items', [])
                )
                history_text += f"Order {i+1}: {items_text} (₹{order.get('total', 0)})\n"
            extra_context += f"\n{history_text}"

        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT + extra_context
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


async def get_recommendations(order_history: list) -> str:
    """Get personalized recommendations based on order history"""
    try:
        if not order_history:
            return "Try our popular McAloo Tikki from McDonald's for ₹50 or Margherita Pizza from Domino's for ₹150!"

        # Build history context
        all_items = []
        for order in order_history[:5]:
            for item in order.get('items', []):
                all_items.append(item['item'])

        history_text = ", ".join(all_items)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": f"Based on my past orders: {history_text}, what should I order today? Suggest something from the menu."
                }
            ],
            max_tokens=150,
            temperature=0.7,
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Groq recommendations error: {e}")
        return "Try our popular McAloo Tikki from McDonald's for ₹50!"