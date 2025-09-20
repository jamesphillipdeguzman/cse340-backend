// Needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassification)
);

// Route to build vehicle detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvID)
);

/**
 * Deliberately cause a server error for testing purposes.
 *
 */

router.get("/error-link", utilities.handleErrors(invController.throw500));


module.exports = router;
