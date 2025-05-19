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
  const { username, group, gender, age } = req.body;

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

    // Обновляем дополнительные поля пользователя
    if (group) user.group = group;
    if (gender) user.gender = gender;
    if (age) user.age = age;

    await user.save();

    // Обрабатываем сессии пользователя
    const sessionsData = user.sessions.map(session => {
      return session.map((item, index) => {
        // Время дачи стимула:
        // - Для первого элемента в сессии это null
        // - Для последующих элементов — время предыдущей реакции
        const stimulusTime = index === 0 ? null : session[index - 1].timestamp;

        return {
          word: item.word,
          reaction: item.reaction,
          stimulusTime: stimulusTime,
          reactionTime: item.timestamp,
          reactionDuration: index > 0
            ? new Date(item.timestamp) - new Date(session[index - 1].timestamp)
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
});

// Функция для расчета среднего времени реакции
function calculateAverageReactionTime(sessionsData) {
  let totalDuration = 0; // Общая сумма длительностей реакций
  let totalReactions = 0; // Общее количество реакций

  sessionsData.forEach(session => {
      session.forEach((item, index) => {
          if (index > 0) {
              // Вычисляем длительность реакции как разницу между текущим и предыдущим таймстампом
              const previousTimestamp = new Date(session[index - 1].timestamp);
              const currentTimestamp = new Date(item.timestamp);
              const reactionDuration = currentTimestamp - previousTimestamp;

              totalDuration += reactionDuration;
              totalReactions++;
          }
      });
  });

  // Возвращаем среднее время реакции или 0, если реакций не было
  return totalReactions > 0 ? totalDuration / totalReactions : 0;
}


// Роут для построения прямого и обратного ассоциативных словарей
router.post('/build-dictionaries', async (req, res) => {
  const { username } = req.query;
  
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

    // Формируем прямой словарь
    const forwardDictionary = user.statistics


    // У всех объектов user.sessions.flat() делаешь findAll где слово-реакция совпадает с текущим элементом
    // Впоследствии если мы уже обработали эту реакцию то пропускаешь этот этап
    // Записываешь все найденные данные в отдельный массив
    // Проходишься по каждому элементу в этом массиве и
    // делаешь новый массив 
    // [{reaction: "someReaction", allStimuls: [{stimul: "someWord", count: 32}]}, ...]

    // Собираем все сессии в один плоский массив
    const allSessions = user.sessions.flat();

    // Объект для хранения данных
    const reverseDictionary = {};

    // Проходим по всем элементам сессий
    for (const sessionItem of allSessions) {
      const { reaction, word } = sessionItem;

      // Если реакция уже обработана, пропускаем
      if (reverseDictionary[reaction]) continue;

      // Находим все элементы с такой же реакцией
      const matchingItems = allSessions.filter(item => item.reaction === reaction);

      // Группируем стимулы для этой реакции
      const stimulsCount = {};
      matchingItems.forEach(item => {
        if (!stimulsCount[item.word]) {
          stimulsCount[item.word] = 0;
        }
        stimulsCount[item.word]++;
      });

      // Формируем массив allStimuls
      const allStimuls = Object.entries(stimulsCount).map(([stimul, count]) => ({
        stimul,
        count,
      }));

      // Добавляем запись в обратный словарь
      reverseDictionary[reaction] = {
        reaction,
        allStimuls,
      };
    }

    // Преобразуем объект в массив
    const reverseDictionaryArray = Object.values(reverseDictionary);

    // Объединяем оба словаря
    const dictionaries = {
      forward: forwardDictionary.map(stat => {
        // Сортируем allReactions по count в убывании
        stat.allReactions.sort((a, b) => b.count - a.count);
        return stat;
      }).sort((a, b) => a.word.localeCompare(b.word)),
    
      reverse: reverseDictionaryArray.map(stat => {
        // Сортируем allStimuls по count в убывании
        stat.allStimuls.sort((a, b) => b.count - a.count);
        return stat;
      }).sort((a, b) => a.reaction.localeCompare(b.reaction)),
    };

    // Отправляем данные в формате JSON
    res.json(dictionaries);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
