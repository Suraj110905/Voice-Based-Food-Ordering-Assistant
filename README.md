# 🎤 Voice-Based Food Ordering Assistant

> An AI-powered voice food ordering assistant built with React + Python FastAPI + MongoDB + Groq AI (LLaMA 3.1)

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-18.x-blue)
![Python](https://img.shields.io/badge/Python-3.12-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0.5-green)
![Groq](https://img.shields.io/badge/Groq-LLaMA3.1-purple)

---

## 📖 TABLE OF CONTENTS

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Project Structure](#-project-structure)
6. [API Reference](#-api-reference)
7. [Component Guide](#-component-guide)
8. [Database Schema](#-database-schema)
9. [AI Integration](#-ai-integration)
10. [Voice Commands](#-voice-commands)
11. [How to Run](#-how-to-run)
12. [Common Issues](#-common-issues)
13. [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

Voice-Based Food Ordering Assistant is a full-stack AI-powered application that allows users to order food using natural voice commands or text input. The app understands natural language, suggests restaurants, manages a cart, saves order history, and provides personalized AI recommendations — all through a conversational interface.

### 💡 Example Conversation Flow:
```
User  → "Hey, I'm hungry. I want a burger!"
App   → "I found burgers at McDonald's and KFC! Which restaurant do you prefer?"
User  → "McDonald's"
App   → "Added McAloo Tikki from McDonald's! Want fries too?"
User  → "Yes add fries"
App   → "Added French Fries! Your total is ₹90. Shall I confirm the order?"
User  → "Confirm"
App   → "🎉 Order placed! Total ₹120 including delivery. Food is on the way!"
```

---

## ✨ Features

### 🟢 Basic Features
| Feature | Description |
|---------|-------------|
| 🎤 Voice Input | Speak orders using Web Speech API |
| ⌨️ Text Input | Type orders as fallback |
| 🔊 Voice Response | App speaks back using Speech Synthesis |
| 🍔 Restaurant Cards | Shows food options as beautiful cards |
| 🛒 Cart System | Add, remove and manage cart items |
| 💰 Bill Calculation | Subtotal + delivery fee calculation |
| ✅ Order Confirmation | Beautiful confirmation screen |

### 🟡 Intermediate Features
| Feature | Description |
|---------|-------------|
| 🗄️ MongoDB Storage | All orders saved permanently |
| 📜 Order History | View all past orders with timestamps |
| ❤️ Favorites System | Save and reorder favorite items |
| 🧠 Multi-Step Conversations | App remembers conversation context |
| 🗣️ "Order My Usual" | Voice command to reorder favorites |
| 🎨 Animations | Smooth fade-in, slide-in effects |

### 🔴 Advanced Features
| Feature | Description |
|---------|-------------|
| 🤖 Groq AI (LLaMA 3.1) | Natural language understanding |
| ⭐ Smart Recommendations | AI suggestions based on order history |
| 🍔 Combo Suggestions | AI suggests complementary items |
| 🔍 Search | Search by food item or restaurant |
| 📊 Statistics Dashboard | Order analytics and insights |
| 📱 Mobile Responsive | Works on all screen sizes |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Axios | HTTP requests to backend |
| React Icons | Icon library |
| React Hot Toast | Notification popups |
| Web Speech API | Voice input (browser built-in) |
| Speech Synthesis API | Voice output (browser built-in) |
| CSS Animations | Smooth UI transitions |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.12 | Backend language |
| FastAPI | Modern async web framework |
| Uvicorn | ASGI server |
| Motor | Async MongoDB driver |
| Groq SDK | AI language model API |
| python-dotenv | Environment variable management |
| Pydantic | Data validation |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB 8.0.5 | NoSQL database |
| Collections: orders | Placed orders |
| Collections: favorites | Saved favorite items |
| Collections: history | Complete order history |

### AI
| Technology | Purpose |
|-----------|---------|
| Groq API | Fast AI inference |
| LLaMA 3.1 8B Instant | Language model |
| Custom System Prompt | Food ordering context |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│                  React Frontend                          │
│         (localhost:3000)                                 │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Voice   │ │  Search  │ │Favorites │ │ History  │  │
│  │  Input   │ │   Bar    │ │  System  │ │   Page   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Cart   │ │  Order   │ │  Stats   │ │  Recom-  │  │
│  │  System  │ │ Confirm  │ │Dashboard │ │mendation │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/REST (Axios)
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND                         │
│               (localhost:8000)                           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  routes.py                        │  │
│  │                                                   │  │
│  │  /order/process  → Main voice order handler       │  │
│  │  /ai/chat        → AI-powered chat endpoint       │  │
│  │  /cart           → Cart management                │  │
│  │  /cart/add       → Add specific item              │  │
│  │  /cart/clear     → Clear cart                     │  │
│  │  /favorites      → Favorites CRUD                 │  │
│  │  /orders/history → Past orders                    │  │
│  │  /search         → Search food/restaurants        │  │
│  │  /stats          → Order statistics               │  │
│  │  /recommendations→ AI recommendations             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │  data.py    │    │ai_service.py│                    │
│  │             │    │             │                    │
│  │ Restaurants │    │ Groq API    │                    │
│  │ Menu Items  │    │ LLaMA 3.1   │                    │
│  │ Keywords    │    │ Prompts     │                    │
│  └─────────────┘    └─────────────┘                    │
└──────────────┬──────────────────┬───────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────┐   ┌──────────────────────────────────┐
│   MongoDB        │   │         Groq API                  │
│   (port 27017)   │   │   (api.groq.com)                  │
│                  │   │                                   │
│  ┌────────────┐  │   │  Model: llama-3.1-8b-instant      │
│  │  orders    │  │   │  Fast AI inference                │
│  ├────────────┤  │   │  Free tier available              │
│  │ favorites  │  │   └──────────────────────────────────┘
│  ├────────────┤  │
│  │  history   │  │
│  └────────────┘  │
└──────────────────┘
```

---

## 📁 Project Structure

```
Voice-Based Food Ordering Assistant/
│
├── 📁 frontend/                          # React Application
│   ├── 📁 public/
│   │   └── index.html
│   └── 📁 src/
│       ├── 📁 components/
│       │   ├── 🎤 VoiceInput.js          # Mic button + voice recognition
│       │   ├── 🏠 Header.js              # Top navigation bar
│       │   ├── 🍔 RestaurantList.js      # Food option cards
│       │   ├── 🛒 Cart.js                # Cart with AI combo suggestions
│       │   ├── ✅ OrderConfirm.js        # Order success screen
│       │   ├── 📜 OrderHistory.js        # Past orders page
│       │   ├── ❤️  Favorites.js          # Saved favorites page
│       │   ├── ⭐ Recommendations.js     # AI recommendations card
│       │   ├── 🔍 SearchBar.js           # Search food/restaurants
│       │   └── 📊 Statistics.js          # Order analytics dashboard
│       ├── 📄 App.js                     # Main app + tab navigation
│       ├── 📄 App.css                    # App styles
│       └── 📄 index.css                  # Global styles + animations
│
├── 📁 backend/                           # FastAPI Application
│   ├── 📁 venv/                          # Python virtual environment
│   ├── 🐍 main.py                        # FastAPI app + MongoDB connection
│   ├── 🐍 routes.py                      # All API endpoints
│   ├── 🐍 data.py                        # Restaurant & menu data
│   ├── 🐍 database.py                    # MongoDB collections setup
│   ├── 🐍 ai_service.py                  # Groq AI integration
│   ├── 🔒 .env                           # API keys (never commit!)
│   └── 📄 requirements.txt               # Python dependencies
│
└── 📄 README.md                          # This file
```

---

## 🔌 API Reference

### Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order/process` | Process voice/text order message |
| POST | `/ai/chat` | AI-powered natural language chat |

### Cart Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get current cart items and total |
| POST | `/cart/add` | Add specific item to cart |
| DELETE | `/cart/clear` | Clear all cart items |
| GET | `/cart/combo-suggestion` | Get AI combo suggestion |

### Favorites Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | Get all favorite items |
| POST | `/favorites/add` | Add item to favorites |
| DELETE | `/favorites/{item_name}` | Remove from favorites |
| POST | `/favorites/order-usual` | Add all favorites to cart |

### History & Stats Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/history` | Get all past orders |
| GET | `/stats` | Get order statistics |
| GET | `/recommendations` | Get AI food recommendations |
| GET | `/search?q={query}` | Search food items/restaurants |
| GET | `/restaurants` | Get all restaurants |

### Example Request & Response

**POST /ai/chat**
```json
Request:
{
  "message": "I want a burger"
}

Response:
{
  "response": "Great choice! I found McAloo Tikki from McDonald's for ₹50 and Zinger Burger from KFC for ₹120. Which one would you like?",
  "cart": [...],
  "options": [...],
  "total": 50
}
```

---

## 🧩 Component Guide

### 🎤 VoiceInput.js
**Purpose:** Handles all voice and text input from user

**Key Functions:**
| Function | Description |
|----------|-------------|
| `startListening()` | Starts Web Speech API microphone |
| `stopListening()` | Stops microphone using useRef |
| `sendToBackend(message)` | Sends message to `/ai/chat` endpoint |
| `speakResponse(text)` | Converts text to speech using Speech Synthesis |
| `handleTypedSubmit()` | Handles text input form submission |

**State Variables:**
| State | Type | Description |
|-------|------|-------------|
| `isListening` | boolean | Whether mic is active |
| `transcript` | string | What user said |
| `response` | string | App's response |
| `loading` | boolean | API call in progress |
| `typedMessage` | string | Text input value |

---

### 🛒 Cart.js
**Purpose:** Displays cart items, total bill and AI combo suggestions

**Key Functions:**
| Function | Description |
|----------|-------------|
| `clearCart()` | Calls DELETE /cart/clear |
| `fetchComboSuggestion()` | Gets AI combo from /cart/combo-suggestion |

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `cart` | array | List of cart items |
| `total` | number | Cart subtotal |
| `onCartUpdate` | function | Callback to refresh cart |

---

### 🍔 RestaurantList.js
**Purpose:** Shows food option cards when user asks for a food item

**Key Functions:**
| Function | Description |
|----------|-------------|
| `addToCart(option)` | Calls POST /cart/add with exact item |
| `addToFavorites(option)` | Calls POST /favorites/add |

---

### ⭐ Recommendations.js
**Purpose:** Shows AI-powered food recommendations based on order history

**Key Functions:**
| Function | Description |
|----------|-------------|
| `fetchRecommendations()` | Calls GET /recommendations |

---

### 📊 Statistics.js
**Purpose:** Shows order analytics dashboard

**Displays:**
- Total orders placed
- Total amount spent
- Favourite food item
- Top restaurant
- Most ordered items list
- Average order value

---

## 🗄️ Database Schema

### orders Collection
```json
{
  "items": [
    {
      "item": "McAloo Tikki",
      "restaurant": "McDonald's",
      "price": 50,
      "quantity": 2
    }
  ],
  "total": 100,
  "status": "placed",
  "timestamp": "2026-04-01T21:56:51.058370"
}
```

### favorites Collection
```json
{
  "item": "Zinger Burger",
  "restaurant": "KFC",
  "price": 120
}
```

### history Collection
```json
{
  "items": [...],
  "total": 180,
  "status": "placed",
  "timestamp": "2026-04-01T21:56:51.058370"
}
```

---

## 🤖 AI Integration

### How Groq AI Works in This App

```
User Message
     │
     ▼
┌─────────────────────────────────────┐
│         ai_service.py               │
│                                     │
│  1. Load order history (last 3)     │
│  2. Build cart context              │
│  3. Add menu context to prompt      │
│  4. Send to Groq LLaMA 3.1         │
│  5. Return natural response         │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│         routes.py                   │
│                                     │
│  1. Get AI response                 │
│  2. Also run keyword matching       │
│  3. Update cart if needed           │
│  4. Return AI response + cart data  │
└─────────────────────────────────────┘
```

### System Prompt Structure
```
Role: Friendly food ordering assistant
Context: Full menu with prices
Rules:
  - Short responses (under 2 sentences)
  - Always mention prices
  - Suggest items from menu only
  - Ask to add to cart
  - Use ₹ for prices
Dynamic Context Added:
  - Current cart items
  - Past 3 orders (for personalization)
```

### AI Features
| Feature | Endpoint | Model Used |
|---------|----------|-----------|
| Natural chat | `/ai/chat` | llama-3.1-8b-instant |
| Recommendations | `/recommendations` | llama-3.1-8b-instant |
| Combo suggestions | `/cart/combo-suggestion` | llama-3.1-8b-instant |

---

## 🎤 Voice Commands

| Command | What Happens |
|---------|-------------|
| `"I want a burger"` | Shows all burger options |
| `"I want pizza"` | Shows all pizza options |
| `"Add Zinger Burger"` | Adds exact item to cart |
| `"Show my cart"` | Reads out cart summary |
| `"What's my total"` | Tells current bill |
| `"Order my usual"` | Adds all favorites to cart |
| `"Confirm order"` | Places the order |
| `"Clear cart"` | Empties the cart |
| `"Surprise me"` | AI suggests random item |
| `"I'm hungry"` | AI suggests popular items |
| `"What's good here?"` | AI recommends items |

---

## 🚀 How to Run

### Prerequisites
| Tool | Version | Check Command |
|------|---------|--------------|
| Node.js | v22+ | `node -v` |
| Python | 3.12+ | `python --version` |
| MongoDB | 8.0+ | `mongod --version` |
| Git | Any | `git --version` |

### Environment Setup

Create `backend/.env` file:
```
OPENAI_API_KEY=sk-xxxx        # Optional
GROQ_API_KEY=gsk_xxxx         # Required - get free at console.groq.com
```

### Running the Project

You need **3 terminals** running simultaneously:

**Terminal 1 — MongoDB:**
```bash
mongod
```
✅ Wait for: `Waiting for connections on port 27017`

**Terminal 2 — FastAPI Backend:**
```bash
cd "Voice-Based Food Ordering Assistant"
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
uvicorn main:app --reload
```
✅ Wait for: `MongoDB connected successfully!`

**Terminal 3 — React Frontend:**
```bash
cd "Voice-Based Food Ordering Assistant"
cd frontend
npm start
```
✅ Wait for: Browser opens at `http://localhost:3000`

### Useful URLs
| Service | URL |
|---------|-----|
| React App | http://localhost:3000 |
| FastAPI Backend | http://127.0.0.1:8000 |
| API Docs (Swagger) | http://127.0.0.1:8000/docs |
| Cart API | http://127.0.0.1:8000/cart |
| Order History | http://127.0.0.1:8000/orders/history |
| Statistics | http://127.0.0.1:8000/stats |

---

## 🐛 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `mongod` not recognized | MongoDB not in PATH | Add `C:\Program Files\MongoDB\Server\8.0\bin` to PATH |
| `(venv)` not showing | Virtual env not activated | Run `venv\Scripts\activate` in backend folder |
| Blank white screen | Empty component file | Check file contents with `dir` command |
| Voice not working | Wrong browser | Use Google Chrome only |
| CORS error | Backend not running | Start uvicorn server first |
| Groq 400 error | Wrong model name | Use `llama-3.1-8b-instant` |
| `await` outside function | Non-async function | Add `async` keyword to function |
| Git push rejected | Remote has new commits | Run `git pull origin main --allow-unrelated-histories` |
| LF/CRLF warnings | Windows line endings | Run `git config --global core.autocrlf true` |

---

## 🔮 Future Improvements

### Phase 4 — Integrations (Planned)
- [ ] Google Assistant integration
- [ ] Amazon Alexa Skill
- [ ] Real restaurant APIs (Zomato/Swiggy)
- [ ] Payment gateway integration
- [ ] User authentication (login/signup)
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Multi-language support (Hindi, etc.)

### Phase 5 — Advanced AI (Planned)
- [ ] Personalized ML model trained on user data
- [ ] Image recognition for food
- [ ] Dietary preference filtering
- [ ] Price comparison across restaurants
- [ ] Smart reorder based on time of day

---

## 👨‍💻 Developer

**Suraj** — CSE + Data Analytics Student

- GitHub: [github.com/Suraj110905](https://github.com/Suraj110905)
- Project: [Voice-Based-Food-Ordering-Assistant](https://github.com/Suraj110905/Voice-Based-Food-Ordering-Assistant)

---

## 📄 License

This project is open source and available under the MIT License.

---

*Built with ❤️ using React + Python FastAPI + MongoDB + Groq AI*