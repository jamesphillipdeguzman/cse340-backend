// Needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassification);

// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildByInvID);

module.exports = router;
