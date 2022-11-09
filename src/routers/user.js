const express = require("express"),
  router = new express.Router(),
  auth = require("../middleware/auth"),
  { User } = require("../models/user"),
  multer = require("multer"),
  upload = multer(
    {
      limits: {
        fileSize: 1000000,
      },
      fileFilter(req, file, cb) {
        if (!/.(jpg|png|jpeg)$/i.test(file.originalname)) {
          console.log(file.originalname);
          cb(new Error("Please upload only png, jpg or jpeg files."));
        }

        cb(undefined, file);
      },
    },
    (error, req, res, next) => {
      res.status(400).send({ error: error.message });
    }
  ),
  sharp = require("sharp");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    // it will save the user before returning the token.
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Unable to create a new user." });
    console.log(e.message);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body,
      user = await User.findByCredentials(email, password),
      // it will save the user before returning the token.
      token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Password or email is incorrect." });
    console.log(e.message);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    const { user, token: logoutToken } = req;
    user.tokens = user.tokens.filter((token) => token.token !== logoutToken);
    await user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
    console.log(e.message);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    const { user } = req;
    user.tokens = [];
    await user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
    console.log(e.message);
  }
});

router.get("/users/me", auth, (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "age"],
    updates = Object.keys(req.body),
    isValidOperation = updates.every((field) => allowedUpdates.includes(field));

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid update" });

  try {
    const { user } = req;
    Object.assign(user, req.body);

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send({ error: "Invalid Update." });
    console.log(e.message);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
    console.log(e.message);
  }
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error();

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
    console.log(e.message);
  }
});

module.exports = router;
