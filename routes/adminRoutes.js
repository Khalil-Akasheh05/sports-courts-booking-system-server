import express from "express";
import pgClient from "../db.js";
import adminAuthorization from "../middlewares/adminAuthorization.js";

const adminRoutes = express.Router();

adminRoutes.get("/dashboard-stats", adminAuthorization, async (req, res) => {
  try {
    const revenueResult = await pgClient.query(
      "SELECT COALESCE(SUM(c.price), 0) as total_revenue FROM bookings b JOIN courts c ON b.court_id = c.id "
    );
    const bookingsResult = await pgClient.query(
      "SELECT COUNT(*) as total_bookings from bookings"
    );
    const usersResult = await pgClient.query(
      "SELECT COUNT(*) as total_users from users"
    );
    res.json({
      total_revenue: revenueResult.rows[0].total_revenue,
      total_bookings: bookingsResult.rows[0].total_bookings,
      total_users: usersResult.rows[0].total_users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.get("/bookings/limit", adminAuthorization, async (req, res) => {
  try {
    const latestBookings = await pgClient.query(
      "SELECT * FROM bookings ORDER BY booking_date DESC, id DESC LIMIT 5"
    );
    res.status(200).json(latestBookings.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.get("/sports", adminAuthorization, async (req, res) => {
  try {
    const sports = await pgClient.query("SELECT * FROM sports");
    res.status(200).json(sports.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.post("/sports", adminAuthorization, async (req, res) => {
  const { name, image_url } = req.body;
  try {
    const newSport = await pgClient.query(
      "INSERT INTO sports (name, image_url) VALUES ($1, $2) RETURNING *",
      [name, image_url]
    );
    res.status(201).json(newSport.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.delete("/sports/:sportId", adminAuthorization, async (req, res) => {
  try {
    const deleteSport = await pgClient.query(
      "DELETE FROM sports WHERE id = $1 RETURNING *",
      [req.params.sportId]
    );
    res.status(200).json(deleteSport.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.get("/courts/:sportId", adminAuthorization, async (req, res) => {
  try {
    const courts = await pgClient.query(
      "SELECT * FROM courts WHERE sport_id = $1",
      [req.params.sportId]
    );
    res.status(200).json(courts.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.post("/courts/:sportId", adminAuthorization, async (req, res) => {
  const { type, price, image_url } = req.body;
  try {
    const newCourt = await pgClient.query(
      "INSERT INTO courts (court_type, price, image_url, sport_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [type, price, image_url, req.params.sportId]
    );
    res.status(201).json(newCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.delete("/courts/:courtId", adminAuthorization, async (req, res) => {
  try {
    const deleteCourt = await pgClient.query(
      "DELETE FROM courts WHERE id = $1 RETURNING *",
      [req.params.courtId]
    );
    res.status(200).json(deleteCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.patch("/courts/:courtId", adminAuthorization, async (req, res) => {
  const { price } = req.body;
  try {
    const updateCourt = await pgClient.query(
      "UPDATE courts SET price = $1 WHERE id = $2 RETURNING *",
      [price, req.params.courtId]
    );
    res.status(200).json(updateCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.patch("/courts/:courtId/disable", adminAuthorization, async (req, res) => {
  try {
    const disableCourt = await pgClient.query(
      "UPDATE courts SET is_disabled = true WHERE id = $1 RETURNING *",
      [req.params.courtId]
    );
    res.status(200).json(disableCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.patch("/courts/:courtId/enable", adminAuthorization, async (req, res) => {
  try {
    const enableCourt = await pgClient.query(
      "UPDATE courts SET is_disabled = false WHERE id = $1 RETURNING *",
      [req.params.courtId]
    );
    res.status(200).json(enableCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRoutes.get("/bookings", adminAuthorization, async (req, res) => {
  try {
    const bookings = await pgClient.query("SELECT * FROM bookings");
    res.status(200).json(bookings.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default adminRoutes;