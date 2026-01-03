import express from "express";
import cors from "cors";
import mariadb from "mariadb";
import dotenv from "dotenv";
import crypto from "crypto";
import auth from "./auth.mjs";
import jwt from "jsonwebtoken";

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Check your .env file.");
}

//initialize app
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());


//connect to the database
const pool = mariadb.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "TimeSight",
    connectionLimit: 5,
    dateStrings: true,
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
        if (conn) await conn.release();
    }
}


//GETs (Reading Data/SELECT Statements)

//Test Get to make sure API is running in the first place.
app.get("/", (req, res) => {
    res.json({message: "API is running!"});
});

//Get a task through an id
app.get("/termin/:termin_id", async (req, res) => {
    try {
        const {termin_id} = req.params;
        if (!termin_id) {
            return res.status(400).json({error: "termin_id is required for viewing a task"});
        }
        const rows = await runQuery("SELECT * FROM Termin WHERE pk_termin_id = ?", [termin_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch tasks"});
    }
});

//Get tasks of a group. Has the option to list tasks of a specific date. 
//Lists completed tasks if 'ist_erledigt=1' is in query, otherwise only lists uncompleted tasks.
//Only lists uncompleted past due exams if 'is_past_due=1' is in query.
app.get("/gruppe/:group_id/termin", async (req, res) => {
    try {
        const {group_id} = req.params;
        const {datum, is_past_due, ist_erledigt} = req.query;
        if (!group_id) {
            return res.status(400).json({error: "group_id is required for viewing tasks of a group"});
        }
        let sql = "SELECT * FROM Termin WHERE fk_group_id = ?";
        const params = [group_id];

        if (is_past_due == 1) {
            sql += " AND ist_erledigt = false AND datum < CURDATE()";
        } else if (ist_erledigt == 1) {
            sql += " AND ist_erledigt = true";
        } else {
            sql += " AND datum >= CURDATE() AND ist_erledigt = false";
        }

        if (datum) {
            sql += " AND datum = ?";
            params.push(datum);
        }
        sql += " ORDER BY datum, bezeichnung";

        const rows = await runQuery(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch tasks"});
    }
});

//Get a group through a group_id
app.get("/gruppe/:group_id", async (req, res) => {
    try {
        const {group_id} = req.params;
        if (!group_id) {
            return res.status(400).json({error: "group_id is required for viewing a group"});
        }
        const rows = await runQuery("SELECT * FROM Gruppe WHERE pk_group_id = ?", [group_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch gruppe"})
    }
});

//Get a group through an invite_code
app.get("/gruppe", async (req, res) => {
    try {
        const {invite_code} = req.query;
        if (!invite_code) {
            return res.status(400).json({error: "invite_code is required for viewing a group"});
        }
        const rows = await runQuery("SELECT * FROM Gruppe WHERE invite_code = ?", [invite_code]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch gruppe"})
    }
});

//get all groups of a user
app.get("/user/:user_id/gruppe", async (req, res) => {
    try {
        const {user_id} = req.params;
        if (!user_id) {
            return res.status(400).json({error: "user_id is required for viewing groups of a user"});
        }
        const rows = await runQuery("SELECT g.* FROM Gruppe g INNER JOIN Gruppe_User gu ON pk_group_id = gu.fk_group_id WHERE gu.fk_user_id = ?", [user_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch gruppe"})
    }
});

//Get a user through user_id
app.get("/user/:user_id", async (req, res) => {
    try {
        const {user_id} = req.params;
        if (!user_id) {
            return res.status(400).json({error: "user_id is required for viewing a user"});
        }
        const rows = await runQuery("SELECT * FROM User WHERE pk_user_id = ?", [user_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch user"})
    }
});

//Get user through username
app.get("/user", async (req, res) => {
    try {
        const {username} = req.query;
        if (!username) {
            return res.status(400).json({error: "username is required for viewing a user"});
        }
        const rows = await runQuery("SELECT * FROM User WHERE username = ?", [username]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch user"})
    }
});

//Login Route which does some crazy chatgpt-recommended security stuff
// (i wish i had the time to actually learn this stuff)
app.post("/login", async (req, res) => {
    try {
        const {username, passwort} = req.body;
        let sql = "SELECT * FROM User WHERE username = ?";
        if (username && passwort) {
            const rows = await runQuery(sql, username);
            const user = rows[0];
            const hashedPW = crypto.createHash("sha256").update(passwort).digest("hex");

            if (!user || user.passwort != hashedPW) {
                return res.status(401).json({error: "Invalid username or password"});
            }

            const token = jwt.sign(
                {userId: user.pk_user_id},
                process.env.JWT_SECRET,
                {expiresIn: "7d"}
            );

            res.cookie("auth", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            });

            return res.json({message: "Login successful", userId: user.pk_user_id});
        } else {
            res.status(400).json({error: "username and password are required to view a user without it's user_id."})
        }
    } catch (err) {
        res.status(500).json({message: "Failed to fetch user", error: err.toString()})
    }
});

//get the currently logged in user in a secure way
app.get("/me", auth, async (req, res) => {
    const rows = await runQuery("SELECT * FROM User WHERE pk_user_id = ?", [req.userId]);
    res.json(rows[0]);
});

//logout route, which removes the cookie that houses the users login data
app.post("/logout", (req, res) => {
    res.clearCookie("auth");
    res.json({message: "Logged out"});
});

//Get the group-rights of a user through a user_id and a group_id
app.get("/gruppe_user", async (req, res) => {
    try {
        const {user_id, group_id} = req.query;
        if (!user_id || !group_id) {
            return res.status(400).json({error: "user_id and group_id are required for viewing a user's group-rights"});
        }
        const rows = await runQuery("SELECT * FROM Gruppe_User WHERE fk_group_id = ? AND fk_user_id = ?", [group_id, user_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"});
    }
});

//Get all users of a group and their group-rights through a group_id
app.get("/gruppe/:group_id/user", async (req, res) => {
    try {
        const {group_id} = req.params;
        let sql = "SELECT u.*, gu.ist_admin, gu.kann_bearbeiten, gu.kann_loeschen FROM User u INNER JOIN Gruppe_User gu ON pk_user_id = gu.fk_user_id WHERE gu.fk_group_id = ?";
        if (!group_id) {
            return res.status(400).json({error: "group_id is required for viewing users in a group"});
        }
        const rows = await runQuery(sql, [group_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"})
    }
});

//get a specific invite_request through an anfrage_id
app.get("/beitritt_anfrage/:anfrage_id", async (req, res) => {
    try {
        const {anfrage_id} = req.params;
        if (!anfrage_id) {
            return res.status(400).json({error: "anfrage_id is required for viewing an invite-request"});
        }
        const rows = await runQuery("SELECT * FROM Beitritt_Anfrage WHERE pk_anfrage_id = ?", [anfrage_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"})
    }
});

//get all invite-requests of a group
app.get("/gruppe/:group_id/beitritt_anfrage", async (req, res) => {
    try {
        const {group_id} = req.params;
        if (!group_id) {
            return res.status(400).json({error: "group_id is required for viewing invite-requests of a group"});
        }
        const rows = await runQuery("SELECT * FROM Beitritt_Anfrage WHERE fk_group_id = ?", [group_id]);
        res.json(rows);
    } catch {
        res.status(500).json({error: "Failed to fetch users"})
    }
});


//POSTs (create new Data/INSERTs)

//Create a new Task
app.post("/termin", async (req, res) => {
    const {bezeichnung, beschreibung, datum, uhrzeit, group_id, user_id} = req.body;

    if (!bezeichnung || !datum || !uhrzeit || !group_id || !user_id) {
        return res.status(400).json({error: "bezeichnung, datum, uhrzeit, group_id and user_id are required to create a task."});
    }

    if(!beschreibung) {
        beschreibung = "";
    }

    try {
        let date_time = `${datum} ${uhrzeit}:00`;
        const result = await runQuery(
            //Termin (pk_termin, bezeichnung, beschreibung, datum, ist_erledigt, fk_group_id, fk_ersteller_id)
            "INSERT INTO Termin VALUES (null, ?, ?, ?, FALSE, ?, ?)",
            [bezeichnung, beschreibung, date_time, group_id, user_id]
        );

        res.status(201).json({
            id: Number(result.insertId),
            beschreibung: beschreibung,
            bezeichnung: bezeichnung,
            datum: date_time,
            fk_group_id: group_id,
            fk_ersteller_id: user_id
        });
    } catch {
        res.status(500).json({error: "Failed to create task"});
    }
});

//Create a new Group
app.post("/gruppe", async (req, res) => {
    const {gruppenname, invite_code} = req.body;

    if (!gruppenname || !invite_code) {
        return res.status(400).json({error: "gruppenname and invite_code are required to create a group."});
    }

    try {
        const result = await runQuery(
            //Gruppe (pk_group_id, gruppenname, invite_code)
            "INSERT INTO Gruppe VALUES (null, ?, ?)",
            [gruppenname, invite_code]
        );

        res.status(201).json({id: Number(result.insertId), gruppenname: gruppenname, invite_code: invite_code});
    } catch {
        res.status(500).json({error: "Failed to create group"});
    }
});

//Create a new User
app.post("/user", async (req, res) => {
    const {username, passwort} = req.body;

    if (!username || !passwort) {
        return res.status(400).json({error: "username and passwort are required to create a user."});
    }

    try {
        const result = await runQuery(
            //User (pk_user_id, username, passwort)
            "INSERT INTO User VALUES (null, ?, SHA2(?,256))",
            [username, passwort]
        );

        res.status(201).json({id: Number(result.insertId), username: username, passwort: passwort});
    } catch {
        res.status(500).json({error: "Failed to create user"});
    }
});

//Insert a User into a Group
app.post("/gruppe_user", async (req, res) => {
    const {markierungsfarbe, ist_admin, kann_bearbeiten, kann_loeschen, group_id, user_id} = req.body;
    const params = [];
    if (!ist_admin || !kann_bearbeiten || !kann_loeschen || !group_id || !user_id) {
        return res.status(400).json({error: "ist_admin, kann_bearbeiten, kann_loeschen, group_id and user_id are required to insert a user into a group."});
    }
    if (markierungsfarbe) {
        params.push(markierungsfarbe);
    } else {
        params.push(null);
    }
    params.push(ist_admin, kann_bearbeiten, kann_loeschen, group_id, user_id);

    try {
        const result = await runQuery(
            //Gruppe_User (markierungsfarbe, ist_admin, kann_bearbeiten, kann_loeschen, group_id, user_id)
            "INSERT INTO Gruppe_User VALUES (?, ?, ?, ?, ?, ?)",
            params
        );

        res.status(201).json({
            id: Number(result.insertId),
            markierungsfarbe: markierungsfarbe,
            ist_admin: ist_admin,
            kann_bearbeiten: kann_bearbeiten,
            kann_loeschen: kann_loeschen,
            group_id: group_id,
            user_id: user_id
        });
    } catch {
        res.status(500).json({error: "Failed to insert user into group"});
    }
});

//Create a new invite-request
app.post("/beitritt_anfrage", async (req, res) => {
    const {user_id, group_id} = req.body;

    if (!user_id || !group_id) {
        return res.status(400).json({error: "user_id and group_id are required to create an invite-request."});
    }

    try {
        const result = await runQuery(
            //Beitritt_Anfrage (pk_anfrage_id, fk_user_id, fk_group_id)
            "INSERT INTO Beitritt_Anfrage VALUES (null, ?, ?)",
            [user_id, group_id]
        );

        res.status(201).json({id: Number(result.insertId), fk_user_id: user_id, fk_group_id: group_id});
    } catch {
        res.status(500).json({error: "Failed to create invite-request"});
    }
});


//DELETEs (remove Data)

//Delete a user
app.delete("/user/:user_id", async (req, res) => {
    const {user_id} = req.params;

    try {
        if (!user_id) {
            return res.status(400).json({error: "user_id is required to delete a user"});
        }

        await runQuery("DELETE FROM Gruppe_User WHERE fk_user_id = ?", [user_id]);
        await runQuery("DELETE FROM Beitritt_Anfrage WHERE fk_user_id = ?", [user_id]);

        const result = await runQuery(
            "DELETE FROM User WHERE pk_user_id = ?",
            [user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "User not found"});
        }

        res.status(200).json({message: "User deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete user"});
    }
});

//Delete a group
app.delete("/gruppe/:group_id", async (req, res) => {
    const {group_id} = req.params;

    try {
        if (!group_id) {
            return res.status(400).json({error: "group_id is required to delete a group"});
        }

        await runQuery("DELETE FROM Termin WHERE fk_group_id = ?", [group_id]);
        await runQuery("DELETE FROM Gruppe_User WHERE fk_group_id = ?", [group_id]);
        await runQuery("DELETE FROM Beitritt_Anfrage WHERE fk_group_id = ?", [group_id]);

        const result = await runQuery(
            "DELETE FROM Gruppe WHERE pk_group_id = ?",
            [group_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Group not found"});
        }

        res.status(200).json({message: "Group deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete Group"});
    }
});

//Remove user from group
app.delete("/gruppe_user", async (req, res) => {
    const {user_id, group_id} = req.query;

    try {
        if (!user_id || !group_id) {
            return res.status(400).json({error: "user_id and group_id are required to remove a user from a group"});
        }

        const result = await runQuery(
            "DELETE FROM Gruppe_User WHERE fk_user_id = ? AND fk_group_id = ?",
            [user_id, group_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "User not found in group"});
        }

        res.status(200).json({message: "User removed successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to remove user"});
    }
});

//Delete an invite-request
app.delete("/beitritt_anfrage/:anfrage_id", async (req, res) => {
    const {anfrage_id} = req.params;

    try {
        if (!anfrage_id) {
            return res.status(400).json({error: "anfrage_id is required to delete an invite-request"});
        }

        const result = await runQuery(
            "DELETE FROM Beitritt_Anfrage WHERE pk_anfrage_id = ?",
            [anfrage_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Invite-request not found"});
        }

        res.status(200).json({message: "Invite-request deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete invite-request"});
    }
});

//Delete a task
app.delete("/termin/:termin_id", async (req, res) => {
    const {termin_id} = req.params;

    try {
        if (!termin_id) {
            return res.status(400).json({error: "termin_id is required to delete a task"});
        }

        const result = await runQuery(
            "DELETE FROM Termin WHERE pk_termin_id = ?",
            [termin_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Task not found"});
        }

        res.status(200).json({message: "Task deleted successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to delete task"});
    }
});


//PATCHes (partially update data / UPDATE )

//partially update a user
app.patch("/user/:user_id", async (req, res) => {
    const {user_id} = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: "No fields provided for update"});
    }

    const columns = [];
    const values = [];

    for (const key in updates) {
        if (key != "pk_user_id") {
            columns.push(`${key} = ?`);
            values.push(updates[key]);
        } else {
            return res.status(400).json({error: "Updates to the primary key are not allowed."});
        }
    }

    values.push(user_id); // for WHERE clause

    const sql = `
        UPDATE User
        SET ${columns.join(", ")}
        WHERE pk_user_id = ?
    `;

    try {
        const result = await runQuery(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "User not found"});
        }

        res.json({message: "User updated successfully"});
    } catch (err) {
        console.error("PATCH ERROR:", err);
        res.status(500).json({error: "Failed to update user"});
    }
});

//partially update a group
app.patch("/gruppe/:group_id", async (req, res) => {
    const {group_id} = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: "No fields provided for update"});
    }

    const columns = [];
    const values = [];

    for (const key in updates) {
        if (key != "pk_group_id" && key != "invite_code") {
            columns.push(`${key} = ?`);
            values.push(updates[key]);
        } else {
            return res.status(400).json({error: "Updates to the primary key or the invite_code are not allowed."});
        }
    }

    values.push(group_id); // for WHERE clause

    const sql = `
        UPDATE Gruppe
        SET ${columns.join(", ")}
        WHERE pk_group_id = ?
    `;

    try {
        const result = await runQuery(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Group not found"});
        }

        res.json({message: "Group updated successfully"});
    } catch (err) {
        console.error("PATCH ERROR:", err);
        res.status(500).json({error: "Failed to update group"});
    }
});

//partially update a task
app.patch("/termin/:termin_id", async (req, res) => {
    const {termin_id} = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: "No fields provided for update"});
    }

    const columns = [];
    const values = [];

    for (const key in updates) {
        if (key != "pk_termin_id" && key != "fk_ersteller_id") {
            columns.push(`${key} = ?`);
            values.push(updates[key]);
        } else {
            return res.status(400).json({error: "Updates to the primary key or to fk_ersteller_id are not allowed."});
        }
    }

    values.push(termin_id);

    const sql = `
        UPDATE Termin
        SET ${columns.join(", ")}
        WHERE pk_termin_id = ?
    `;

    try {
        const result = await runQuery(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Task not found"});
        }

        res.json({message: "Task updated successfully"});
    } catch (err) {
        console.error("PATCH ERROR:", err);
        res.status(500).json({error: "Failed to update Task"});
    }
});

//partially update a users group-rights or their chosen group-colour
app.patch("/gruppe_user", async (req, res) => {
    const {group_id, user_id} = req.query;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: "No fields provided for update"});
    }

    const columns = [];
    const values = [];

    for (const key in updates) {
        if (key != "fk_group_id" && key != "fk_user_id") {
            columns.push(`${key} = ?`);
            values.push(updates[key]);
        } else {
            return res.status(400).json({error: "Updates to attributes which form a primary key are not allowed."});
        }
    }

    // for WHERE clause
    values.push(group_id);
    values.push(user_id);

    const sql = `
        UPDATE Gruppe_User
        SET ${columns.join(", ")}
        WHERE fk_group_id = ?
          AND fk_user_id = ?
    `;

    try {
        const result = await runQuery(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Group-User entry not found"});
        }

        res.json({message: "Group-User entry updated successfully"});
    } catch (err) {
        console.error("PATCH ERROR:", err);
        res.status(500).json({error: "Failed to update Group-User entry"});
    }
});


//Define on which port the backend runs.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});