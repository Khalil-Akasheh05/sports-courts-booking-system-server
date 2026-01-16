import express from "express";
import pgClient from "../db.js";

const authenticationRoutes = express.Router();

authenticationRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pgClient.query(
      "SELECT id, full_name, email, role FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authenticationRoutes.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const existingUser = await pgClient.query("SELECT * FROM users WHERE email = $1", [email])
    if(existingUser.rows.length>0){
      return res.status(400).json({error: "User already exists"})
    }
    const user = await pgClient.query(
      "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [full_name, email, password]
    );
    res.status(201).json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default authenticationRoutes;