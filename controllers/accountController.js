const utilities = require("../utilities/");
const accountController = {};

/**
 * Build the Login view
 */

accountController.buildLogin = async function (req, res) {
  let nav = await utilities.getNav();
  let login = await utilities.buildLoginForm();
  res.render("account/login", {
    title: "Login",
    nav,
    login,
  });
};

module.exports = accountController;
