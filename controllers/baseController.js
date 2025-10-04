const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  req.flash(
    "notice",
    "This project brings together a collection of cars designed to demonstrate database, API, and backend web development concepts"
  );
  res.render("index", {
    title: "Home",
    nav,
    account_firstname: req.session.account_firstname,
  });
};

module.exports = baseController;
