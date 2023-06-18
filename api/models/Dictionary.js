const mongoose = require("mongoose");

const DictionarySchema = new mongoose.Schema(
  {
    words: [String],
    DictName: {
      type: String,
      required: true,
      unique: true
    },
  },
  { collection: "Dictionary" }
);

module.exports = mongoose.model("Dictionary", DictionarySchema);
