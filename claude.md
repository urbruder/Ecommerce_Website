# 🛍️ ShopKart – Complete Developer Reference (`claude.md`)

This document provides a comprehensive breakdown of the **ShopKart** MERN stack e-commerce project, covering the backend API endpoints, database models, helper services, and the architectural workflow of the User and Admin frontend applications.

---

## 🏗️ Project Architecture Overview

ShopKart is structured as a decoupled web application containing three main segments, all fully containerized with Docker:
1. **Backend Server**: Express.js server interacting with MongoDB (via Mongoose) for data storage, Cloudinary for media storage, Stripe for payment processing, and Gmail (via Nodemailer) for emailing. It also features a custom AI Chatbot engine integrating Google's Gemini 2.5 Flash. Containerized using a lightweight Node.js Alpine image.
2. **Frontend Client (Vite + React)**: The main shopping portal where customers can browse, filter, search, manage carts, authentication, profiles, place orders, and chat with an AI assistant. Containerized via multi-stage builds and served with high-performance Nginx with SPA routing support.
3. **Admin Dashboard (Vite + React)**: The management panel for administrators to register inventory, monitor products, and change order processing status. Containerized via multi-stage builds and served with Nginx.

---

## 🔑 Environment Variables Configuration

To run this project successfully, you need the following environment setups:

### Backend Configuration (`/backend/.env`)
```env
PORT=4000
MONGODB_URI=mongodb+srv://...           # MongoDB Atlas Connection URI
JWT_SECRET=your_jwt_secret_key         # Shared JWT secret for User & Admin tokens
ADMIN_EMAIL=admin@shopkart.com         # Admin username credential
ADMIN_PASSWORD=adminpassword           # Admin login password
CLOUDINARY_NAME=your_cloud_name        # Cloudinary cloud name
CLOUDINARY_API_KEY=your_api_key        # Cloudinary API key
CLOUDINARY_SECRET_KEY=your_secret_key  # Cloudinary API secret
STRIPE_SECRET_KEY=sk_test_...          # Stripe Secret Key
EMAIL_USER=your-email@gmail.com        # SMTP Email address for Nodemailer
EMAIL_PASS=your-app-password           # App password generated from Gmail Account
FRONTEND_URL=http://localhost:5173     # Frontend client URL (used for password reset links)
GEMINI_API_KEY=AIzaSy...               # Google Gemini API Key
SIMILARITY_THRESHOLD=0.45              # Chatbot matching threshold (0.0 to 1.0)
```

### Frontend Clients Configuration (`/frontend/.env` and `/admin/.env`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

> [!NOTE]
> In Docker deployments, `.env` files are excluded from images via `.dockerignore` for security. Backend environment variables are supplied at container runtime (via `--env-file` or orchestration configs), while `VITE_*` variables for frontend and admin are baked into static assets during the Vite build step (`npm run build`).

---

## 🐳 Docker Containerization Architecture & Deployment

All three components of ShopKart (Backend, Frontend Client, and Admin Dashboard) are containerized using Docker. The frontend applications utilize multi-stage builds with Nginx for optimal production performance, while the backend utilizes a lightweight Node.js Alpine runtime.

### 📋 Container Overview Matrix

