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
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Handle new classification form submission
router.post(
  "/add-classification",
  validate.newClassificationRules(),
  validate.checkNewClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Handle new inventory form submission
router.post(
  "/add-inventory",
  validate.newInventoryRules(),
  validate.checkNewInventoryData,
  utilities.handleErrors(invController.addInventory)
);

/**
 * Deliberately cause a server error for testing purposes.
 *
 */

router.get("/error-link", utilities.handleErrors(invController.throw500));

module.exports = router;
