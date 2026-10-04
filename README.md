# FinCred — Digital Loan Assistance & Referral Platform

FinCred is a modern, high-performance financial technology web platform and standalone Progressive Web Application (PWA). It connects borrowers with RBI-registered NBFC lenders and banking partners across India, featuring real-time loan comparisons, an automated earning & referral engine, CIBIL score enhancement, and an enterprise admin portal.

---

## 🚀 Key Features

- **Multi-Lender Loan Marketplace**: Instant eligibility checking, real-time comparisons across 250+ RBI-registered NBFC partners (Personal Loans, Business Loans, Instant Credit).
- **Standalone Mobile PWA**: Built-in Progressive Web App architecture with fixed mobile shell (`100dvh`), edge-to-edge layout, responsive bottom navigation, and zero viewport zoom issues.
- **Earn & Refer Engine**: Automated ₹100 app download bonus and ₹200 loan referral rewards with verified bank account management and 24-hour payout tracking.
- **CIBIL Score Improvement Hub**: Streamlined flow for ₹299 score restoration orders with 12-digit UTR payment tracking.
- **Enterprise Admin Portal**: Live lead management, origin tracking (Mobile App vs Website), partner URL management, broadcast notifications, and fraud review tools.
- **Persistent Secure Authentication**: Session preservation across page reloads, app reopenings, and device backgrounding without repeated OTP requests.
- **Hosting-Independent**: Zero hardcoded URLs or platform-specific dependencies; deployable to Vercel, Netlify, Render, Railway, Cloud Run, or custom VPS.

---

## 🏗️ Architecture

```
fincred/
├── server.ts                  # Production Express server + Vite SSR/SPA middleware
├── server/
│   ├── firebase.ts            # Configurable Firebase/Firestore initialization
│   └── firestoreDb.ts         # Persistent data layer (Customers, Leads, Referrals)
├── src/
│   ├── components/            # Shared UI components (Navigation, Modals, Banners)
│   ├── context/               # React Context (AuthContext for web)
│   ├── mobile/                # Native-style mobile app view (/app)
│   │   ├── components/        # Mobile-specific UI (BottomNav, Splash, Modals)
│   │   ├── context/           # MobileAuthContext with session persistence
│   │   └── screens/           # Mobile tabs (Home, Loans, Applications, Profile)
│   ├── pages/                 # Full web pages (Home, Dashboard, Admin, Login)
│   ├── services/
│   │   ├── apiClient.ts       # Central API client with JSON safety guarantee
│   │   └── api.ts             # Typed API contracts for all customer & admin features
│   └── types.ts               # Complete TypeScript data schemas
├── public/                    # Static assets, PWA icons, manifest.json, uploads
└── dist/                      # Production build output
```

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `production` |
| `APP_BASE_URL` | Canonical public domain of your deployed app | `https://your-domain.com` |
| `CORS_ORIGIN` | Allowed origin for Cross-Origin requests | `*` |
| `ADMIN_USERNAME` | Admin dashboard username | `FIN-CRED` |
| `ADMIN_PASSWORD` | Admin dashboard password | `(Set a secure password)` |
| `ADMIN_SECRET_KEY`| Secret used to sign admin session tokens | `(Random 32+ char secret)` |
| `FIREBASE_PROJECT_ID` | Google Firebase project ID | `your-firebase-project-id` |
| `FIREBASE_API_KEY` | Firebase Web API key | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `your-project.firebaseapp.com` |
| `FIREBASE_DATABASE_ID` | Firestore named database ID | `(default)` |
| `UPLOADS_DIR` | Filesystem path for uploaded documents | `./public/uploads` |
| `VITE_API_BASE_URL` | Frontend API URL (if frontend is on a different domain) | `""` (empty for same-origin) |
| `VITE_APP_BASE_URL` | Public website URL for client-side referral links | `https://your-domain.com` |

---

## 📦 Getting Started (Local Development)

### Prerequisites

- Node.js 18+ or 20+
- npm 9+

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

---

## 🚢 Production Build & Deployment

### 1. Build the Application

```bash
npm run build
```

This compiles:
1. The Vite React client into `dist/`
2. The Node.js Express server into `dist/server.cjs`

### 2. Start the Production Server

```bash
npm start
```

