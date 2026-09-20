# 📡 REST API Endpoint Specification

**Base URL:** `/api/v1`  
**Authentication:** Header `Authorization: Bearer <JWT_TOKEN>`  
**Content-Type:** `application/json`

---

## 1. Authentication & Member Endpoints

### 1.1 `POST /auth/login`
- **Request Body:**
```json
{
  "email": "alex.tech@antigravity.dev",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member": {
    "memberId": "MEM-001",
    "name": "Alex Kittisuk",
    "email": "alex.tech@antigravity.dev",
    "membershipTier": "Pro"
  }
}
```

---

## 2. Workspaces & Rooms Endpoints

### 2.1 `GET /workspaces`
- **Response (200 OK):**
```json
[
  {
    "workspaceId": "WS-ASOKE",
    "name": "Antigravity Hub Sukhumvit",
    "location": "Interchange 21, Level 24, BTS Asoke, Bangkok",
    "openingHours": "07:00 - 23:00",
    "amenities": ["1 Gbps Fiber WiFi", "Specialty Espresso Bar", "Ergonomic Chairs"],
    "rooms": [...]
  }
]
```

---

## 3. Quotation & Pricing Engine

### 3.1 `POST /bookings/quote`
- **Request Body:**
```json
{
  "roomId": "RM-MTG-201",
  "startTime": "2026-09-10T14:00:00Z",
  "endTime": "2026-09-10T16:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "durationHours": 2.0,
  "basePricePerHour": 450.00,
  "basePrice": 1050.00,
  "discountRateTier": "Pro",
  "discountAmount": 157.50,
  "totalPrice": 892.50
}
```

---

## 4. Bookings Management

### 4.1 `POST /bookings`
- **Request Body:**
```json
{
  "roomId": "RM-MTG-201",
  "startTime": "2026-09-10T14:00:00Z",
  "endTime": "2026-09-10T16:00:00Z"
}
```
- **Response (201 Created):**
```json
{
  "bookingId": "BK-A9F3E1",
  "memberId": "MEM-001",
  "roomId": "RM-MTG-201",
  "startTime": "2026-09-10T14:00:00.000Z",
  "endTime": "2026-09-10T16:00:00.000Z",
  "status": "Confirmed",
  "basePrice": 1050.00,
  "discountAmount": 157.50,
  "totalPrice": 892.50
}
```

### 4.2 `POST /bookings/:bookingId/cancel`
- **Response (200 OK):**
```json
{
  "bookingId": "BK-A9F3E1",
  "status": "Cancelled",
  "cancellationReason": "User requested cancellation"
}
```
