# 🏗️ Ecommerce Project — Architecture Diagrams

---

## 1. 📋 Overall System Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        UI[User Interface]
        CTX[ShopContext\nGlobal State]
        AX[Axios HTTP Client]
    end

    subgraph Backend["⚙️ Backend (Node.js + Express)"]
        SRV[server.js\nExpress App]
        MW[Middleware\nauthUser / adminAuth / multer]
        subgraph Routes
            UR[/api/user]
            PR[/api/product]
            CR[/api/cart]
            OR[/api/order]
            CHR[/api/chat]
        end
        subgraph Controllers
            UC[userController]
            PC[productController]
            CC[cartController]
            OC[orderController]
            CBC[chatbotController]
        end
    end

    subgraph ExternalServices["☁️ External Services"]
        MDB[(MongoDB Atlas)]
        CLD[Cloudinary\nImage Storage]
        STR[Stripe\nPayment Gateway]
        GEM[Gemini AI\nREST API]
        EML[Email Service\nNodemailer]
    end

    UI --> CTX --> AX --> SRV
    SRV --> MW --> Routes
    UR --> UC
    PR --> PC
    CR --> CC
    OR --> OC
    CHR --> CBC

    UC --> MDB
    PC --> MDB
    PC --> CLD
    CC --> MDB
    OC --> MDB
    OC --> STR
    CBC --> GEM
    UC --> EML
```

---

## 2. 🔐 User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend\n(Login.jsx)
    participant CTX as ShopContext
    participant BE as Backend\n(userController)
    participant DB as MongoDB

    User->>FE: Fill name, email, password\nClick Sign Up

    FE->>BE: POST /api/user/register\n{ name, email, password }

    BE->>BE: validator.isEmail(email)\nCheck email format

    alt Invalid Email
        BE-->>FE: { success: false, "Invalid email" }
        FE-->>User: toast.error(message)
    end

    BE->>BE: password.length < 8?\nCheck password strength

    alt Weak Password
        BE-->>FE: { success: false, "Strong password needed" }
        FE-->>User: toast.error(message)
    end

    BE->>DB: userModel.findOne({ email })\nCheck if user already exists

    alt User Already Exists
        DB-->>BE: user found
        BE-->>FE: { success: false, "User Already Exists" }
        FE-->>User: toast.error(message)
    end

    DB-->>BE: null (user not found)
    BE->>BE: bcrypt.genSalt(10)\nbcrypt.hash(password, salt)

    BE->>DB: new userModel({ name, email,\nhashedPassword, cartData:{} }).save()
    DB-->>BE: saved user with _id

    BE->>BE: jwt.sign({ id: user._id },\nJWT_SECRET)

    BE-->>FE: { success: true, token }

    FE->>FE: setToken(token)\nlocalStorage.setItem('token', token)
    FE->>BE: fetchUserProfile(token)\nPOST /api/user/profile
    BE->>DB: userModel.findById(userId)
    DB-->>BE: user data
    BE-->>FE: { name, email, address }
    FE->>CTX: setUserProfile({ name, email, address })
    FE-->>User: navigate('/') — Home Page
```

---

## 3. 🔑 User Login Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend\n(Login.jsx)
    participant CTX as ShopContext
    participant BE as Backend\n(userController)
    participant DB as MongoDB

    User->>FE: Enter email + password\nClick Sign In

    FE->>BE: POST /api/user/login\n{ email, password }

    BE->>DB: userModel.findOne({ email })

    alt User Not Found
        DB-->>BE: null
        BE-->>FE: { success: false, "User does not exist" }
        FE-->>User: toast.error(message)
    end

    DB-->>BE: user document\n(with hashed password)

    BE->>BE: bcrypt.compare(password, user.password)\nCompare plain vs hashed

    alt Wrong Password
        BE-->>FE: { success: false, "Invalid credentials" }
        FE-->>User: toast.error(message)
    end

    BE->>BE: jwt.sign({ id: user._id }, JWT_SECRET)\nCreate JWT token

    BE-->>FE: { success: true, token }

    FE->>FE: setToken(token)\nlocalStorage.setItem('token', token)

    FE->>BE: fetchUserProfile(token)
    FE->>BE: getUserCart(token)

    par Parallel API Calls
        BE->>DB: userModel.findById(userId)\nFetch profile
        BE->>DB: userModel.findById(userId)\nFetch cartData
    end

    DB-->>BE: profile + cart data

    BE-->>FE: profile data
    BE-->>FE: cart data

    FE->>CTX: setUserProfile(...)\nsetCartItems(...)

    FE-->>User: navigate('/') — Home Page
