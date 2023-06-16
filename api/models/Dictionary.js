const mongoose = require("mongoose");

const DictionarySchema = new mongoose.Schema(
  {
    words: [String],
  },
  { collection: "Dictionary" }
);

module.exports = mongoose.model("Dictionary", DictionarySchema);
