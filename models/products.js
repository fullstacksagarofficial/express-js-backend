const mongoose = require("mongoose");
const { Schema } = mongoose;

const productsSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is Required"],
  },
  slug: {
    type: String,
    required: [true, "Slug is Required"],
  },
  desc: {
    type: String,
    required: [true, "Description is Required"],
  },
  img: {
    type: String,
    required: [true, "Image is Required"],
  },
  category: {
    type: String,
    required: [true, "category is Required"],
  },
  size: {
    type: String,
    required: [true, "size is Required"],
  },
  color: {
    type: String,
    required: [true, "color is Required"],
  },
  price: {
    type: String,
    required: [true, "price is Required"],
  },
  availableQty: {
    type: String,
    required: [true, "availableQty is Required"],
  },
  status: {
    type: Number,
    default:0
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const product = mongoose.model("product", productsSchema);
// product.createIndexes();
module.exports = product;
