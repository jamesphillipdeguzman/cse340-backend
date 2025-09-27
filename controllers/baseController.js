const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  req.flash("notice", "You are on the homepage");
  res.render("index", { title: "Home", nav });
};

module.exports = baseController;