```

---

## 4. 🔒 JWT Auth Middleware Flow

```mermaid
flowchart TD
    REQ[Incoming Request\nto Protected Route] --> MW

    subgraph MW["authUser Middleware (auth.js)"]
        A[Read token\nfrom req.headers.token]
        B{Token exists?}
        C[jwt.verify\ntoken, JWT_SECRET]
        D{Valid signature\n& not expired?}
        E[Inject userId\ninto req.body.userId]
        F[next — pass to controller]
    end

    A --> B
    B -- NO --> DENY1[return res.json\nNot Authorised Login Again]
    B -- YES --> C
    C --> D
    D -- NO --> DENY2[return res.json\nerror.message]
    D -- YES --> E --> F

    F --> CTRL[Controller Function\ngetProfile / addToCart\nuserOrders etc.]

    style DENY1 fill:#ff6b6b,color:#fff
    style DENY2 fill:#ff6b6b,color:#fff
    style CTRL fill:#51cf66,color:#fff
```

---

## 5. 🛡️ Admin Auth Middleware Flow

```mermaid
flowchart TD
    REQ[Admin Request\nto /api/product/add\nor /api/order/list] --> MW

    subgraph MW["adminAuth Middleware (adminAuth.js)"]
        A[Read Authorization header\nreq.headers.authorization]
        B{Starts with\n'Bearer '?}
        C[Extract token\nfrom header]
        D[jwt.verify\ntoken, JWT_SECRET]
        E{decoded.email ===\nADMIN_EMAIL in .env?}
        F[next — allow admin access]
    end

    A --> B
    B -- NO --> D1[401 Not authorised\nlogin again]
    B -- YES --> C --> D
    D --> E
    E -- NO --> D2[401 Not authorised\nlogin again]
    E -- YES --> F

    F --> ADMIN[Admin Controller\naddProduct / removeProduct\nallOrders / updateStatus]

    style D1 fill:#ff6b6b,color:#fff
    style D2 fill:#ff6b6b,color:#fff
    style ADMIN fill:#339af0,color:#fff
```

---

## 6. 🛍️ Product Listing & Display Flow

```mermaid
sequenceDiagram
    participant FE as Frontend\n(ShopContext)
    participant BE as Backend\n(productController)
    participant DB as MongoDB

    Note over FE: On app startup — useEffect([])

    FE->>BE: GET /api/product/list\n(No auth required)

    BE->>DB: productModel.find({})
    DB-->>BE: Array of all products

    BE-->>FE: { success: true, products: [...] }

    FE->>FE: setProducts(products)\nStored in ShopContext

    Note over FE: Now available to ALL components

    FE->>FE: Collection.jsx filters by:\n- category / subCategory\n- search text\n- price sort

    FE->>FE: BestSeller.jsx shows\nproducts where bestseller=true

    FE->>FE: LatestCollection.jsx shows\nnewest products by date
