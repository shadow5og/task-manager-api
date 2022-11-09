const mongoose = require("mongoose"),
  validator = require("validator"),
  bcrypt = require("bcrypt"),
  secret = "thisIsMyNewCourse",
  jwt = require("jsonwebtoken"),
  Task = require("./task"),
  userSchema = new mongoose.Schema(
    {
      avatar: {
        type: Buffer,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      age: {
        type: Number,
        validate(value) {
          if (value < 0) throw new Error("Age must be a positive number.");
        },
        default: 0,
      },
      email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
          if (!validator.isEmail(value))
            throw new Error("The provided email is invalid.");
        },
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
          if (value.length < 6) {
            throw new Error("Password must be more than 6 characters.");
          } else if (/password/i.test(value)) {
            throw new Error("Password must not contain the word 'password'.");
          }
        },
      },
      tokens: [
        {
          token: {
            type: String,
            required: true,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.generateAuthToken = async function () {
  const user = this,
    token = jwt.sign({ _id: user._id }, secret);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user_ = this,
    user = user_.toObject();

  delete user.password;
  delete user.tokens;
  delete user.avatar;

  return user;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Unable to log in.");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Unable to login.");

  return user;
};

// Hash the password before saving.
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete all user tasks before deleting the user.
userSchema.pre("remove", async function (next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });

  next();
});

// Creating a model.
const User = mongoose.model("User", userSchema);

module.exports = { User, secret };
