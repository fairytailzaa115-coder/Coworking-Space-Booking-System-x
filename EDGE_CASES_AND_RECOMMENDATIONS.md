# 🛡️ Edge Cases, Concurrency & Production Architecture

## 1. Concurrency & Race Condition Prevention
- **Database Exclusion Constraint:** PostgreSQL `EXCLUDE USING gist (room_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&)`
- **Application Level Mutex Lock:** Per-room lock prevents simultaneous transaction races.
- **Distributed Locking:** In microservice clusters, Redis Redlock guarantees single execution per room-timeslot.

## 2. Timezone Integrity
- Database stores UTC timestamps (`TIMESTAMPTZ`).
- UI renders converted local time in `Asia/Bangkok` (UTC+7).

## 3. Ghost Bookings & Timeout Release
- BullMQ Redis Delayed Queue cancels `Pending` bookings if unpaid after 15 minutes.
