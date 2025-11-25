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
    const {group_id, datum} = req.query;
    if(!group_id) {
        return res.status(400).json({ error: "group_id is required for viewing Termin"});
    }
    let sql = "SELECT * FROM Termin WHERE fk_group_id = ?";
    const params = [group_id];
    if(datum) {
        sql += " AND datum = ?";
        params.push(datum);
    } else {
        sql += " ORDER BY datum, bezeichnung"
    }
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch termine" });
  }
});

app.get("/gruppe", async (req, res) => {
    try {
        const {group_id, invite_code} = req.query;
        let sql = "SELECT * FROM Gruppe";
        const params = [];
        if(group_id) {
          sql += " WHERE pk_group_id = ?";
          params.push(group_id);
        } else if (invite_code) {
          sql += " WHERE invite_code = ?";
          params.push(invite_code);
        } else {
          return res.status(400).json({ error: "group_id or invite_code is required for viewing gruppe"});
        }
        const rows = await runQuery(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch gruppe"})
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




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});