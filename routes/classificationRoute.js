// Needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validate = require("../utilities/management-validation");

// Route to edit classification
router.put(
  "/edit/:classification_id",
  validate.newClassificationRules(),
  validate.checkNewClassificationData,
  utilities.handleErrors(invController.updateClassification)
);

// Route to delete classification
router.delete(
  "/delete/:classification_id",
  utilities.handleErrors(invController.deleteClassification)
);

module.exports = router;
