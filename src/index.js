const express = require("express"),
  app = express(),
  userRouter = require("./routers/user"),
  taskRouter = require("./routers/task");

require("./db/mongoose.js");

const port = process.envPORT || 3000;

app.use((req, res, next) => {
  if (req.method) console.log(req.method, req.path, new Date().toString());
  console.log("*");

  next();
});

// Maintenance mode.
// app.use((undefined, res) => {
//   res.status(503).send('Maintenance is currently in progress.');
// });

// configure express to parse json which is part of the body.
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
