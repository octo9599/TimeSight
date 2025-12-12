"use strict";

const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = auth;
