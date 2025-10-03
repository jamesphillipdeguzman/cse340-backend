const bcrypt = require("bcryptjs");
const password = "@C4l3bAngela";
const hash = bcrypt.hashSync(password, 10);
console.log("New hash:", hash);
