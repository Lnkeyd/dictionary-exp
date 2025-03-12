const mongoose = require("mongoose");

const DictionarySchema = new mongoose.Schema(
  {
    words: [String],
    DictName: {
      type: String,
      required: false,
      unique: false
    },
    label: {
      type: String,
      required: false,
      unique: false
    },
    id: {
      type: Number,
      required: true,
      unique: true,
    }
  },
  { collection: "Dictionary" }
);

module.exports = mongoose.model("Dictionary", DictionarySchema);
