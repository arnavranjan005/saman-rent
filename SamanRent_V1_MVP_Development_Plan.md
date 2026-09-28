# SamanRent V1 MVP Development Plan

## 1. V1 Goal

The purpose of V1 is to turn the existing SamanRent Expo frontend into a working rental/service marketplace with the smallest useful backend.

### V1 user journey

```text
Customer
  ↓
Login with mobile OTP
  ↓
Home
  ↓
Browse category / search services
  ↓
Open service details
  ↓
Select date, time, duration and location
  ↓
Submit booking request
  ↓
Booking = PENDING
  ↓
Vendor accepts/rejects
  ↓
Customer sees booking status
```

### V1 is NOT

- A full payment marketplace
- A wallet/payout system
- A chat platform
- A review platform
- A complex real-time availability engine
- A microservice architecture
- An AI recommendation system

The objective is to validate the core marketplace flow first.

---

# 2. Existing Frontend State

The current project is already a functional UI prototype built with **Expo Router / React Native**.

Current important structure:

```text
app/
├── (tabs)/
│   ├── index.js          → Home
│   ├── search.js         → Category/Search
│   ├── bookings.js       → Currently Coming Soon
│   ├── wishlist.js       → Currently Coming Soon
│   └── profile.js        → Profile
├── booking.js            → Booking screen
├── category.js           → Category screen
└── details.js            → Service details

components/
└── VendorCard.js

screens/
├── HomeScreen.js
├── CategoryScreen.js
├── DetailsScreen.js
├── BookingScreen.js
├── ProfileScreen.js
└── ComingSoonScreen.js

data/
└── mock.js               → Current mock data source

assets/
└── vendors/*             → Current local images
```

## Frontend migration principle

Do **not** redesign the existing screens for V1.

Keep the current UI and replace the mock-data layer with API data progressively.

Current flow:

```text
Screen → data/mock.js
```

Target flow:

```text
Screen
  ↓
API client / hooks
  ↓
Express API
  ↓
Prisma
  ↓
PostgreSQL
```

---

# 3. V1 Technology Stack

## Mobile

- Expo
- React Native
- Expo Router
- JavaScript or TypeScript, matching the existing project initially
- TanStack Query for server state
- Expo SecureStore for auth token storage

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication

## Images

- Cloudinary Free Tier
- Direct client-side upload
- Signed upload initiated by Express

## Hosting

Use simple managed hosting for V1. Avoid infrastructure complexity.

```text
Mobile App
   ↓
Express API
   ↓
PostgreSQL

Mobile App ─────────→ Cloudinary
```

---

# 4. V1 Scope

## Customer features

### Authentication

- Mobile number entry
- OTP verification
- Login session
- Logout
- Current user

### Marketplace

- Home page
- Categories
- Service listings
- Search
- Basic sorting/filtering
- Service details
- Service images
- Price
- Location

### Booking

- Select date
- Select time
- Select duration
- Enter/select location
- Optional notes
- Calculate total price
- Submit booking request
- View booking status
- Cancel pending/eligible booking

### User

- Basic profile
- Wishlist
- My bookings

## Vendor features

Implement as a simple web dashboard rather than another mobile app for V1.

- Vendor login
- Dashboard
- Create service
- Edit service
- Upload service images
- Set price
- View bookings
- Accept booking
- Reject booking
- Mark booking completed

## Admin features

Minimal admin dashboard.

- Admin login
- View vendors
- Approve/disable vendor
- View services
- Approve/disable service
- View bookings

---

# 5. Explicitly Out of Scope for V1

Do not build these unless required for launch validation:

```text
Payments
Wallet
Vendor payouts
Coupons
Referrals
Reviews
Chat
Advanced notifications
Advanced analytics
Elasticsearch/OpenSearch
Redis
Microservices
Complex geo-search
Real-time availability locking
Multi-vendor cart
Loyalty system
```

A booking request can be confirmed manually by the vendor in V1.

---

# 6. Phase-by-Phase Development Plan

## Phase 0: Project Cleanup and Baseline

### Goal

Prepare the existing frontend for backend integration without changing the visual design.

### Tasks

