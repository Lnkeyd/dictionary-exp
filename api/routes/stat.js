const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const UserModel = require("../models/User");

// получить статистику
// router.get("/:username")
router.get("/:username", async (req, res) => {
  const token = req.cookies.accessToken;
  const jwtDecoded = jwt.decode(token);
  const { username } = req.params
  if (!username) {
    return res.status(400).send("Пользователя с таким именем не найдено");
  }
  else if (username !== jwtDecoded.username) {
    return res.status(403).send("Вы можете получить статистику только для себя!")
  }
  try {
    const data = await UserModel.findOne({ username: username })
    return res.status(200).json(data.statistics)
  } catch(err) {
    return res.status(400).send(err)
  }
});

router.post('/export-stat-data-exel', async (req, res) => {
    try {
      const token = req.cookies.accessToken;
    const jwtDecoded = jwt.decode(token);
    const { username } = req.params
    if (!username) {
      return res.status(400).send("Пользователя с таким именем не найдено");
    }
    else if (username !== jwtDecoded.username) {
      return res.status(403).send("Вы можете получить статистику только для себя!")
    }

    const data = await UserModel.findOne({ username: username })

    // Подготавливаем данные для таблицы
    const tableData = users.flatMap(user => {
      return user.sessions.flatMap(session => {
        return session.map(item => ({
          group: user.sessions.group || '',
          id: user._id,
          username: user.username,
          stimulus: item.word,
          reaction: item.reaction,
          stimulusDate: item.timestamp,
          reactionDate: item.reactionTimestamp || item.timestamp,
          gender: user.gender || '',
          age: user.age || ''
        }));
      });
    });

    res.json({ success: true, data: tableData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const { username, group, gender, age } = req.query;

try {
  // Получаем токен из cookies
  const token = req.cookies.accessToken;
  
  // Декодируем JWT-токен
  const jwtDecoded = jwt.decode(token);

  // Проверяем, что username предоставлен
  if (!username) {
    return res.status(400).send("Пользователя с таким именем не найдено");
  }

  // Проверяем, что пользователь пытается получить данные только о себе
  if (username !== jwtDecoded.username) {
    return res.status(403).send("Вы можете получить статистику только для себя!");
  }

  // Находим пользователя по username
  const user = await UserModel.findOne({ username });

  // Если пользователь не найден
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Обрабатываем сессии пользователя
  const sessionsData = user.sessions.map(session => {
    return session.map((item, index) => {
      // Время дачи стимула:
      // - Для первого элемента в сессии это null
      // - Для последующих элементов — время предыдущей реакции
      const stimulusTime = index === 0 ? null : session[index - 1].timestamp.$date;

      return {
        word: item.word,
        reaction: item.reaction,
        stimulusTime: stimulusTime,
        reactionTime: item.timestamp.$date,
        reactionDuration: index > 0
          ? new Date(item.timestamp.$date) - new Date(session[index - 1].timestamp.$date)
          : 0
      };
    });
  });

  // Формируем структуру данных для Excel
  const excelData = {
    userInfo: {
      username: user.username,
      level: user.level,
      group: group || 'N/A',
      gender: gender || 'N/A',
      age: age || 'N/A'
    },
    sessions: sessionsData,
    summary: {
      totalSessions: user.sessions.length,
      totalReactions: user.sessions.reduce((acc, session) => acc + session.length, 0),
      averageReactionTime: calculateAverageReactionTime(sessionsData)
    }
  };

  // Отправляем данные в формате JSON
  res.json(excelData);
} catch (error) {
  // Обработка ошибки
  res.status(500).json({ success: false, error: error.message });
}

// Функция для расчета среднего времени реакции
function calculateAverageReactionTime(sessionsData) {
    let totalDuration = 0;
    let totalReactions = 0;

    sessionsData.forEach(session => {
        session.forEach((item, index) => {
            if (index > 0) {
                totalDuration += item.reactionDuration;
                totalReactions++;
            }
        });
    });

    return totalReactions > 0 ? totalDuration / totalReactions : 0;
}

module.exports = router;
