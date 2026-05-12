import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // get token from header
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // token format: "Bearer <token>"
    const actualToken = token.replace("Bearer ", "");

    const verified = jwt.verify(actualToken, process.env.JWT_SECRET);

    req.user = verified.userId;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
