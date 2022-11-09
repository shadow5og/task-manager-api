const jwt = require("jsonwebtoken"),
  { User, secret } = require("../models/user"),
  auth = async (req, res, next) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", ""),
        decoded = jwt.verify(token, secret),
        user = await User.findOne({ _id: decoded._id, "tokens.token": token });

      if (!user) throw Error("User not found.");

      req.user = user;
      req.token = token;
    } catch (e) {
      res.status(401).send({ error: "Please authenticate." });
      console.log(e.message);
    }

    next();
  };

module.exports = auth;