The server serves both the production static frontend and all `/api/*` endpoints from a single Node.js process.

---

## 🌐 Deploying to Hosting Platforms

### Option A: Render / Railway / Fly.io / VPS (Full-Stack Node.js - Recommended)

1. Connect your GitHub repository to **Render**, **Railway**, or **Fly.io**.
2. Configure build and start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add environment variables in the host's dashboard (from `.env.example`).
4. Set `PORT` to the host's port or let the platform inject it automatically.

### Option B: Vercel (Full Serverless Deployment or Split)

FinCred includes an `api/index.ts` entrypoint configured in `vercel.json` for effortless full-stack serverless deployment on Vercel:
1. Connect your repository to **Vercel**.
2. Framework preset: **Vite**.
3. All `/api/*` endpoints are automatically routed to `api/index.ts` as serverless functions.
4. Non-API routes are seamlessly rewritten to `/index.html` (SPA fallback).
5. Add your environment variables (from `.env.example`) in Vercel's **Settings > Environment Variables**.

### Option C: Netlify / Cloudflare Pages

1. The provided `public/_redirects` and `netlify.toml` ensure proper SPA routing:
   ```
   /*      /index.html  200
   ```
2. Set build command to `npm run build` and publish directory to `dist`.
3. If deploying frontend-only on Netlify and backend on Render/Railway, set `VITE_API_BASE_URL=https://your-backend-api.com`.

---

## 🛡️ JSON Response Guarantee & API Architecture

To prevent frontend parsing crashes (`Unexpected token '<', "<!doctype..."`):
- All `/api/*` routes explicitly return `Content-Type: application/json`.
- A dedicated 404 handler for `/api/*` catches missing routes and returns a JSON 404 response (`{ "success": false, "error": { "code": "NOT_FOUND", ... } }`) instead of an HTML page.
- A global error middleware catches unhandled exceptions and outputs JSON 500 responses.
- The central frontend client (`src/services/apiClient.ts`) verifies the `Content-Type` before calling `.json()`, catching unexpected proxy HTML errors and translating them into readable `ApiError` objects.

### Core API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | Public |
| `POST`| `/api/customer/continue` | Validated customer mobile continue & instant OTP | Public |
| `GET` | `/api/customer/profile` | Customer profile retrieval | Customer / Token |
| `PUT` | `/api/customer/profile` | Update customer profile details | Customer / Token |
| `POST`| `/api/auth/login` | Unified authentication (Admin or Customer OTP) | Public |
| `POST`| `/api/auth/logout` | Invalidate current session | Authenticated |
| `GET` | `/api/auth/session` | Validate active session & return role | Authenticated |
| `GET` | `/api/settings` | Public partner lending URLs | Public |
| `GET` | `/api/banners` | Active promotional banner list | Public |
| `POST`| `/api/auth/send-otp` | Request 6-digit mobile OTP | Public |
| `POST`| `/api/auth/verify-otp` | Verify OTP and issue JWT session | Public |
| `POST`| `/api/applications` | Submit new loan lead (Web & App) | Public |
| `GET` | `/api/applications/my` | Retrieve applicant loan history | Customer |
| `POST`| `/api/cibil/submit` | Submit ₹299 CIBIL upgrade order | Public |
| `GET` | `/api/earn/profile` | Customer referral stats & earnings | Customer |
| `POST`| `/api/earn/activate-profile` | Register bank details for payouts | Customer |
| `POST`| `/api/admin/login` | Administrator session login | Public |
| `GET` | `/api/admin/session` | Admin token validation | Admin |
| `GET` | `/api/admin/data` | Consolidated administrative overview data | Admin |
| `GET` | `/api/admin/applications` | List all leads with origin tracking | Admin |
| `PUT` | `/api/admin/applications/:id/status` | Update internal lead status | Admin |
| `GET` | `/api/admin/earn/payouts` | Review pending referral payouts | Admin |

---

## 🔒 Security Best Practices

- Sensitive credentials, secret tokens, and database passwords are never committed to version control.
- Customer PAN numbers are stored masked for standard operations.
- Admin endpoints require a valid Bearer token validated via `requireAdmin` middleware.
- Client inputs enforce 16px font-size to prevent mobile browser viewport auto-zoom.

---

## 📄 License

This software is proprietary and confidential. All rights reserved.
