/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController.js");
const inventoryRoute = require("./routes/inventoryRoute.js");
const utilities = require("./utilities/");

/* ***********************
 * View Engine and Templates
 *************************/
// Tell Express to use EJS as the template engine
app.set("view engine", "ejs");
// Enable express-ejs-layouts middleware
app.use(expressLayouts);
// The ./layouts/layout path is relative to the views folder
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index Route: Serve up the index.ejs template from Views and pass in the data object title as "Home"
// app.get("/", (req, res) => {
//   res.render("index", { title: "Home" });
// });
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);

// File not found route
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: `<span class="errormsg">Sorry, we couldn't find that page!</span>`,
  });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message = `<span class="errormsg">Oh no! There was a crash. Maybe try a different route?</span>`;
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
