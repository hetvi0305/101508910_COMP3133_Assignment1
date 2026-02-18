const jwt = require("jsonwebtoken");

function getUserFromAuthHeader(authHeader) {
    try {
        if (!authHeader) return null;
        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) return null;

        const secret = process.env.JWT_SECRET;
        if (!secret) return null;

        return jwt.verify(token, secret);
    } catch {
        return null;
    }
}

function requireAuth(context) {
    if (!context.user) {
        const err = new Error("Unauthorized: Please login first.");
        err.code = "UNAUTHORIZED";
        throw err;
    }
    return context.user;
}

module.exports = { getUserFromAuthHeader, requireAuth };
