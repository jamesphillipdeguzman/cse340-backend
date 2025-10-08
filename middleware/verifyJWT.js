const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  try {
    // Retrieve JWT from cookie or header
    const token =
      req.cookies?.jwt || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      req.flash("notice", "Access denied. Please log in first.");
      return res.redirect("/account/login");
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed: ", err);
        req.flash("notice", "Session expired. Please log in again");
        return res.redirect("/account/login");
      }

      // Attach user payload to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("verifyJWT error", error);
    req.flash("notice", "Authentication error. Please login again.");
    return res.redirect("/account/login");
  }
}

module.exports = verifyJWT;
