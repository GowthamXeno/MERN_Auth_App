const mongoose = require("mongoose");
require("dotenv").config();
exports.connectdb = () => {
  mongoose.connect(process.env.mongoURI);
};

const db = mongoose.connection;

db.on("error", console.error.bind("Connection Error!"));
db.once("open", function () {
  console.log("Connection Established!!!");
});
