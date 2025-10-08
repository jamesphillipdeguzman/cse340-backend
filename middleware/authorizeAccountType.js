const jwt = require("jsonwebtoken");

function authorizeAccountType(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user) {
      req.flash("notice", "Unauthorized access.");
      return res.redirect("/account/login");
    }

    if (!allowedTypes.includes(req.user.account_type)) {
      req.flash(
        "notice",
        "Access denied. You don't have permission to view this page."
      );
      return res.redirect("/account/");
    }

    next();
  };
}

module.exports = authorizeAccountType;
