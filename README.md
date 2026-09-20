# 🏢 Coworking Space Booking System
### Enterprise Full-Stack Web Application (React/Next.js + Java Spring Boot 3 + PostgreSQL)

ออกแบบเชิง **Object-Oriented Programming (OOP)** อย่างถูกต้องตามหลักการ 4 เสาหลัก:
- **Encapsulation:** ซ่อน State และ Validate Business Invariant ผ่าน Java Entity, DTOs และ Private Fields
- **Inheritance:** `Room` (Base) ➔ `HotDeskRoom`, `MeetingRoom`, `PrivateOfficeRoom`, `PhoneBoothRoom` และ `Member` (Base) ➔ `RegisteredMember`, `GuestMember`
- **Polymorphism:** เมธอด `calculatePrice(durationHours)` และ Strategy Pattern `calculateDiscount()`
- **Abstraction:** `IDiscountStrategy`, `IBookingService` และ Abstract Base Classes
- **Concurrency & Race Condition Safety:** ป้องกัน Double Booking ด้วย `@Lock(LockModeType.PESSIMISTIC_WRITE)` และ PostgreSQL Exclusion Constraint (`EXCLUDE USING gist`)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)
```
Coworking Space Booking System/
├── backend/                  # Java Spring Boot 3 + Spring Data JPA
│   ├── pom.xml
│   └── src/main/java/com/coworking/booking/
│       ├── domain/model/     # OOP Entities (Workspace, Room Subclasses, Member, Booking)
│       ├── domain/strategy/  # Strategy Pattern (Discount Strategies)
│       ├── repository/       # Spring Data JPA with Pessimistic Locking
│       ├── service/          # Business Logic & Quota/Conflict Calculation
│       ├── controller/       # REST API Endpoints
│       ├── dto/              # Request / Response DTOs
│       └── exception/        # Global Exception Handler (@ControllerAdvice)
├── frontend/                 # Next.js 14 / React App Router + Tailwind CSS
│   ├── package.json
│   └── src/app/
│       ├── page.tsx          # Interactive Dashboard & Room Explorer
│       └── globals.css
└── database/                 # PostgreSQL DDL Schema & Data Seeds
    ├── schema.sql
    └── seed.sql
```

---

## 🚀 วิธีการรันระบบ (Quickstart)

### 1. Database Setup (PostgreSQL)
```bash
# สร้าง Database
createdb -U postgres coworking_db

# รัน Script สร้างตารางและข้อมูลตั้งต้น
psql -U postgres -d coworking_db -f database/schema.sql
psql -U postgres -d coworking_db -f database/seed.sql
```

บัญชีผู้ดูแลระบบเริ่มต้น: `admin@admin.co.th` / `admin123` โดยผู้ดูแลเท่านั้นที่อนุมัติคำขอจองได้จาก `/admin`

### 2. Backend Setup (Java Spring Boot)
```bash
cd backend

# รัน Unit Tests (Polymorphism & Strategy Tests)
mvn test

# เริ่มต้นรัน Backend Server (Port: 8080)
mvn spring-boot:run
```

### 3. Frontend Setup (Next.js / React)
```bash
cd frontend

# ติดตั้ง Dependencies
npm install

# รัน Development Server (Port: 3000)
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`
