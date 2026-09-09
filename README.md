# 🛍️ ShopKart – Modern Full-Stack E-Commerce & AI Assistant

ShopKart is a modern, full-stack MERN e-commerce web application featuring a customer storefront, a comprehensive administrative management dashboard, and an integrated **AI-powered shopping assistant** powered by Google Gemini and an in-memory FAQ similarity search engine.

The entire application is **fully containerized with Docker** and can be launched locally or deployed to production with a single command via [docker-compose.yml](file:///d:/Ecommerce1/docker-compose.yml).

---

## 🌐 Live Deployments

- **Customer Storefront**: [https://ecommerce-website-lake-three-10.vercel.app/](https://ecommerce-website-lake-three-10.vercel.app/)
- **Admin Dashboard**: [https://shopkart-admin.vercel.app/](https://shopkart-admin.vercel.app/)
- **Backend API Server**: [https://shopkart-backend-qur5.onrender.com](https://shopkart-backend-qur5.onrender.com)

---

## ✨ Features Breakdown

### 🛒 Customer Storefront ([frontend](file:///d:/Ecommerce1/frontend))
- **Dynamic Homepage**: Hero banners, latest collection showcases, bestseller carousels, and policy highlights (Free Shipping, Return Policy, Customer Support).
- **Advanced Catalog & Filters**:
  - Filter by Category (*Men*, *Women*, *Kids*).
  - Filter by Sub-Category (*Topwear*, *Bottomwear*, *Winterwear*).
  - Real-time catalog search bar with instant query matching.
  - Multi-tier sorting (*Relevant*, *Price: Low to High*, *Price: High to Low*).
- **Product Details**:
  - High-resolution multi-image gallery preview.
  - Dynamic size selector (`S`, `M`, `L`, `XL`, `XXL`).
  - Related product recommendations based on category and sub-category.
- **Cart & Checkout Experience**:
  - Persistent shopping cart (synced with MongoDB for authenticated users).
  - Size-specific item quantity adjustment and item removal.
  - Real-time order summary calculation including dynamic delivery fees.
- **Secure Payments**:
  - **Stripe Checkout**: Redirects to secure Stripe-hosted payment session with auto-verification callback (`/verify`).
  - **Cash on Delivery (COD)**: Instant checkout without online payment prerequisites.
- **Order Management & Tracking**:
  - View historical and active orders with itemized product previews, sizes, and shipping addresses.
  - Live fulfillment tracking badges (*Order Placed*, *Packing*, *Shipped*, *Out for delivery*, *Delivered*).

---

### 🤖 AI Shopping Assistant Widget ([ChatBot](file:///d:/Ecommerce1/frontend/src/components/ChatBot/ChatBot.jsx))
- **Hybrid Intelligence Architecture**:
  - **In-Memory FAQ Engine**: 500+ pre-indexed Q&As evaluated with weighted similarity algorithms (Jaccard Similarity + Overlap Score + Substring Matching) for zero-latency responses.
  - **Google Gemini 2.5 Flash Fallback**: Unmatched user queries are seamlessly escalated to Google Gemini with context-aware prompt injection and conversational history.
  - **In-Chat Product Cards**: Dynamically recognizes queries like *"Show me winter jackets"* and renders clickable, interactive product preview cards directly inside the chat drawer.
  - **Quick Action Buttons**: Sizing Guides, Order Tracking redirections, and Return Policies with 1-click prompts.
  - **Offline Fallback Engine**: Local rule-based keyword engine ensures the chatbot continues functioning even when the backend API is unreachable.

---

### 👤 User Account & Authentication
- **Secure Authentication**: Register and Login with salted `bcrypt` password hashing and stateless JWT token authentication.
- **User Profile Management**: View and update profile information including name, phone number, and detailed shipping addresses.
- **Password Recovery Pipeline**: Request password reset links delivered via Gmail SMTP (`nodemailer`) with 10-minute expiring secure JWT reset tokens.

---

### 🛡️ Admin Management Dashboard ([admin](file:///d:/Ecommerce1/admin))
- **Protected Admin Access**: Dedicated admin authentication verified against `ADMIN_EMAIL` and `ADMIN_PASSWORD` credentials using Bearer tokens.
- **Inventory & Product Management**:
  - Upload products with up to 4 images automatically hosted and CDN-delivered via **Cloudinary**.
  - Configure titles, rich descriptions, prices, categories, sub-categories, sizes, and bestseller flags.
  - View complete product listings and delete obsolete inventory items with real-time feedback.
- **Order Fulfillment Operations**:
  - Monitor all incoming customer purchases system-wide with buyer contact details and delivery addresses.
  - Inspect payment status (*Pending*, *Paid*) and payment gateways (*COD*, *Stripe*).
  - Update order status through lifecycle stages (*Order Placed* &rarr; *Packing* &rarr; *Shipped* &rarr; *Out for delivery* &rarr; *Delivered*).

---

### 🐳 Containerization & DevOps
- **Complete Docker Support**: Multi-container setup with [docker-compose.yml](file:///d:/Ecommerce1/docker-compose.yml).
- **Multi-Stage Builds**: Frontend and Admin applications use multi-stage builds (`node:20` build &rarr; `nginx:alpine` runtime), slashing production image sizes to ~30MB.
- **Nginx SPA Routing**: Custom Nginx configurations ([frontend/nginx.conf](file:///d:/Ecommerce1/frontend/nginx.conf) and [admin/nginx.conf](file:///d:/Ecommerce1/admin/nginx.conf)) with `try_files $uri $uri/ /index.html;` to prevent 404 errors on deep route reloads.
- **Isolated Backend Service**: Runs on `node:26-alpine` with deterministic `npm ci` dependencies.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Store** | React 19, Vite, Tailwind CSS, React Router 7, Axios, React Toastify, React Icons |
| **Admin Dashboard** | React 19, Vite, Tailwind CSS, React Router 7, Axios, React Toastify |
| **Backend API** | Node.js, Express.js (v5), Mongoose, Multer, Nodemailer, Bcrypt, JWT |
| **Database & Media** | MongoDB Atlas, Cloudinary (CDN Image Storage) |
| **AI & Search** | Google Gemini 2.5 Flash, Custom In-Memory FAQ String Similarity Engine |
| **Payments** | Stripe API |
| **Containerization** | Docker, Docker Compose, Nginx Alpine |

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire ShopKart ecosystem (Backend, Frontend, and Admin) is using **Docker & Docker Compose**.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.
- [Git](https://git-scm.com/) installed.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/urbruder/Ecommerce_Website.git
cd Ecommerce_Website
```

---

### Step 2: Configure Environment Variables

#### 1. Backend (`/backend/.env`)
Create a `.env` file in the [backend](file:///d:/Ecommerce1/backend) folder:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@shopkart.com
ADMIN_PASSWORD=your_admin_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
SIMILARITY_THRESHOLD=0.45
```

#### 2. Frontend Store (`/frontend/.env`)
Create or verify `.env` in the [frontend](file:///d:/Ecommerce1/frontend) folder:
```env
VITE_BACKEND_URL=http://localhost:4000
```

#### 3. Admin Panel (`/admin/.env`)
Create or verify `.env` in the [admin](file:///d:/Ecommerce1/admin) folder:
```env
VITE_BACKEND_URL=http://localhost:4000
```

> [!NOTE]
> Vite bakes `VITE_*` environment variables into the static JavaScript bundle at **build time**. If you change `VITE_BACKEND_URL`, remember to rebuild the containers using `--build`.

---

### Step 3: Launch with Docker Compose

Run the following command from the project root directory:

```bash
docker compose up -d --build
```

Docker will:
1. Build the Node Alpine backend service.
2. Build the Vite production assets and configure Nginx for the Frontend.
3. Build the Vite production assets and configure Nginx for the Admin Panel.
4. Launch all 3 services in the background.

---

### 🌐 Accessing the Services

Once the containers are running, access each application in your web browser:

| Application | URL | Internal Container Port |
| :--- | :--- | :--- |
| **🛍️ Frontend Store** | [http://localhost:5173](http://localhost:5173) | `80` (Nginx) |
| **🛡️ Admin Dashboard** | [http://localhost:5174](http://localhost:5174) | `80` (Nginx) |
| **📡 Backend API Server** | [http://localhost:4000](http://localhost:4000) | `4000` (Node.js) |

---

### Useful Docker Commands

```bash
# View live logs for all running containers
docker compose logs -f

# View live logs for a specific service (e.g. backend)
docker compose logs -f backend

# Restart a specific container
docker compose restart frontend

# Stop and remove all containers, networks, and volumes
docker compose down

# Rebuild containers after code or environment variable changes
docker compose up -d --build
```

---

### Running Individual Services with Docker (Standalone)

If you prefer building and running containers individually without Docker Compose:

#### 1. Backend Service
```bash
cd backend
docker build -t shopkart-backend .
docker run -d -p 4000:4000 --env-file .env --name shopkart-backend shopkart-backend
```

#### 2. Frontend Client
```bash
cd frontend
docker build -t shopkart-frontend .
docker run -d -p 5173:80 --name shopkart-frontend shopkart-frontend
```

#### 3. Admin Panel
```bash
cd admin
docker build -t shopkart-admin .
docker run -d -p 5174:80 --name shopkart-admin shopkart-admin
```

---

## 💻 Alternative: Running Locally without Docker

If you want to run the project in development mode using Node:

### 1. Start Backend Server
```bash
cd backend
npm install
npm run server    # Starts with nodemon on port 4000
```

### 2. Start Frontend Client
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

### 3. Start Admin Dashboard
```bash
cd admin
npm install
npm run dev       # Starts Vite dev server on http://localhost:5174
```

---

## 📁 Project Directory Structure

```text
Ecommerce_Website/
├── docker-compose.yml        # Multi-container Docker orchestration configuration
├── claude.md                 # Complete developer architecture and API reference
├── README.md                 # Project setup and overview documentation
│
├── backend/                  # Express.js REST API Server
│   ├── Dockerfile            # Alpine-based Node.js Docker configuration
│   ├── .dockerignore         # Docker context exclusions
│   ├── config/               # Database and Cloudinary configurations
│   ├── controllers/          # Request handlers (user, product, cart, order, chatbot)
│   ├── data/                 # FAQ dataset (faq.json)
│   ├── middleware/           # Auth, adminAuth, and Multer file upload middlewares
│   ├── models/               # Mongoose database models (user, product, order)
│   ├── routes/               # API endpoint route definitions
│   ├── services/             # FAQ, Gemini AI, and Similarity scoring services
│   ├── utils/                # Score calculation and Nodemailer email utilities
│   └── server.js             # Express server entry point
│
├── frontend/                 # Customer-Facing React 19 Application
│   ├── Dockerfile            # Multi-stage build with Nginx production server
│   ├── nginx.conf            # Nginx SPA fallback configuration
│   ├── .dockerignore         # Docker context exclusions
│   └── src/
│       ├── components/       # UI elements, Navbar, Footer, and AI ChatBot widget
│       ├── context/          # ShopContext (Global state & cart sync)
│       └── pages/            # Home, Collection, Product, Cart, PlaceOrder, Orders, Profile
│
└── admin/                    # Store Management React 19 Application
    ├── Dockerfile            # Multi-stage build with Nginx production server
    ├── nginx.conf            # Nginx SPA fallback configuration
    ├── .dockerignore         # Docker context exclusions
    └── src/
        ├── components/       # Admin Navbar, Sidebar, and Login modal
        └── pages/            # Add Product, List Products, Manage Orders
```

---

## 📖 Additional Documentation

For exhaustive developer documentation—including full API specifications, payload samples, database schemas, and AI chatbot similarity math—refer to [claude.md](file:///d:/Ecommerce1/claude.md).
