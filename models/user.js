const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/loginDB").then(() => {
  console.log("MongoDB connected");
});

const userSchema = mongoose.Schema(
  {
    name: { type: "string" },
    email: { type: "string", unique: true },
    password: { type: "string" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
