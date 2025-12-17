import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
    const cookies = {};
    if (!req.headers.cookie) {
        return res.status(401).json({error: "Cookies not yet created."})
    }
    req.headers.cookie.split("; ").forEach(element => {
        const [key, value] = element.split("=");
        cookies[key] = value;
    });
    const token = cookies.auth;
    if (!token) return res.status(401).json({error: "Not logged in"});

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = data.userId;
        next();
    } catch {
        return res.status(401).json({error: "Invalid token"});
    }
}