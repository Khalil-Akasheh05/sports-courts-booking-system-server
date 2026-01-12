import express from "express";
import pgClient from "../db.js";

const userRoutes = express.Router();

userRoutes.get("/explore-sports", async (req, res) => {
  try {
    const sports = await pgClient.query("SELECT * FROM sports LIMIT 3");
    res.status(200).json(sports.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/sports", async (req, res) => {
  try {
    const sports = await pgClient.query("SELECT * FROM sports");
    res.status(200).json(sports.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/courts/:sportId", async (req, res) => {
  try {
    const courts = await pgClient.query(
      "SELECT * FROM courts WHERE sport_id = $1 AND is_disabled = false",
      [req.params.sportId]
    );
    res.status(200).json(courts.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/time-slots/:courtId", async (req, res) => {
  try {
    const timeSlots = await pgClient.query(
      "SELECT * FROM time_slots ts WHERE ts.court_id = $1 AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.time_slot_id = ts.id)",
      [req.params.courtId]
    );
    res.status(200).json(timeSlots.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.post("/book/:courtId", async (req, res) => {
  const { booking_date, user_id, time_slot_id } = req.body;
  try {
    const booking = await pgClient.query(
      "INSERT INTO bookings (booking_date, user_id, court_id, time_slot_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [booking_date, user_id, req.params.courtId, time_slot_id]
    );
    res.status(201).json(booking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/bookings/:userId", async (req, res) => {
  try {
    const bookings = await pgClient.query(
      "SELECT * FROM bookings WHERE user_id = $1 AND booking_date >= CURRENT_DATE ORDER BY booking_date ASC",
      [req.params.userId]
    );
    res.status(200).json(bookings.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.patch("/bookings/:bookingId", async (req, res) => {
  const { booking_date, time_slot_id } = req.body;
  try {
    const updateBooking = await pgClient.query(
      "UPDATE bookings SET booking_date = $1, time_slot_id = $2 WHERE id = $3 RETURNING *",
      [booking_date, time_slot_id, req.params.bookingId]
    );
    res.status(200).json(updateBooking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.delete("/bookings/:bookingId", async (req, res) => {
  try {
    const deletebooking = await pgClient.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [req.params.bookingId]
    );
    res.status(200).json(deletebooking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default userRoutes;