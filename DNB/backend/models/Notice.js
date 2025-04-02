const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  date: String,
  file: String,
});

module.exports = mongoose.model("Notice", NoticeSchema);
