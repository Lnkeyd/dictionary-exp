const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const DictionaryModel = require("../models/Dictionary");
const UserModel = require("../models/User");

// получить слова к определённому пользователю
router.get("/:username", async (req, res) => {
  console.log("Get dictionary");
  const { username } = req.params
  const token = req.cookies.accessToken;
  const jwtDecoded = jwt.decode(token);
  if (!token) {
      res.redirect('/')
      return res.status(400).send("Токен не найден")
  }

  else if (username !== jwtDecoded.username) {
    return res.status(403).send("Вы можете получить слова только для себя!")
  }

  const user = await UserModel.findOne({username})

  DictionaryModel.findOne({id: Number(user.active_dict_id)})
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

// Загрузить сессию пользователя
router.post("/", async (req, res) => {
  const { username, session } = req.body;

  console.log("Push session:", session);

  // Проверка входных данных
  if (!username || !session || session.length === 0) {
    return res
      .status(400)
      .json("Пользователь не найден, либо ваша сессия пустая!");
  }

  // Проверка токена
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(400).send("Токен не найден");
  }

  try {
    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
    if (username !== jwtDecoded.username) {
      return res.status(403).send("Вы можете загрузить слова только для себя!");
    }
  } catch (err) {
    return res.status(401).send("Невалидный токен");
  }

  try {
    // Находим пользователя
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).send("Пользователь не найден");
    }

    // Добавляем сессию в базу данных
    const updatedUser = await UserModel.updateOne(
      { username },
      { $push: { sessions: session } }
    );

    // Обновляем статистику
    const userStatistics = user.statistics;

    session.forEach((item) => {
      const { word, reaction, timestamp } = item;

      // Находим индекс слова в статистике
      let wordIndex = userStatistics.findIndex((stat) => stat.word === word);

      if (wordIndex === -1) {
        // Если слово новое, добавляем его в статистику
        userStatistics.push({
          word,
          allReactions: [{ reaction, count: 1 }],
        });
      } else {
        // Если слово уже есть, обновляем его реакции
        const reactionIndex = userStatistics[wordIndex].allReactions.findIndex(
          (reac) => reac.reaction === reaction
        );

        if (reactionIndex === -1) {
          // Если реакция новая, добавляем её
          userStatistics[wordIndex].allReactions.push({ reaction, count: 1 });
        } else {
          // Если реакция уже существует, увеличиваем счётчик
          userStatistics[wordIndex].allReactions[reactionIndex].count += 1;
        }
      }
    });

    // Сохраняем обновлённую статистику
    await UserModel.updateOne({ username }, { statistics: userStatistics });

    return res.status(200).json({ message: "Сессия успешно сохранена" });
  } catch (err) {
    console.error("Ошибка при обработке запроса:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});
module.exports = router;
