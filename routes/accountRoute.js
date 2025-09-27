// Needed resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const validate = require("../utilities/account-validation");

//  Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Handle Login form submission
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
);

// Handle new classification form submission
// router.post(
//   "/addClassification",
//   validate.newClassificationRules(),
//   validate.checkNewClassificationData,
//   utilities.handleErrors(invController.addClassification)
// );

// Handle registration form submission
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
// router.post("/login", (req, res) => {
//   res.status(200).send("login process");
// });

module.exports = router;
