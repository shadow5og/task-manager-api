const mongoose = require("mongoose"),
taskSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
},
{
  timestamps: true
}),
  // Creating a model.
  Task = mongoose.model("Task", taskSchema);

  module.exports = Task;