```

---

## 7. 🖼️ Admin — Add Product Flow

```mermaid
sequenceDiagram
    actor Admin
    participant AP as Admin Panel\n(React)
    participant BE as Backend
    participant MU as Multer\nMiddleware
    participant CLD as Cloudinary
    participant DB as MongoDB

    Admin->>AP: Fill product form\n+ upload 1-4 images

    AP->>BE: POST /api/product/add\nContent-Type: multipart/form-data\n{ name, price, category, sizes... + image files }

    BE->>BE: adminAuth middleware\nVerify Bearer token + email

    alt Not Admin
        BE-->>AP: 401 Not authorised
    end

    BE->>MU: upload.fields([image1..image4])
    MU->>MU: Save files to disk\nwith original filename
    MU-->>BE: req.files populated

    BE->>BE: Extract image1,2,3,4 from req.files\nFilter out undefined ones

    loop For each image (in parallel via Promise.all)
        BE->>CLD: cloudinary.uploader.upload\n(file.path, folder:"Ecommerce")
        CLD-->>BE: { secure_url: "https://..." }
    end

    BE->>BE: Build productData object\n{ name, price, sizes: JSON.parse(sizes),\nimages: [url1,url2...], date: Date.now() }

    BE->>DB: new productModel(productData).save()
    DB-->>BE: saved product

    BE-->>AP: { success: true, "Product added" }
    AP-->>Admin: Success toast
```

---

## 8. 🛒 Add to Cart Flow

```mermaid
sequenceDiagram
    actor User
    participant PG as Product.jsx
    participant CTX as ShopContext
    participant BE as Backend\n(cartController)
    participant DB as MongoDB

    User->>PG: Click "ADD TO CART"\n(size selected)

    PG->>CTX: addToCart(itemId, size)

    CTX->>CTX: Check if size selected\nif not → toast.error

    CTX->>CTX: structuredClone(cartItems)\nDeep copy current cart

    alt Item+Size exists in cart
        CTX->>CTX: cartData[itemId][size] += 1
    else Item exists, size new
        CTX->>CTX: cartData[itemId][size] = 1
    else Item not in cart
        CTX->>CTX: cartData[itemId] = {}\ncartData[itemId][size] = 1
    end

    CTX->>CTX: setCartItems(cartData)\nUpdate UI instantly ⚡

    CTX->>BE: POST /api/cart/add\n{ itemId, size }\n{ headers: { token } }

    BE->>BE: authUser middleware\nVerify token → extract userId

    BE->>DB: userModel.findById(userId)\nGet current cartData

    DB-->>BE: user with cartData

    BE->>BE: Same cart update logic\n(mirror of frontend)

    BE->>DB: userModel.findByIdAndUpdate\n(userId, { cartData })

    DB-->>BE: updated
    BE-->>CTX: { success: true }
```

---

## 9. 📦 Place Order — COD Flow

```mermaid
sequenceDiagram
    actor User
    participant PO as PlaceOrder.jsx
    participant BE as Backend\n(orderController)
    participant DB as MongoDB

    User->>PO: Fill delivery address\nSelect "Cash on Delivery"\nClick Place Order

    PO->>BE: POST /api/order/place\n{ items, amount, address }\n{ headers: { token } }

    BE->>BE: authUser middleware\nExtract userId from JWT

    BE->>DB: new orderModel({\n  userId, items, address,\n  amount,\n  paymentMethod: "COD",\n  payment: false,\n  date: Date.now()\n}).save()

    DB-->>BE: Order saved with _id

    BE->>DB: userModel.findByIdAndUpdate\n(userId, { cartData: {} })\nClear user cart in DB

    DB-->>BE: cart cleared

    BE-->>PO: { success: true, "Order Placed" }

    PO->>PO: setCartItems({})\nClear cart in React state

    PO-->>User: navigate('/orders')\nShow order history
