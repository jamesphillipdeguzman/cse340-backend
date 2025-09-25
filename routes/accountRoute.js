// Needed resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");

//  Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Hanlde Login form submission
router.post("/login", utilities.handleErrors(accountController.loginAccount));

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Handle registration form submission
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
