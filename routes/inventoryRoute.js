// Needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validate = require("../utilities/management-validation");

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

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get(
  "/addClassification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle new classification form submission
router.post(
  "/addClassification",
  validate.newClassificationRules(),
  validate.checkNewClassificationData,
  utilities.handleErrors(invController.addClassification)
);

/**
 * Deliberately cause a server error for testing purposes.
 *
 */

router.get("/error-link", utilities.handleErrors(invController.throw500));

module.exports = router;