- [ ] Remove unnecessary generated/build artifacts from the working source if they are committed accidentally.
- [ ] Confirm Expo project runs cleanly on the target device/emulator.
- [ ] Identify every screen currently reading from `data/mock.js`.
- [ ] Identify every button currently doing only local state changes.
- [ ] Create a frontend API layer.
- [ ] Add environment configuration for API base URL.
- [ ] Add TanStack Query.
- [ ] Create a shared API error/loading pattern.

### Target frontend structure

```text
api/
├── client.js
├── auth.js
├── services.js
├── bookings.js
├── wishlist.js
└── users.js

hooks/
├── useAuth.js
├── useServices.js
├── useBookings.js
└── useWishlist.js
```

### Deliverable

The current UI still looks the same, but all future backend calls have a clean place to live.

---

## Phase 1: Backend Foundation

### Goal

Create the Express + Prisma + PostgreSQL foundation.

### Tasks

- [ ] Initialize backend project.
- [ ] Configure Express.
- [ ] Configure environment variables.
- [ ] Configure Prisma.
- [ ] Connect PostgreSQL.
- [ ] Add CORS.
- [ ] Add centralized error handling.
- [ ] Add request logging.
- [ ] Add `/api/health` endpoint.
- [ ] Add API version prefix `/api/v1`.
- [ ] Create base controller/service structure.

### Suggested backend structure

```text
server/
└── src/
    ├── config/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── utils/
    ├── app.js
    └── server.js

prisma/
└── schema.prisma
```

### Deliverable

```http
GET /api/v1/health
```

returns a healthy API response and confirms database connectivity.

---

## Phase 2: Prisma Schema + Seed Data

### Goal

Replace the current `mock.js` domain model with PostgreSQL data.

### Core models

```text
User
Vendor
Category
Service
ServiceImage
Booking
Wishlist
```

### Recommended relationships

```text
User
 ├── Bookings
 └── Wishlist

Vendor
 └── Services

Category
 └── Services

Service
 ├── Images
 ├── Bookings
 └── Wishlists
```

### Booking status

Keep V1 status simple:

```text
PENDING
CONFIRMED
REJECTED
CANCELLED
COMPLETED
```

### Tasks

- [ ] Create Prisma schema.
- [ ] Add migrations.
- [ ] Create seed script.
- [ ] Seed 3 categories.
- [ ] Seed 5-10 services/vendors based on the current mock data.
- [ ] Replace local image references with Cloudinary URLs later.
- [ ] Verify relations and indexes.

### Deliverable

The backend can return the same kind of data currently hardcoded in `data/mock.js`.

---

## Phase 3: Authentication

### Goal

Make the existing login/OTP UI real.

### Backend endpoints

```http
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

### V1 implementation

For development, OTP can initially be mocked/logged on the server.

Before real launch, connect an SMS/OTP provider.

### Tasks

- [ ] Create user by phone number.
- [ ] Verify OTP.
- [ ] Issue JWT/session token.
- [ ] Add auth middleware.
- [ ] Store token securely in Expo SecureStore.
- [ ] Add login persistence.
- [ ] Add logout.
- [ ] Add `/me` request on app startup.

### Deliverable

A user can open the app, authenticate, close/reopen it, and remain logged in.

---

## Phase 4: Cloudinary Image Pipeline

### Goal

Move service images out of the local Expo assets and into Cloudinary.

### Recommended flow

```text
Mobile App
   │
   │ request signed upload data
   ▼
Express
   │
   │ return signature
   ▼
Mobile App
   │
   │ direct upload
   ▼
Cloudinary
   │
   │ return secure_url + public_id
   ▼
Mobile App
   │
   │ send image metadata
   ▼
Express
   │
   ▼
