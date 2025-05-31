// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).send({ message: "Token missing" });

  jwt.verify(token, "secretKey", (err, decoded) => {
      console.log("token consoled in auth.middleware", token);
    if (err) return res.status(400).send({ message: "Invalid token" });
    console.log("decoded in auth.middleware", decoded);
    req.userId = decoded.userId;
    req.userName = decoded.userName;
    next();
  });
};

module.exports = { authMiddleware };