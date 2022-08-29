const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorysSchema = new Schema({
  category: {
    type: String,
    required: [true, "Category is Required"],
  },
  status: {
    type: Number,
    default:1
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const category = mongoose.model("category", categorysSchema);
// category.createIndexes();
module.exports = category;