PostgreSQL
```

### Backend endpoint

```http
POST /api/v1/uploads/signature
```

### Important rule

Do not put your Cloudinary API secret in the Expo app.

The client may receive a signed upload payload, but the Cloudinary secret must remain on the backend.

### Tasks

- [ ] Configure Cloudinary in Express.
- [ ] Create signature endpoint.
- [ ] Implement direct upload helper in Expo.
- [ ] Save `secure_url` and `public_id` in the service image record.
- [ ] Test single and multiple-image upload.
- [ ] Add delete-image support for vendor editing later.

### Deliverable

Vendor can upload images directly from the client and the service stores their Cloudinary URLs.

---

## Phase 5: Marketplace APIs

### Goal

Turn the Home, Search/Category, and Details screens into real screens.

### Endpoints

```http
GET /api/v1/home
GET /api/v1/categories
GET /api/v1/services
GET /api/v1/services/:id
```

### Service query support for V1

```text
q
category
sort
minPrice
maxPrice
```

Example:

```http
GET /api/v1/services?q=DJ&category=dj&sort=price_asc
```

### Tasks

- [ ] Create category controller/service.
- [ ] Create service controller/service.
- [ ] Add pagination.
- [ ] Add basic search using PostgreSQL.
- [ ] Add category filtering.
- [ ] Add price sorting/filtering.
- [ ] Return Cloudinary image URLs.
- [ ] Connect `HomeScreen.js`.
- [ ] Connect `CategoryScreen.js`.
- [ ] Connect `DetailsScreen.js`.
- [ ] Remove those screens' dependency on `VENDORS` and `CATEGORIES`.

### Deliverable

Opening the app shows database-backed services instead of mock services.

---

## Phase 6: Wishlist

### Goal

Make the heart icon and wishlist screen functional.

### Endpoints

```http
GET    /api/v1/wishlist
POST   /api/v1/wishlist/:serviceId
DELETE /api/v1/wishlist/:serviceId
```

### Tasks

- [ ] Add unique `(userId, serviceId)` constraint.
- [ ] Add wishlist controller/service.
- [ ] Connect heart icon in `VendorCard`.
- [ ] Connect wishlist screen.
- [ ] Show saved state immediately in UI.
- [ ] Handle duplicate add safely.

### Deliverable

A logged-in customer can save and remove services from the wishlist.

---

## Phase 7: Booking System

### Goal

Make the existing booking screen submit a real booking request.

### Endpoints

```http
POST  /api/v1/bookings
GET   /api/v1/bookings
GET   /api/v1/bookings/:id
PATCH /api/v1/bookings/:id/cancel
```

### Booking request

Example:

```json
{
  "serviceId": "service_id",
  "date": "2026-08-25",
  "startTime": "19:00",
  "duration": 5,
  "location": "Koderma, Jharkhand",
  "eventType": "Wedding",
  "notes": "Need setup before 6 PM"
}
```

### Server-side pricing

The client should NOT be trusted to calculate the final price.

The backend should calculate:

```text
service price
+ optional delivery/setup fee
- discount if later added
----------------------------
total
```

For V1, delivery/setup can simply be zero or a fixed value if needed.

### Tasks

- [ ] Create booking service.
- [ ] Validate service exists.
- [ ] Validate user is authenticated.
- [ ] Calculate total on server.
- [ ] Save booking.
- [ ] Add status history if desired.
- [ ] Connect `BookingScreen.js`.
- [ ] Replace current local `sent` state with API response.
- [ ] Add loading state.
- [ ] Add error state.

### Availability approach for V1

Do not build a complex reservation engine.

Use a simple booking-request model:

```text
Customer submits request
        ↓
PENDING
        ↓
Vendor reviews
        ↓
