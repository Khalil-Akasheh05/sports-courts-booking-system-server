import express from "express";
import pgClient from "../db.js";
import pg from "pg";

pg.types.setTypeParser(1082, (value) => value);
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

userRoutes.get("/time-slots/:courtId/:date", async (req, res) => {
  try {
    const timeSlots = await pgClient.query(
      "SELECT * FROM time_slots ts WHERE ts.court_id = $1 AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.time_slot_id = ts.id AND b.booking_date = $2) ORDER BY ts.start_time ASC",
      [req.params.courtId, req.params.date]
    );
    res.status(200).json(timeSlots.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/time-slots/:courtId/:date/:bookingId", async (req, res) => {
  try {
    const timeSlots = await pgClient.query(
      `
      SELECT *
      FROM time_slots ts
      WHERE ts.court_id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.time_slot_id = ts.id
            AND b.booking_date = $2
            AND b.id != $3
        )
      ORDER BY ts.start_time ASC
      `,
      [req.params.courtId, req.params.date, req.params.bookingId]
    );

    res.status(200).json(timeSlots.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.post("/book/:courtId", async (req, res) => {
  const { booking_date, user_id, time_slot_id } = req.body;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(booking_date);

    if (selectedDate < today) {
      return res.status(400).json({
        error: "You cannot book a court for a past date",
      });
    }

    const court = await pgClient.query(
      "SELECT price FROM courts where id = $1",
      [req.params.courtId]
    );

    const booking = await pgClient.query(
      "INSERT INTO bookings (booking_date, user_id, court_id, time_slot_id, booking_price) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        booking_date,
        Number(user_id),
        Number(req.params.courtId),
        Number(time_slot_id),
        court.rows[0].price,
      ]
    );
    res.status(201).json(booking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userRoutes.get("/bookings/:userId", async (req, res) => {
  try {
    const bookings = await pgClient.query(
      `SELECT
        b.id,
        b.booking_date::date,
        b.court_id,         
        b.time_slot_id,      

        s.name AS sport_name,

        c.number AS court_number,
        c.court_type,
        b.booking_price AS booking_price,
        c.image_url AS court_image,

        ts.start_time,
        ts.end_time
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN sports s ON c.sport_id = s.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.user_id = $1
        AND b.booking_date >= CURRENT_DATE
      ORDER BY b.booking_date ASC, ts.start_time ASC
      `,
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
     const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(booking_date);

    if (selectedDate < today) {
      return res.status(400).json({
        error: "You cannot book a court for a past date",
      });
    }
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

userRoutes.get("/court/:courtId", async(req, res)=>{
  try{
    const court = await pgClient.query( `
      SELECT 
        c.*,
        s.name AS sport_name
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      WHERE c.id = $1
      `,
      [req.params.courtId])
      res.status(200).json(court.rows[0])
  } catch(err){
    res.status(500).json({error: err.message })
  }
})

export default userRoutes;