```

---

## 10. 💳 Place Order — Stripe Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant PO as PlaceOrder.jsx
    participant BE as Backend\n(orderController)
    participant DB as MongoDB
    participant STR as Stripe API
    participant VR as Verify.jsx

    User->>PO: Select "Stripe"\nClick Place Order

    PO->>BE: POST /api/order/stripe\n{ items, amount, address }\n{ headers: { token } }

    BE->>BE: authUser middleware\nExtract userId

    BE->>DB: new orderModel({\n  paymentMethod: "Stripe",\n  payment: false\n}).save()

    Note right of DB: Order saved BEFORE\npayment (payment=false)

    DB-->>BE: order._id created

    BE->>BE: Build line_items array\nfrom order items

    BE->>BE: Push delivery charge\nas extra line item

    BE->>STR: stripe.checkout.sessions.create({\n  line_items,\n  mode: 'payment',\n  success_url: origin/verify?success=true&orderId,\n  cancel_url: origin/verify?success=false&orderId\n})

    STR-->>BE: { url: "https://checkout.stripe.com/..." }

    BE-->>PO: { success: true, session_url }

    PO-->>User: window.location.replace(session_url)\nRedirect to Stripe Checkout

    Note over User,STR: User completes payment on Stripe's page

    STR-->>VR: Redirect to success_url OR cancel_url\n/verify?success=true/false&orderId=...

    VR->>BE: POST /api/order/verifyStripe\n{ success, orderId, userId }

    alt Payment Successful
        BE->>DB: orderModel.findByIdAndUpdate\n(orderId, { payment: true })
        BE->>DB: userModel.findByIdAndUpdate\n(userId, { cartData: {} })
        DB-->>BE: updated
        BE-->>VR: { success: true }
        VR->>VR: setCartItems({})\nnavigate('/orders')
        VR-->>User: ✅ Order Confirmed
    else Payment Cancelled
        BE-->>VR: (payment stays false)
        VR-->>User: ❌ navigate('/cart')\nOrder failed
    end
```

---

## 11. 🔓 Forgot Password & Reset Flow

```mermaid
sequenceDiagram
    actor User
    participant FP as ForgetPassword.jsx
    participant RP as ResetPassword.jsx
    participant BE as Backend\n(userController)
    participant DB as MongoDB
    participant EM as Email Service\n(Nodemailer)

    User->>FP: Enter email\nClick Send Reset Link

    FP->>BE: POST /api/user/forgot-password\n{ email }

    BE->>DB: userModel.findOne({ email })

    alt User not found
        DB-->>BE: null
        BE-->>FP: { success: false, "User does not exist" }
    end

    DB-->>BE: user found

    BE->>BE: jwt.sign(\n  { id: user._id },\n  JWT_SECRET,\n  { expiresIn: "10m" }\n)

    BE->>BE: Build reset link:\n${FRONTEND_URL}/reset-password/${token}

    BE->>EM: sendEmail(\n  user.email,\n  "Reset Password",\n  HTML with link\n)

    EM-->>User: 📧 Email with reset link

    BE-->>FP: { success: true }
    FP-->>User: "Check your email"

    Note over User: User clicks link in email\n(valid for 10 minutes only)

    User->>RP: Opens /reset-password/:token\nEnter new password

    RP->>BE: POST /api/user/reset-password\n{ token, password }

    BE->>BE: jwt.verify(token, JWT_SECRET)\nDecode to get user id

    alt Token Expired (> 10 min)
        BE-->>RP: { success: false, "Reset link expired" }
        RP-->>User: Show expired message
    end

    alt Invalid Token
        BE-->>RP: { success: false, "Invalid reset link" }
    end

    BE->>DB: userModel.findById(decoded.id)
    DB-->>BE: user found

    BE->>BE: bcrypt.genSalt(10)\nbcrypt.hash(newPassword, salt)

    BE->>DB: user.password = hashedPassword\nuser.save()

    DB-->>BE: saved

    BE-->>RP: { success: true, "Password reset successful" }
    RP-->>User: navigate('/login')
```

---

## 12. 🤖 Chatbot Pipeline Flow

