import express from "express";
import pgClient from "../db.js";
import adminAuthorization from "../middlewares/adminAuthorization.js";

const adminRoutes = express.Router();

adminRoutes.get("/stats", adminAuthorization, async (req, res) => {
  try {
    const revenueResult = await pgClient.query(
      "SELECT COALESCE(SUM(bookings.booking_price), 0) as total_revenue FROM bookings",
    );
    const bookingsResult = await pgClient.query(
      "SELECT COUNT(*) as total_bookings from bookings",
    );
    const usersResult = await pgClient.query(
      "SELECT COUNT(*) as total_users from users",
    );
    res.json({
      total_revenue: revenueResult.rows[0].total_revenue,
      total_bookings: bookingsResult.rows[0].total_bookings,
      total_users: usersResult.rows[0].total_users,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats." });
  }
});

adminRoutes.get("/latest-bookings", adminAuthorization, async (req, res) => {
  try {
    const latestBookings = await pgClient.query(
      `SELECT
        b.id,
        b.booking_date,
        b.created_at,

        u.id AS user_id,
        u.full_name AS user_name,
        u.email AS user_email,

        s.id AS sport_id,
        s.name AS sport_name,

        c.id AS court_id,
        c.number AS court_number,
        c.court_type,
        c.price AS court_price,
        c.image_url AS court_image,

        ts.id AS time_slot_id,
        ts.start_time,
        ts.end_time

      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN courts c ON b.court_id = c.id
      JOIN sports s ON c.sport_id = s.id
      JOIN time_slots ts ON b.time_slot_id = ts.id

      ORDER BY b.created_at DESC
      LIMIT 5`,
    );
    res.status(200).json(latestBookings.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load latest bookings." });
  }
});

adminRoutes.get("/sports", adminAuthorization, async (req, res) => {
  try {
    const sports = await pgClient.query("SELECT * FROM sports");
    res.status(200).json(sports.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load sports." });
  }
});

adminRoutes.post("/sports", adminAuthorization, async (req, res) => {
  const { name, image_url } = req.body;
  try {
    const newSport = await pgClient.query(
      "INSERT INTO sports (name, image_url) VALUES ($1, $2) RETURNING *",
      [name, image_url],
    );
    res.status(201).json(newSport.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to add sport. Please try again." });
  }
});

adminRoutes.delete("/sports/:sportId", adminAuthorization, async (req, res) => {
  try {
    const deleteSport = await pgClient.query(
      "DELETE FROM sports WHERE id = $1 RETURNING *",
      [req.params.sportId],
    );
    res.status(200).json(deleteSport.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete sport. Please try again." });
  }
});

adminRoutes.get("/courts/:sportId", adminAuthorization, async (req, res) => {
  try {
    const courts = await pgClient.query(
      "SELECT * FROM courts WHERE sport_id = $1",
      [req.params.sportId],
    );
    res.status(200).json(courts.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load courts." });
  }
});

adminRoutes.post("/courts/:sportId", adminAuthorization, async (req, res) => {
  const { court_type, price, image_url, number } = req.body;
  try {
    const newCourt = await pgClient.query(
      "INSERT INTO courts (court_type, price, image_url, sport_id, number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [court_type, price, image_url, req.params.sportId, number],
    );
    await pgClient.query(
      `INSERT INTO time_slots (court_id, start_time, end_time) VALUES
   ($1, '12:00', '13:00'),
   ($1, '13:00', '14:00'),
   ($1, '14:00', '15:00'),
   ($1, '15:00', '16:00'),
   ($1, '16:00', '17:00'),
   ($1, '17:00', '18:00'),
   ($1, '18:00', '19:00'),
   ($1, '19:00', '20:00'),
   ($1, '20:00', '21:00'),
   ($1, '21:00', '22:00')`,
      [newCourt.rows[0].id],
    );
    res.status(201).json(newCourt.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to add court. Please try again." });
  }
});

adminRoutes.delete("/courts/:courtId", adminAuthorization, async (req, res) => {
  try {
    const deleteCourt = await pgClient.query(
      "DELETE FROM courts WHERE id = $1 RETURNING *",
      [req.params.courtId],
    );
    res.status(200).json(deleteCourt.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete court. Please try again." });
  }
});

adminRoutes.patch("/courts/:courtId", adminAuthorization, async (req, res) => {
  const { price } = req.body;
  try {
    const updateCourt = await pgClient.query(
      "UPDATE courts SET price = $1 WHERE id = $2 RETURNING *",
      [price, req.params.courtId],
    );
    res.status(200).json(updateCourt.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update court. Please try again." });
  }
});

adminRoutes.patch(
  "/courts/:courtId/disable",
  adminAuthorization,
  async (req, res) => {
    try {
      const disableCourt = await pgClient.query(
        "UPDATE courts SET is_disabled = true WHERE id = $1 RETURNING *",
        [req.params.courtId],
      );
      res.status(200).json(disableCourt.rows[0]);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to disable court. Please try again." });
    }
  },
);

adminRoutes.patch(
  "/courts/:courtId/enable",
  adminAuthorization,
  async (req, res) => {
    try {
      const enableCourt = await pgClient.query(
        "UPDATE courts SET is_disabled = false WHERE id = $1 RETURNING *",
        [req.params.courtId],
      );
      res.status(200).json(enableCourt.rows[0]);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to enable court. Please try again." });
    }
  },
);

adminRoutes.get("/bookings", adminAuthorization, async (req, res) => {
  try {
    const bookings = await pgClient.query(`SELECT
  b.id,
  b.booking_date,

  u.full_name AS user_name,
  u.email AS user_email,

  s.name AS sport_name,

  c.number AS court_number,
  c.court_type,
  b.booking_price AS booking_price,
  c.image_url AS court_image,

  ts.start_time,
  ts.end_time
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN courts c ON b.court_id = c.id
JOIN sports s ON c.sport_id = s.id
JOIN time_slots ts ON b.time_slot_id = ts.id
ORDER BY b.booking_date DESC, ts.start_time ASC;
`);
    res.status(200).json(bookings.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings." });
  }
});

export default adminRoutes;
