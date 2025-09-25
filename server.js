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
const accountController = require("./controllers/accountController.js");
const inventoryRoute = require("./routes/inventoryRoute.js");
const accountRoute = require("./routes/accountRoute.js");
const utilities = require("./utilities/");
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");

/* ***********************
 * Middleware
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Messages Middleware
//@ts-nocheck
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

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

app.use("/account", accountRoute);

/**
 * 404 Error handler
 */

// File not found route
app.use(async (req, res, next) => {
  const err = new Error("Sorry, the page you requested could not be found.");
  err.status = 404;
  next(err);
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = "";
  try {
    nav = await utilities.getNav();
  } catch (error) {
    console.error("Error getting navigation for error handler:", error);
    nav = "<ul><li><a href='/'>Home</a></li></ul>"; // Fallback navigation
  }
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let status = err.status || 500;
  let title = status === 404 ? "404 Page Not Found" : "500 Server Error";
  let message =
    status === 404
      ? `<span class="errormsg">Sorry, we couldn't find that page!</span>`
      : `<span class="errormsg">Oh no! There was a crash. Maybe try a different route?</span>`;

  // Set the response status code
  res.status(err.status || 500).render("errors/error", {
    title,
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
