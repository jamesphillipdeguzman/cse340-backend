const utilities = require("../utilities/");
const accountController = {};
const accountModel = require("../models/account-model");
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
    errors: null,
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

accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you are registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        login: await utilities.buildLoginForm(),
        errors: null,
      });
    } else {
      req.flash("notice", " Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error registering account: ", error);
    req.flash("notice", " Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      register: await utilities.buildRegisterForm(),
      errors: null,
    });
  }
};

module.exports = accountController;
