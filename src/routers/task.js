const express = require("express"),
  router = new express.Router(),
  auth = require("../middleware/auth"),
  Task = require("../models/task");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send({ error: "Unable to create task." });
    console.log(e.message);
  }
});

// GET /tasks?complete=true
// GET /tasks?complete=true&limit=10&skip=20 get the third set of results
// GET /tasks?sortBy=createdAt_asc&completed=true Sorting situation
router.get("/tasks", auth, async (req, res) => {
  const { user, query } = req,
    match = {},
    sort = {},
    options = {},
    allowedOptionsKeys = ["limit", "skip", "complete", "sortedBy"],
    isValid = Object.keys(query).every((key) =>
      allowedOptionsKeys.includes(key)
    );

  // console.log(query);

  if (isValid) {
    let { complete, ...options_ } = query,
      direction;

    for (let key in options_) {
      if (/createdAt_(asc|desc)/.test(query[key])) {
        direction = options_[key].replace("createdAt_", "");
        direction === "asc"
          ? Object.assign(sort, { createdAt: 1 })
          : Object.assign(sort, { createdAt: -1 });
        Object.assign(options, { sort });
      } else if (/complete_(asc|desc)/.test(query[key])) {
        direction = options_[key].replace("complete_", "");
        direction === "asc"
          ? Object.assign(sort, { complete: 1 })
          : Object.assign(sort, { complete: -1 });
        Object.assign(options, { sort });
      } else if (!/^\d+$/.test(options_[key])) {
        return res.status(400).send({
          error: "Invalid query.",
        });
      }
      if (query[key] === "createdBy_asc") {
        console.log(query[key]);
      }
    }

    Object.assign(options, options_);

    if (complete || complete === "") {
      complete = complete.toLowerCase();
      const completeValues = ["true", "false"],
        isValid = completeValues.includes(complete);

      if (!isValid)
        return res.status(400).send({
          error: "Invalid query.",
        });

      if (complete === "true") {
        match.complete = true;
      } else {
        match.complete = false;
      }
    }
  }

  try {
    await user.populate({
      path: "tasks",
      match,
      options,
    });

    res.send(user.tasks);
  } catch (e) {
    res.status(503).send({ error: "Unable to fetch tasks." });
    console.log(e.message);
  }
});

router.get("/tasks/:_id", auth, async (req, res) => {
  const { _id } = req.params;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(404).send();

    res.send(task);
  } catch (e) {
    res.status(503).send({ error: "Unable to fetch the task." });
    console.log(e.message);
  }
});

router.patch("/tasks/:_id", auth, async (req, res) => {
  const allowedUpdates = ["description", "complete"],
    updates = Object.keys(req.body),
    isValidOperation = updates.every((field) => allowedUpdates.includes(field));

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid update" });

  try {
    const task = await Task.findOne({
      _id: req.params._id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send();

    Object.assign(task, req.body);

    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send({ error: "Bad Request." });
    console.log(e);
  }
});

router.delete("/tasks/:_id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params._id,
      owner: req.user._id,
    });

    if (!task) return res.status(404).send();

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