CONFIRMED or REJECTED
```

Later, once usage is validated, add strict time-slot locking and real-time availability.

### Deliverable

Submitting the form creates an actual database booking.

---

## Phase 8: My Bookings

### Goal

Replace the current `ComingSoonScreen` with real booking history.

### Backend

```http
GET /api/v1/bookings
GET /api/v1/bookings/:id
```

### Tasks

- [ ] Query bookings belonging only to the authenticated user.
- [ ] Include service name/image/vendor information.
- [ ] Sort upcoming bookings first.
- [ ] Connect `(tabs)/bookings.js`.
- [ ] Show status badges.
- [ ] Add booking detail view if required by the existing design.

### Deliverable

Customer sees real PENDING, CONFIRMED, REJECTED, CANCELLED and COMPLETED bookings.

---

## Phase 9: Vendor Dashboard

### Goal

Create the smallest possible vendor-side control panel.

Use a web dashboard for V1.

### Pages

```text
/vendor/login
/vendor/dashboard
/vendor/services
/vendor/services/new
/vendor/services/:id/edit
/vendor/bookings
```

### Vendor capabilities

#### Services

- [ ] Create service
- [ ] Edit service
- [ ] Upload images
- [ ] Set description
- [ ] Set location
- [ ] Set base price
- [ ] Select category
- [ ] Enable/disable service

#### Bookings

- [ ] View bookings for vendor's services
- [ ] Open booking details
- [ ] Accept
- [ ] Reject
- [ ] Mark completed

### API endpoints

```http
POST  /api/v1/vendor/services
PATCH /api/v1/vendor/services/:id
GET   /api/v1/vendor/services
GET   /api/v1/vendor/bookings
PATCH /api/v1/vendor/bookings/:id/status
```

### Authorization

A vendor must only be able to access their own services and bookings.

### Deliverable

A vendor can operate the basic marketplace transaction without database/manual intervention.

---

## Phase 10: Minimal Admin

### Goal

Provide enough control to operate V1 safely.

### Pages

```text
/admin/vendors
/admin/services
/admin/bookings
```

### Capabilities

- [ ] Admin login
- [ ] View vendors
- [ ] Approve vendor
- [ ] Disable vendor
- [ ] View services
- [ ] Approve/disable service
- [ ] View bookings

### Deliverable

You can manually control the marketplace while validating the business.

---

## Phase 11: End-to-End Integration and Polish

### Goal

Remove all remaining mock functionality and make the V1 flow production-usable.

### Tasks

- [ ] Remove unused `data/mock.js` dependencies.
- [ ] Remove local vendor/service images no longer required at runtime.
- [ ] Replace placeholder/fallback service objects.
- [ ] Add loading indicators.
- [ ] Add empty states.
- [ ] Add API error messages.
- [ ] Add pull-to-refresh where appropriate.
- [ ] Add network timeout handling.
- [ ] Add auth-expiry handling.
- [ ] Verify all protected endpoints.
- [ ] Verify role authorization.

### Deliverable

The app behaves like a real product instead of a clickable prototype.

---

# 7. Final V1 API List

## Auth

```http
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

## Home / Categories

```http
GET /api/v1/home
GET /api/v1/categories
```

## Services

```http
GET /api/v1/services
GET /api/v1/services/:id
```

## Wishlist

```http
GET    /api/v1/wishlist
POST   /api/v1/wishlist/:serviceId
DELETE /api/v1/wishlist/:serviceId
```

## Bookings

```http
POST  /api/v1/bookings
GET   /api/v1/bookings
GET   /api/v1/bookings/:id
PATCH /api/v1/bookings/:id/cancel
```

## Uploads

```http
POST /api/v1/uploads/signature
```

## Vendor

```http
GET   /api/v1/vendor/services
POST  /api/v1/vendor/services
PATCH /api/v1/vendor/services/:id
GET   /api/v1/vendor/bookings
PATCH /api/v1/vendor/bookings/:id/status
```

## Admin

```http
GET   /api/v1/admin/vendors
PATCH /api/v1/admin/vendors/:id/status
GET   /api/v1/admin/services
PATCH /api/v1/admin/services/:id/status
GET   /api/v1/admin/bookings
```

---

# 8. Frontend Integration Map

## Existing screens

| Existing Screen | V1 Backend Integration |
|---|---|
| `HomeScreen.js` | `GET /home`, `GET /categories` |
| `CategoryScreen.js` | `GET /services` |
| `DetailsScreen.js` | `GET /services/:id` |
| `BookingScreen.js` | `POST /bookings` |
| `BookingsTab` | `GET /bookings` |
| `WishlistTab` | `GET/POST/DELETE /wishlist` |
| `ProfileScreen.js` | `GET /auth/me` initially |
| `VendorCard.js` | Service API + wishlist action |

## Current mock replacements

```text
CATEGORIES
   ↓
GET /api/v1/categories

VENDORS
   ↓
GET /api/v1/services

BOOKINGS
   ↓
GET /api/v1/bookings

Local images
   ↓
Cloudinary URLs
```

---

# 9. V1 Data Flow

## Home

```text
HomeScreen
   ↓
useHome()
   ↓
GET /api/v1/home
   ↓
Express
   ↓
Prisma
   ↓
PostgreSQL
```

## Service image upload

```text
Vendor Dashboard / Mobile
   ↓
POST /uploads/signature
   ↓
Express creates Cloudinary signature
   ↓
Client uploads directly to Cloudinary
   ↓
Cloudinary returns URL + public_id
   ↓
Client sends metadata to Express
   ↓
Prisma stores ServiceImage
```

