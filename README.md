# Sports-Courts-Booking-System (Express + PostgreSQL)

This is the **backend** for the fullstack sports-courts-booking-system. It provides APIs for authentication, admin, and users.

## Tech Stack

- Node.js + Express
- PostgreSQL (via 'pg')
- 'dotenv', 'cors', 'morgan'


## Getting Started

```bash
# 1. Install dependencies
cd sports-courts-booking-system-server
npm install

# 2. Create a PostgreSQL database

# 3. Start the server
node server.js
```


## Project Structure
```
sports-courts-booking-system/
├── routes/
| ├── authenticationRoutes.js
| ├── adminRoutes.js
| └── userRoutes.js
├── middlewares/
| └── adminAuthorization.js
├── schema.sql
├── db.js
└── server.js
```


## API Endpoints

The API will run on http://localhost:5000

### Authentication Routes

**Base URL**: `/api/auth`

| Method | Endpoint    | Description       
|--------|-------------|-------------------
| POST   | `/signup`   | Register new user 
| POST   | `/login`    | Log in existing user

### POST `/api/auth/signup`

Register a new user (user role)
```json
{
    "full_name": "User Name",
    "email": "user@example.com",
    "password": "12345"
}
```

### POST `/api/auth/login`

Log in an existing user
```json
{
    "email": "user@example.com",
    "password": "12345"
}
```

### Admin Routes

**Base URL**: `/api/admin`

Admin requests must include:
```json
{
    "x-role": "admin"
}
```

| Method | Endpoint    | Description       
|--------|-------------|-------------------
| GET   | `/stats`   | Get stats such as total_revenue, total_booking, and total users 
| GET   | `/latest-bookings`    | Get the latest 5 bookings
| GET   | `/sports`    | Get all sports
| POST   | `/sports`    | Add a new sport
| DELETE   | `/sports/:sportId`    | Delete a sport
| GET   | `/courts/:sportId`    | Get all courts for a sport
| POST   | `/courts/:sportId`    | Add a new court for a sport
| DELETE   | `/courts/:courtId`    | Delete a court
| PATCH   | `/courts/courtId`    | Update price of a court
| PATCH   | `/courts/:courtId/disable`    | Disable a court
| PATCH   | `/courts/:courtId/enable`    | Enable a court
| GET   | `/bookings`    | Get all bookings

### GET `/api/admin/stats`
```
Returns stats such as Total Revenue, Total Bookings, and total users.
Needs x-role: admin header.
```

### GET `/api/admin/latest-bookings`
```
Returns the latest 5 bookings.
Needs x-role: admin header.
```

### GET `/api/admin/sports`
```
Returns all sports.
Needs x-role: admin header.
```

### POST `/api/admin/sports`
```json
{
    "name": "Sport Name",
    "image_url": "https:/****"
}
```

### DELETE `/api/admin/sports/:sportId`
```
No request body neeed. Just the sport ID and
x-role: admin header,
```

### GET `/api/admin/courts/:sportId`
```
Returns all courts for a sport.
Needs sport ID and x-role: admin header.
```

### POST `/api/admin/courts/:sportId`
```json
{
    "number": "1",
    "court_type": "Indoor",
    "price": "20",
    "image_url": "https:/***"
}
```

### DELETE `/api/admin/courts/:courtId`
```
No request body needed. Just the court ID and
x-role: admin header,
```

### PATCH `/api/admin/courts/:courtId`
```json
{
    "price": "15"
}
```

### PATCH `/api/admin/courts/:courtId/disable`
```
No body needed. Just the court ID and
x-role: admin header.
```

### PATCH `/api/admin/courts/:courtId/disable`
```
No body needed. Just the court ID and
x-role: admin header.
```

### GET `/api/admin/bookings`
```
Returns all bookings.
Needs x-role: admin header.
```

### Admin Routes

**Base URL**: `/api/user`

| Method | Endpoint    | Description       
|--------|-------------|-------------------
| GET   | `/explore-sports`   | Get 3 sports 
| GET   | `/sports`    | Get the sports
| GET   | `/courts/sportId`    | Get all courts for a sport
| GET   | `/time-slots/:courtId/:date`    | Returns all available time slots for a specific court on a specific date
| GET   | `/time-slots/:courtId/:date/:bookingId`    | Returns all available time slots for a court on a specific date, while ignoring the current booking being edited so its time slot still appears
| POST   | `/booking/:courtId`    | Create a new booking for a court on a selected date and time slot, and prevents booking past dates.
| GET   | `/bookings/:userId`    | Get all bookings for a user
| PATCH   | `/bookings/:bookingId`    | Update booking date and/or time
| DELETE   | `/bookings/:bookingId`    | Delete a booking
| GET   | `/court/:courtId`    | Get court information along with the sport name

## GET `/api/user/explore-sports`
```
Returns 3 sports.
```

### GET `/api/user/sports`
```
Returns all sports.
```

### GET `/api/user/courts/:sportId`
```
Returns all courts for a sport.
Needs sport ID.
```

### GET `/api/user/time-slots/:courtId/:date`
```
Returns all available time slots for a specific court on a specific date.
Needs court ID and date.
```

### GET `/api/user/time-slots/:courtId/:date/:bookingId`
```
Returns all available time slots for a court on a specific date, while ignoring the current booking being edited so its time slot still appears.
Needs court ID, date, and booking ID.
```

### POST `/api/user/booking/:courtId`
```json
{
    "booking_date": "5/2/2026",
    "user_id": "3",
    "time_slot_id": "1"
}
```

### GET `/api/user/bookings/:userId`
```
Get all booking for a user along with the booking details like sport name, court number, court type, booking date, and time.
Needs user ID.
```

### PATCH `/api/user/bookings/:bookingId`
```json
{
    "booking_date": "30-1-2025",
    "time_slot_id": "2"
}
```

### DELETE `/api/user/bookings/:bookingId`
```
No body needed.Just the booking ID.
```

### GET `/api/user/court/:courtId`
```
Get court information along with the sport name.
Needs court ID.
```