const mongoose = require("mongoose");
const validator = require("validator");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const adminsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyemailToken: {
    type: String,
  },
  status: {
    type: Number,
    default:1
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  date: { type: Date, default: Date.now },
});

// generating token on register

adminsSchema.methods.generateAuthToken = async function () {
  try {
    const token = jsonwebtoken.sign(
      { _id: this._id.toString() }, //toString() used because _id is an object id
      process.env.JWT_VERIFY_TOKEN
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    res.send("the error part" + error);
  }
};

//used in bcryptjs to hash password
adminsSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


const admin = mongoose.model("admin", adminsSchema);
admin.createIndexes();
module.exports = admin;
