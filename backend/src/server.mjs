import express from "express";
import cors from "cors";
import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());


const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "TimeSight",
  connectionLimit: 5,
});

async function runQuery(query, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(query, params);
    return result;
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// Example GET (read data)
app.get("/termin", async (req, res) => {
  try {
    const rows = await runQuery("SELECT * FROM Termin");
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch termine" });
  }
});

// Example POST (create data)
app.post("/termin", async (req, res) => {
  const { bezeichnung, beschreibung, datum } = req.body;

  if (!bezeichnung || !beschreibung, datum) {
    return res.status(400).json({ error: "bezeichnung, beschreibung, datum are required" });
  }

  try {
    const result = await runQuery(
      "INSERT INTO Termin VALUES (null, ?, ?, ?, FALSE, 0, 0)",
      [bezeichnung, beschreibung, datum]
    );

    res.status(201).json({ id: result.insertId, beschreibung, bezeichnung, datum });
  } catch {
    res.status(500).json({ error: "Failed to create Termin" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => res.send("OK"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});