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

accountController.buildRegister = async function (req, res) {
  let nav = await utilities.getNav();
  let register = await utilities.buildRegisterForm();
  res.render("account/register", {
    title: "Register",
    nav,
    register,
    errors: null,
  });
};

module.exports = accountController;
