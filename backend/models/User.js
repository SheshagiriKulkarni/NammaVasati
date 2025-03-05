const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlisted_ads: [String],
  joinedDate: { type: Date, default: Date.now }, // ✅ Added joined date
  image: String,
  number: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        // Optional: Mobile number validation
        return v === null || /^[6-9]\d{9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
