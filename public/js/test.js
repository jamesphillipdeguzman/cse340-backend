const bcrypt = require("bcryptjs");

// Simulate registration
const rawPassword = "@ldsPjay138adtest";
const hash = bcrypt.hashSync(rawPassword, 10);

console.log("Raw password:", rawPassword);
console.log("Hashed password stored:", hash);

// Simulate login attempt
const loginAttempt = "@ldsPjay138adtest"; // try copy-paste from your login form
console.log("Entered password at login:", loginAttempt);

const match = bcrypt.compareSync(loginAttempt, hash);
console.log("Passwords match?", match ? "✅ Yes" : "❌ No");
