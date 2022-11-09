const mongoose = require("mongoose");

// URL includes the database name.
mongoose
  .connect("mongodb://127.0.0.1:27017/task-manager-api", {
    useNewUrlParser: true,
  })
  .then((result) => console.log("Successfully connected to the Database."))
  .catch((e) => console.log("Failed to connect to the database: ", e.message));