```mermaid
flowchart TD
    A[User sends message] --> B

    subgraph Backend["Backend Pipeline"]
        B[POST /api/chat\nhandleChatMessage]
        C[Validate message\nnot empty string]
        D[findBestMatch userQuery\nsimilarityService.js]

        subgraph Scoring["scoreCalculator.js — for EACH FAQ"]
            E1[Normalize text\nlowercase + remove punctuation]
            E2[Tokenize into words]
            E3[Remove stop words\nthe, is, a, how...]
            E4[Jaccard Similarity × 0.30\nIntersection÷Union of word sets]
            E5[Overlap Score × 0.35\nQuery words found in FAQ]
            E6[Substring Score × 0.35\nPartial word matching]
            E7[Combined Score 0.0-1.0]
        end

        F{Best score ≥ 0.45\nThreshold?}

        subgraph FAQ["FAQ Path — Fast ⚡"]
            G[Return bestMatch.answer\nfrom faq.json\nsource: faq]
        end

        subgraph Gemini["Gemini Path — AI 🧠"]
            H[getTopMatches\nTop 3 closest FAQs]
            I[buildPrompt:\n+ Bot identity\n+ Top 3 FAQs as context\n+ Conversation history\n+ User question]
            J[fetch POST to Gemini 2.5 Flash\nREST API - no SDK]
            K[Extract text from\ncandidates 0 content parts 0]
            L[Return AI answer\nsource: gemini]
        end
    end

    B --> C --> D
    D --> Scoring
    E1 --> E2 --> E3
    E3 --> E4 & E5 & E6 --> E7

    E7 --> F
    F -- YES --> G
    F -- NO --> H --> I --> J --> K --> L

    G --> RESP[Response to Frontend\n source + confidence + answer]
    L --> RESP

    style G fill:#51cf66,color:#fff
    style L fill:#339af0,color:#fff
    style RESP fill:#f59f00,color:#fff
```

---

## 13. 🔄 Session Restore on Page Reload

```mermaid
flowchart TD
    A[User refreshes browser\nor opens new tab] --> B

    subgraph CTX["ShopContext useEffect on mount"]
        B{localStorage\nhas token?}
        C[Retrieve savedToken\nfrom localStorage]
        D[setToken savedToken\nUpdate React state]
        E[getUserCart savedToken\nPOST /api/cart/get]
        F[fetchUserProfile savedToken\nPOST /api/user/profile]
    end

    B -- NO --> G[Stay logged out\ntoken stays empty string]
    B -- YES --> C --> D

    D --> E & F

    E --> DB1[(MongoDB\nCartData)]
    F --> DB2[(MongoDB\nUser Profile)]

    DB1 --> H[setCartItems cartData\nRestore cart UI]
    DB2 --> I[setUserProfile name+email+address\nRestore profile]

    H & I --> J[✅ User sees their\ncart + profile intact]

    style J fill:#51cf66,color:#fff
    style G fill:#868e96,color:#fff
```

---

## 14. 🗑️ Orphan Cart Cleanup Flow

```mermaid
flowchart TD
    A[products or cartItems\nor token changes] --> B

    subgraph Cleanup["ShopContext useEffect - products,cartItems,token"]
        B{products loaded\nAND cart not empty?}
        C[Loop through\neach itemId in cartItems]
        D{Product still\nexists in products array?}
        E[Keep item in cart]
        F[Delete from local\ncart state]
        G{User logged in?\ntoken exists?}
        H[POST /api/cart/update\nquantity=0 for each size\nRemove from DB too]
    end

    B -- NO --> END[Skip cleanup]
    B -- YES --> C
    C --> D
    D -- YES --> E
    D -- NO\nProduct deleted by admin --> F --> G
    G -- YES --> H
    G -- NO --> I[Only local cleanup]

    F --> UPDATE[setCartItems updatedCart\nUI updated]

    style F fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style E fill:#51cf66,color:#fff
```