## Booking

```text
Customer
   ↓
BookingScreen
   ↓
POST /bookings
   ↓
Validate request
   ↓
Load service from PostgreSQL
   ↓
Calculate price on server
   ↓
Create Booking(PENDING)
   ↓
Return booking
   ↓
Customer sees request submitted
```

## Vendor decision

```text
Vendor Dashboard
   ↓
GET /vendor/bookings
   ↓
Open pending booking
   ↓
Accept / Reject
   ↓
PATCH /vendor/bookings/:id/status
   ↓
Customer sees new status
```

---

# 10. Security Requirements for V1

Even though V1 is small, these should not be skipped.

- [ ] Validate all request bodies.
- [ ] Never trust client-supplied price.
- [ ] Never expose Cloudinary API secret.
- [ ] Authenticate protected endpoints.
- [ ] Verify resource ownership.
- [ ] Enforce customer/vendor/admin roles server-side.
- [ ] Rate-limit OTP endpoint.
- [ ] Sanitize/validate uploaded files through Cloudinary configuration and application rules.
- [ ] Keep secrets in environment variables.
- [ ] Do not log OTPs or sensitive authentication data in production.

---

# 11. Testing Plan

## Backend unit tests

Focus on business logic:

```text
price calculation
booking creation
booking status transitions
wishlist uniqueness
authorization
```

## API integration tests

Test:

```text
Auth
Services
Wishlist
Bookings
Vendor booking actions
```

## Main E2E test

```text
Login
  ↓
Home
  ↓
Category
  ↓
Service details
  ↓
Book
  ↓
Booking created
  ↓
Vendor accepts
  ↓
Customer sees CONFIRMED
```

This is the most important V1 test.

---

# 12. Suggested Development Order

Since the frontend is already built, work in this exact order:

```text
1. Frontend API layer
        ↓
2. Express + Prisma + PostgreSQL
        ↓
3. Database schema + seed
        ↓
4. Authentication
        ↓
5. Cloudinary upload
        ↓
6. Home / categories / services APIs
        ↓
7. Connect Home + Category + Details
        ↓
8. Wishlist
        ↓
9. Booking API
        ↓
10. Connect Booking screen
        ↓
11. My Bookings
        ↓
12. Vendor dashboard
        ↓
13. Minimal admin
        ↓
14. Testing + deployment
```

---

# 13. V1 Definition of Done

V1 is complete when this works end-to-end:

```text
Vendor
  ↓
creates a service
  ↓
service appears in customer app

Customer
  ↓
logs in
  ↓
finds service
  ↓
opens details
  ↓
selects date/time/duration
  ↓
submits booking
  ↓
booking is stored in PostgreSQL

Vendor
  ↓
sees booking
  ↓
accepts booking

Customer
  ↓
opens My Bookings
  ↓
sees CONFIRMED
```

Everything beyond this is optional for V1.

---

# 14. Recommended V1 Milestones

## Milestone A: Backend Ready

```text
Express + Prisma + PostgreSQL
Auth
Schema
Seed
Cloudinary
```

## Milestone B: Customer Marketplace Ready

```text
Home
Categories
Search
Details
Wishlist
```

## Milestone C: Booking Ready

```text
Create booking
My bookings
Booking status
Cancel
```

## Milestone D: Vendor Ready

```text
Create service
Manage service
Accept/reject booking
```

## Milestone E: Launch Ready

```text
Admin controls
Testing
Error handling
Production deployment
```

---

# 15. V1 Architecture Summary

```text
                    ┌──────────────────────┐
                    │   Expo React Native  │
                    │ Existing UI + Logic  │
                    └──────────┬───────────┘
                               │
                               │ REST
                               ▼
                    ┌──────────────────────┐
                    │      Express.js      │
                    │                      │
                    │ Auth                 │
                    │ Services             │
                    │ Wishlist             │
                    │ Bookings             │
                    │ Vendor               │
                    │ Admin                │
                    └──────────┬───────────┘
                               │
                            Prisma
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    └──────────────────────┘

Expo / Vendor Dashboard
           │
           │ direct image upload
           ▼
      ┌──────────────┐
      │  Cloudinary  │
      └──────────────┘
```

## Core V1 principle

**Keep the UI you already built. Build only the backend and integration required to make the core marketplace transaction real.**
