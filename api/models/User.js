const mongoose = require("mongoose");

// const SessionSchema = new mongoose.Schema({
//   word: {
//     type: String,
//     // required: true
//   },
//   reaction: {
//     type: String,
//     // required: true
//   },
// });

// const StatisticSchema = new mongoose.Schema({
//   word: {
//     type: String,
//     // required: true,
//     // unique: true,
//   },
//   allReactions: [
//     {
//       reaction: {
//         type: String,
//         // required: true,
//         // unique: true,
//       },
//       count: {
//         type: Number,
//         // required: true,
//         // default: 1
//       },
//     },
//   ],
// });

const UserSchema = new mongoose.Schema(
  {
    // _id: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: false,
      unique: false,
    },
    group: {
      type: String,
      required: false,
      unique: false,
    },
    age: {
      type: Number,
      required: false,
      unique: false,
    },
    active_dict_id: {
      type: String,
      required: false,
      unique: false,
    },
    level: {
      type: Number,
      required: true,
      default: 1,
      // 1 - user, 2 - admin
    },
    // массив сессий
    sessions: [
      // одна сессия как массив слово-реакция
      [{
        word: {
          type: String,
          // required: true
        },
        reaction: {
          type: String,
          // required: true
        },
        timestamp: {
          type: Date,
          default: Date.now,
        }
      }]
    ],
    // Массив со статистикой по всем сессиям
    statistics: {
      type: [
        {
          word: {
            type: String,
            // required: true,
            // unique: true,
          },
          allReactions: [
            {
              reaction: {
                type: String,
                // required: true,
                unique: false,
              },
              count: {
                type: Number,
                // required: true,
                // default: 1
                unique: false,
              },
            },
          ],
        }
      ],
    },
  },
  { collection: "Users" },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