| Service | Directory | Dockerfile | Base Image(s) | Internal Port | Host Port Mapping | Runtime / Web Server |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `/backend` | [backend/Dockerfile](file:///d:/Ecommerce1/backend/Dockerfile) | `node:26-alpine` | `4000` | `4000:4000` | Node.js (`server.js`) |
| **Frontend Client** | `/frontend` | [frontend/Dockerfile](file:///d:/Ecommerce1/frontend/Dockerfile) | `node:20` (build) &rarr; `nginx:alpine` (runtime) | `80` | `5173:80` (or `80:80`) | Nginx (Reverse Proxy & SPA Static Server) |
| **Admin Panel** | `/admin` | [admin/Dockerfile](file:///d:/Ecommerce1/admin/Dockerfile) | `node:20` (build) &rarr; `nginx:alpine` (runtime) | `80` | `5174:80` (or `81:80`) | Nginx (Reverse Proxy & SPA Static Server) |

---

### 1. Backend Service Containerization

- **Dockerfile**: [backend/Dockerfile](file:///d:/Ecommerce1/backend/Dockerfile)
- **Base Image**: `node:26-alpine` (Minimal Alpine Linux distribution to minimize container footprint and attack surface)
- **Deterministic Dependency Installation**: Uses `npm ci` rather than `npm install` for reliable, lockfile-exact builds based on `package-lock.json`.
- **Exposed Port**: `4000`
- **Dockerignore Rules** ([backend/.dockerignore](file:///d:/Ecommerce1/backend/.dockerignore)):
  ```text
  node_modules
  .env
  .git
  ```
  Prevents local `node_modules`, credentials, and Git history from leaking into the container image.
- **Runtime Configuration**: Passes environment variables using `--env-file` or `-e` at container startup.

#### Build & Run Commands:
```bash
# Navigate to backend directory
cd backend

# Build backend image
docker build -t shopkart-backend .

# Run backend container with environment variables
docker run -d \
  --name shopkart-backend \
  -p 4000:4000 \
  --env-file .env \
  shopkart-backend
```

---

### 2. Frontend Client Containerization (Multi-Stage Build)

- **Dockerfile**: [frontend/Dockerfile](file:///d:/Ecommerce1/frontend/Dockerfile)
- **Stage 1 — Build (`node:20 AS build`)**:
  - Sets working directory to `/app`.
  - Installs dependencies with `npm install`.
  - Copies source code and executes `npm run build`, producing production-optimized static bundles in `/app/dist`.
- **Stage 2 — Production Web Server (`nginx:alpine`)**:
  - Copies compiled assets from build stage (`/app/dist`) to `/usr/share/nginx/html`.
  - Replaces default Nginx configuration with [frontend/nginx.conf](file:///d:/Ecommerce1/frontend/nginx.conf) at `/etc/nginx/conf.d/default.conf`.
  - Exposes port `80` and runs Nginx in the foreground (`nginx -g 'daemon off;'`).
- **SPA Fallback Routing**:
  The custom `nginx.conf` implements the `try_files $uri $uri/ /index.html;` rule. This ensures client-side routes managed by React Router (e.g., `/collection`, `/product/:id`, `/cart`, `/orders`, `/profile`) reload smoothly without returning Nginx 404 errors.
- **Dockerignore Rules** ([frontend/.dockerignore](file:///d:/Ecommerce1/frontend/.dockerignore)):
  ```text
  node_modules
  dist
  .git
  ```

#### Build & Run Commands:
```bash
# Navigate to frontend directory
cd frontend

# Build frontend image
docker build -t shopkart-frontend .

# Run container mapping port 5173 on host to port 80 in container
docker run -d \
  --name shopkart-frontend \
  -p 5173:80 \
  shopkart-frontend
```

---

### 3. Admin Panel Containerization (Multi-Stage Build)

- **Dockerfile**: [admin/Dockerfile](file:///d:/Ecommerce1/admin/Dockerfile)
- **Stage 1 — Build (`node:20 AS build`)**:
  - Sets working directory to `/app`.
  - Installs dependencies with `npm install`.
  - Copies source files and runs `npm run build`, outputting compiled assets into `/app/dist`.
- **Stage 2 — Production Web Server (`nginx:alpine`)**:
  - Copies `/app/dist` to `/usr/share/nginx/html`.
  - Copies custom [admin/nginx.conf](file:///d:/Ecommerce1/admin/nginx.conf) to `/etc/nginx/conf.d/default.conf`.
  - Exposes port `80` with `daemon off;` execution.
- **SPA Fallback Routing**:
  Implements `try_files $uri $uri/ /index.html;` so navigation and refreshes on admin routes (`/add`, `/list`, `/orders`) resolve correctly to `index.html`.
- **Dockerignore Rules** ([admin/.dockerignore](file:///d:/Ecommerce1/admin/.dockerignore)):
  ```text
  node_modules
  dist
  .git
  ```

#### Build & Run Commands:
```bash
# Navigate to admin directory
cd admin

# Build admin image
docker build -t shopkart-admin .

# Run container mapping port 5174 on host to port 80 in container
docker run -d \
  --name shopkart-admin \
  -p 5174:80 \
  shopkart-admin
```

---

### 4. Full-Stack Docker Compose Orchestration (Reference)

To spin up all three services concurrently in an isolated bridge network, create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: shopkart-backend
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env
    restart: unless-stopped
    networks:
      - shopkart-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: shopkart-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - shopkart-net

  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile
    container_name: shopkart-admin
    ports:
      - "5174:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - shopkart-net

networks:
  shopkart-net:
    driver: bridge
```

#### Compose Commands:
```bash
# Build images and start all containers in background
docker compose up -d --build

# Monitor live logs across all containers
docker compose logs -f

# Stop and tear down containers and networks
docker compose down
```

---

### ⚠️ Critical Containerization & Deployment Best Practices

1. **Vite Build-Time Environment Baking**:
   Vite statically replaces variables prefixed with `VITE_` (such as `VITE_BACKEND_URL`) during the `npm run build` execution phase inside the Docker build container. Make sure the target backend URL (e.g. `http://localhost:4000` or production domain) is set in `/frontend/.env` and `/admin/.env` before building the images.
2. **Nginx Client-Side Routing**:
   Both frontend and admin applications are Single Page Applications using HTML5 pushState routing. The Nginx directive `try_files $uri $uri/ /index.html;` is mandatory to avoid HTTP 404 errors when users refresh deep URLs.
3. **Multi-Stage Build Efficiency**:
   Separating the build stage (`node:20`) from the runtime stage (`nginx:alpine`) ensures development dependencies, source code, and the Node runtime are stripped from final images. This drops the production image size to ~25–35MB.
4. **Credential Isolation**:
   The `.dockerignore` files prevent local `.env` files from entering the Docker build context or being embedded inside layers, keeping API keys, Stripe secrets, and JWT tokens protected.

---

## 🗃️ Database Schemas & Models (MongoDB)

### 1. User Model ([userModel.js](file:///d:/Ecommerce1/backend/models/userModel.js))
Stores customer account details, shopping cart state, and billing/shipping addresses.
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `cartData` (Object, default: `{}`) - Structure: `{ [productId]: { [size]: quantity } }`
- `address` (Object) - Contains default shipping details:
  - `firstName`, `lastName`, `street`, `city`, `state`, `zipcode`, `country`, `phone`

### 2. Product Model ([productModel.js](file:///d:/Ecommerce1/backend/models/productModel.js))
Stores item details uploaded by administrators.
- `name` (String, required)
- `description` (String, required)
- `price` (Number, required)
- `image` (Array, required) - Secure URLs pointing to Cloudinary assets
- `category` (String, required) - e.g., "Men", "Women", "Kids"
- `subCategory` (String, required) - e.g., "Topwear", "Bottomwear", "Winterwear"
- `sizes` (Array, required) - e.g., `["S", "M", "L"]`
- `bestseller` (Boolean)
- `date` (Number, required) - Unix timestamp of creation

### 3. Order Model ([orderModel.js](file:///d:/Ecommerce1/backend/models/orderModel.js))
Tracks customer purchases and shipment states.
- `userId` (String, required)
- `items` (Array, required) - List of products purchased with quantities and sizes
- `amount` (Number, required) - Total invoice cost
- `address` (Object, required) - Target shipping address details
- `status` (String, required, default: `"Order Placed"`) - States: `"Order Placed"`, `"Packing"`, `"Shipped"`, `"Out for delivery"`, `"Delivered"`
- `paymentMethod` (String, required) - e.g., `"COD"`, `"Stripe"`
- `payment` (Boolean, required, default: `false`) - Payment completion state
- `date` (Number, required) - Transaction timestamp

---

## 🛡️ Backend Middlewares

- **User Authentication (`auth.js`)**:
  Intercepts requests on protected endpoints. Checks for the `token` in headers, decodes it using `jwt.verify()`, and appends the user ID to the request body as `req.body.userId` for downstream handlers.
- **Admin Authentication (`adminAuth.js`)**:
  Protects administration endpoints. Expects an `Authorization` header with a `Bearer <token>` format. Decodes the token using the system `JWT_SECRET` and checks that the payload email matches `ADMIN_EMAIL`.
- **File Upload Handler (`multer.js`)**:
  Configures disk storage configuration to allow incoming multipart file uploads to be parsed and temporarily stored prior to Cloudinary transmission.

---

## 📡 API Endpoint Documentation

### 👤 User Endpoints (`/api/user/*` mapped to [userRoute.js](file:///d:/Ecommerce1/backend/routes/userRoute.js))

#### 1. Register User
- **Endpoint**: `POST /api/user/register`
- **Authentication**: None
- **Payload**: `{ "name": "...", "email": "...", "password": "..." }`
- **Functionality**: Validates email format, verifies password strength (minimum 8 characters), checks for pre-existing accounts, hashes the password using `bcrypt`, saves the user, and generates a JWT.
- **Response**: `{ "success": true, "token": "JWT_TOKEN" }`

#### 2. User Login
- **Endpoint**: `POST /api/user/login`
- **Authentication**: None
- **Payload**: `{ "email": "...", "password": "..." }`
- **Functionality**: Finds the user, compares passwords using `bcrypt.compare`, and returns a JWT on success.
- **Response**: `{ "success": true, "token": "JWT_TOKEN" }`

#### 3. Request Password Reset Link
- **Endpoint**: `POST /api/user/forgot-password`
- **Authentication**: None
- **Payload**: `{ "email": "..." }`
- **Functionality**: Generates a short-lived token (10 minutes) and sends a reset link to the user's email address via Nodemailer.
- **Response**: `{ "success": true }`

#### 4. Update Password
- **Endpoint**: `POST /api/user/reset-password`
- **Authentication**: None (Requires the JWT from the reset email link)
- **Payload**: `{ "password": "NEW_PASSWORD", "token": "RESET_TOKEN" }`
- **Functionality**: Decodes and verifies the token, hashes the new password, updates the user entry in the DB.
- **Response**: `{ "success": true, "message": "Password reset successful" }`

#### 5. Fetch Profile Details
- **Endpoint**: `POST /api/user/profile`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{}`
- **Functionality**: Returns user profile name, email, and address, omitting sensitive data (password, cart cache).
- **Response**: `{ "success": true, "name": "...", "email": "...", "address": { ... } }`

#### 6. Update Profile Details
- **Endpoint**: `POST /api/user/update-profile`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "name": "...", "address": { ... } }`
- **Functionality**: Modifies user details, including physical mailing/shipping details.
- **Response**: `{ "success": true, "message": "Profile updated successfully" }`

---

### 📦 Product Endpoints (`/api/product/*` mapped to [productRoute.js](file:///d:/Ecommerce1/backend/routes/productRoute.js))

#### 1. Add Product
- **Endpoint**: `POST /api/product/add`
- **Authentication**: Admin Token (Header: `Authorization: Bearer <token>`)
- **Payload**: `multipart/form-data` with files `image1, image2, image3, image4` (optional) and fields: `{ "name": "...", "description": "...", "price": "...", "category": "...", "subCategory": "...", "sizes": "[\"S\",\"M\"]", "bestseller": "true" }`
- **Functionality**: Uploads images to Cloudinary, parses size and bestseller inputs, and saves the new product.
- **Response**: `{ "success": true, "message": "Product added" }`

#### 2. Delete Product
- **Endpoint**: `POST /api/product/remove`
- **Authentication**: Admin Token (Header: `Authorization: Bearer <token>`)
- **Payload**: `{ "id": "PRODUCT_ID" }`
- **Functionality**: Deletes a product by ID from MongoDB.
- **Response**: `{ "success": true, "message": "Product Removed" }`

#### 3. Single Product Information
- **Endpoint**: `POST /api/product/single`
- **Authentication**: None
- **Payload**: `{ "productId": "PRODUCT_ID" }`
- **Response**: `{ "success": true, "product": { ... } }`

#### 4. List All Products
- **Endpoint**: `GET /api/product/list`
- **Authentication**: None
- **Response**: `{ "success": true, "products": [...] }`

---

### 🛒 Cart Endpoints (`/api/cart/*` mapped to [cartRoute.js](file:///d:/Ecommerce1/backend/routes/cartRoute.js))

#### 1. Retrieve User Cart
- **Endpoint**: `POST /api/cart/get`
- **Authentication**: User Token (Header: `token`)
- **Response**: `{ "success": true, "cartData": { "productId": { "size": quantity } } }`

#### 2. Add Item to Cart
- **Endpoint**: `POST /api/cart/add`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "itemId": "PRODUCT_ID", "size": "S/M/L/..." }`
- **Response**: `{ "succes": true, "message": "Added To Cart" }`

#### 3. Update Cart Quantities
- **Endpoint**: `POST /api/cart/update`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "itemId": "PRODUCT_ID", "size": "S", "quantity": 0/1/2... }`
- **Response**: `{ "succes": true, "message": "Updated The Cart" }`

---

### 💳 Order Endpoints (`/api/order/*` mapped to [orderRoute.js](file:///d:/Ecommerce1/backend/routes/orderRoute.js))

#### 1. Place Order via COD
- **Endpoint**: `POST /api/order/place`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "items": [...], "amount": 120, "address": { ... } }`
- **Functionality**: Creates order in DB with `paymentMethod: "COD"`, marks `payment: false`, and empties the user's database cart.
- **Response**: `{ "success": true, "message": "Order Placed" }`

#### 2. Place Order via Stripe (Session Creation)
- **Endpoint**: `POST /api/order/stripe`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "items": [...], "amount": 120, "address": { ... } }`
- **Functionality**: Creates order in DB, builds Stripe line items (attaching delivery charges), generates a Stripe checkout session, and returns redirect URL.
- **Response**: `{ "success": true, "session_url": "STRIPE_CHECKOUT_URL" }`

#### 3. Verify Stripe Payment State
- **Endpoint**: `POST /api/order/verifyStripe`
- **Authentication**: User Token (Header: `token`)
- **Payload**: `{ "success": "true"/"false", "orderId": "ORDER_ID" }`
- **Functionality**: Updates order `payment` to `true` and clears the cart if verification succeeds.
- **Response**: `{ "success": true, "message": "Order Placed" }`

#### 4. Fetch Customer Purchases
- **Endpoint**: `POST /api/order/userOrders`
- **Authentication**: User Token (Header: `token`)
- **Response**: `{ "success": true, "orders": [...] }`

#### 5. List All System Orders (Admin Only)
- **Endpoint**: `POST /api/order/list`
- **Authentication**: Admin Token (Header: `Authorization: Bearer <token>`)
- **Response**: `{ "success": true, "orders": [...] }`

#### 6. Update Order Status (Admin Only)
- **Endpoint**: `POST /api/order/status`
- **Authentication**: Admin Token (Header: `Authorization: Bearer <token>`)
- **Payload**: `{ "orderId": "ORDER_ID", "status": "Shipped" }`
- **Response**: `{ "success": true, "message": "Status Updated" }`

---

### 🤖 Chatbot Endpoints (`/api/chat/*` mapped to [chatbotRoute.js](file:///d:/Ecommerce1/backend/routes/chatbotRoute.js))

#### 1. Send Message to AI Assistant
- **Endpoint**: `POST /api/chat`
- **Authentication**: None
- **Payload**: `{ "message": "Do you have size charts?", "conversationHistory": [...] }`
- **Functionality**: Orchestrates the similarity search against loaded FAQs, falls back to Gemini if needed, and returns the response.
- **Response**:
```json
{
  "source": "faq" | "gemini",
  "confidence": 0.85,
  "answer": "Answer details..."
}
```

---

## 🛠️ Backend Services & Utilities

### 1. FAQ Service ([faqService.js](file:///d:/Ecommerce1/backend/services/faqService.js))
Loads 500+ questions and answers from [faq.json](file:///d:/Ecommerce1/backend/data/faq.json) into server memory during startup. This in-memory structure ensures immediate similarity lookup without disk-read overhead.

### 2. Similarity Service & Score Calculator ([similarityService.js](file:///d:/Ecommerce1/backend/services/similarityService.js) & [scoreCalculator.js](file:///d:/Ecommerce1/backend/utils/scoreCalculator.js))
Implements string similarity algorithms to match queries against FAQs:
1. **Normalizer**: Converts text to lowercase, removes punctuation, and trims excess whitespaces.
2. **Tokenizer**: Splits words into arrays, removing short words and matching against a predefined stop-words set.
3. **Similarity Algorithms**:
   - **Jaccard Similarity**: Evaluates intersection size over union size.
   - **Overlap Score**: Evaluates user query coverage percentage.
   - **Substring Score**: Detects character alignment matches to capture partial roots (like "return" vs "returns").
4. **Weighted Blend**: Combined Score = $(0.3 \times \text{Jaccard}) + (0.35 \times \text{Overlap}) + (0.35 \times \text{Substring})$. Matches above the threshold (default: `0.45`) return the FAQ answer.

### 3. Gemini Fallback Integration ([geminiService.js](file:///d:/Ecommerce1/backend/services/geminiService.js))
Runs if query score falls below threshold. 
- Employs HTTP fetch request directly to Google Gemini's REST API endpoint (no heavy packages/SDKs).
- Gathers top 3 closest FAQ elements and conversation history, injects them into the Gemini System Prompt, and requests an answer limited to 150 words.

### 4. Nodemailer E-Mail Transmitter ([sendEmail.js](file:///d:/Ecommerce1/backend/utils/sendEmail.js))
Sets up Nodemailer SMTP using the Gmail service config. Utilized to email password recovery links containing short-lived tokens to the users.

---

## 💻 Frontend Client Application (Vite + React)

### 📌 Core State Management ([ShopContext.jsx](file:///d:/Ecommerce1/frontend/src/context/ShopContext.jsx))
Using the React Context API, `ShopContext` acts as the central hub:
- **Product Catalog (`products`)**: Synchronized with `GET /api/product/list`.
- **User Profile (`userProfile`)**: Stores active customer settings.
- **Cart Sync (`cartItems`)**: Implements client-side deep cloning with `structuredClone()`. Synchronizes changes to MongoDB cart database if user is authenticated, otherwise persists items in state.
- **Search System (`search`, `showSearch`)**: Global states enabling full catalog query searching.

### 📄 Pages & Routes
- **Home (`/`)**: Introduces trending garments, best sellers, and delivery guarantees.
- **Collection (`/collection`)**: Interactive sidebar to filter items by category (Men, Women, Kids), clothing types (Topwear, Bottomwear, Winterwear), and sort by price (Low to High, High to Low).
- **Product Details (`/product/:productId`)**: Details description, size option picker, product photo carousel, and similar product recommendation widgets.
- **Cart (`/cart`)**: Detailed item layout matching quantities, with live totals calculated from `ShopContext`.
- **PlaceOrder (`/place-order`)**: Shipping forms, cart totals breakdown, and payment gateways selection.
- **Orders (`/orders`)**: Customer purchasing records, payment confirmation badges, status updates, and return request interfaces.
- **Authentication**:
  - Login/Register (`/login`)
  - Forgot Password (`/forgot-password`)
  - Password Update (`/reset-password/:token`)
- **Verify (`/verify`)**: Validates checkout callbacks. Intercepts redirect queries `success` and `orderId`, makes a verification request to `/api/order/verifyStripe`, and redirects users to `/orders`.
- **Profile (`/profile`)**: Modifies user profile and default addresses.

### 🤖 Conversational AI Chatbot Widget ([ChatBot.jsx](file:///d:/Ecommerce1/frontend/src/components/ChatBot/ChatBot.jsx))
Sliding chat drawer located at the bottom-right corner of the client page:
- **Interactive Component**: Contains quick actions buttons (e.g. "Sizing Guide", "Track Order", "Return Policy"), visual bubble chats, custom typing placeholders, and product carousels.
- **Hybrid Service Pipeline**: Sends queries to `/api/chat`. If backend responds, it maps the AI answers. It also performs concurrent client-side regex matching to highlight appropriate products directly in the chat UI.
- **Offline Fallback**: If the server API is offline, it executes local Javascript rules ([chatbotLogic.js](file:///d:/Ecommerce1/frontend/src/components/ChatBot/chatbotLogic.js)) matching keywords to show pre-saved store rules (e.g., standard sizing lists, direct orders tracking redirection, return policy summaries).

---

## 🛡️ Admin Dashboard (Vite + React)

A separate application built specifically for store operators:

### 🔑 Authentication Flow
Uses a custom authentication state. Checks `ADMIN_EMAIL` and `ADMIN_PASSWORD` credentials through backend `/api/user/admin`. Token is stored in `localStorage` and verified via `GET /api/admin/verify` on refresh.

### 📄 Pages & Functionality
- **Add Product (`/add`)**: Provides file selection inputs for 4 images, product title, description, pricing fields, dropdown selector for Category/Subcategory, size checkbox arrays, and bestseller checkbox flag.
- **List Products (`/list`)**: Renders all catalog items. Includes a button to delete products from inventory.
- **Manage Orders (`/orders`)**: Displays all client orders. Administrators can view item listings, addresses, transaction modes, payment states, and update fulfillment status via dropdowns (e.g. `Order Placed` -> `Packing` -> `Shipped` -> `Out for delivery` -> `Delivered`).
