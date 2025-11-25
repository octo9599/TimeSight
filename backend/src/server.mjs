import express from "express";
import cors from "cors";
import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

//initialize app
const app = express();
app.use(cors());
app.use(express.json());


//connect to the database
const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "TimeSight",
  connectionLimit: 5,
});

//function for executing sql statements cleanly and safely.
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



//GETs (Reading Data/SELECT Statements)

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

//Get tasks, either per group or per group and date.
app.get("/termin", async (req, res) => {
  try {
    const {group_id, datum, ist_erledigt} = req.query;
    if(!group_id) {
        return res.status(400).json({ error: "group_id is required for viewing tasks"});
    }
    let sql = "SELECT * FROM Termin WHERE fk_group_id = ? AND ist_erledigt = false";
    const params = [group_id];
    if(ist_erledigt) {
      sql += " AND ist_erledigt = ?";
      params.push(ist_erledigt);
    }
    if(datum) {
        sql += " AND datum = ?";
        params.push(datum);
    } else {
        sql += " ORDER BY datum, bezeichnung"
    }
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

//Get a group, either through group_id or per invite_code
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
          return res.status(400).json({ error: "group_id or invite_code is required for viewing groups"});
        }
        const rows = await runQuery(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch gruppe"})
    }
});

//Get a user through user_id
app.get("/user", async (req, res) => {
    try {
        const {user_id} = req.params;
        let sql = "SELECT * FROM User WHERE pk_user_id = ?";
        const params = [user_id];
        if(!user_id) {
          return res.status(400).json({ error: "user_id is required for viewing a user"});
        }
        const rows = await runQuery(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"})
    }
});

//Get all users of a group and their group-rights through a group_id
app.get("/gruppe/:group_id/user", async (req, res) => {
    try {
        const {group_id} = req.params;
        let sql = "SELECT u.*, gu.ist_admin, gu.kann_bearbeiten, gu.kann_loeschen FROM User u INNER JOIN Gruppe_User gu ON pk_user_id = gu.fk_user_id WHERE gu.fk_group_id = ?";
        const params = [group_id];
        if(!group_id) {
          return res.status(400).json({ error: "group_id is required for viewing users in a group"});
        }
        const rows = await runQuery(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"})
    }
});



//POSTs (create new Data/INSERTs)

//Create a new Task
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



//Define on which port the backend runs.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});