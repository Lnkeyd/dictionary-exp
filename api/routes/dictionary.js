const express = require("express");
const router = express.Router();
const DictionaryModel = require("../models/Dictionary");
const UserModel = require("../models/User");

// получить слова
router.get("/", (req, res) => {
  console.log("Get dictionary");
  DictionaryModel.findOne({DictId: '111'})
    .then((data) => {
      // все слова по данному словарю
      res.send(data.words);
    })
    .catch((err) => console.log(err));
});

// {
//   username: 'raccoon',
//   session: []
// }

// загрузить сессию пользователя с данными выше
router.post("/", async (req, res) => {
  const username = req.body.username;
  const session = req.body.session;
  console.log(session);
  console.log("Push session");

  if (!username || !session || session.length === 0) {
    return res
      .status(400)
      .json("Пользователь не найден, либо ваша сессия пустая!");
  }
  try {
    let result = await UserModel.updateOne(
      { username: username },
      { $push: { sessions: session } }
    );
    // Сбор статистики
    const user = await UserModel.findOne({ username: username });
    if (!user.statistics.length) {
      // если сессия -- первая
      console.log('First SESSION')
      
      stat = session.map((item) => {
          return {
            word: item.word,
            allReactions: [{ reaction: item.reaction, count: 1 }],
          };
        })
      await UserModel.findOneAndUpdate({ username: username }, {statistics: stat})
    } 
    else {
      // если уже есть сессии
      const userStatistics = user.statistics
      session.map((item) => {
        const wordIndex = userStatistics.findIndex(stat => stat.word === item.word)
        const reactionIndex = userStatistics[wordIndex].allReactions.findIndex(reac => reac.reaction === item.reaction)

        if (reactionIndex >= 0) {
          // пользователь уже отвечал такой же реакцией на такое же слово
          userStatistics[wordIndex].allReactions[reactionIndex].count += 1
        } else {
          // реакция на такое слово новая
          userStatistics[wordIndex].allReactions.push({reaction: item.reaction, count: 1})
        }
      });
      await UserModel.findOneAndUpdate({ username: username }, {statistics: userStatistics})
    }

    return res.send(result).status(204);
  } catch (err) {
    return res.status(400).json(err);
  }
});

module.exports = router;
