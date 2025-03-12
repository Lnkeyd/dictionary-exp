const express = require("express");
const router = express.Router();
const {v4: uuid} = require("uuid")
const jwt = require("jsonwebtoken");
const DictionaryModel = require("../models/Dictionary");
const UserModel = require("../models/User");
const bcrypt = require('bcryptjs');


// получение статистики
router.get("/", async (req, res) => {
 return res.status(200).send('IDK')
});

// Получить всех пользователей (только для администратора)
router.get("/users", async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).send("Токен не найден");
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //  JWT_SECRET
      const adminUser = await UserModel.findOne({ username: decoded.username });
  
      // Проверяем права администратора
      if (adminUser.level !== 2) {
        return res.status(403).send("Доступ запрещён");
      }
  
      // Получаем всех пользователей
      const users = await UserModel.find({}, { password: 0 }); // Исключаем пароли из ответа
  
      return res.status(200).json(users);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Ошибка сервера");
    }
});

// Получить все наборы слов (только для администратора)
router.get("/dictionaries", async (req, res) => {
    console.log('TRYING TO GET ADMIN DICTIONAR')
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Токен не найден");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET
    const user = await UserModel.findOne({ username: decoded.username });

    // Проверяем права администратора
    if (user.level !== 2) {
      return res.status(403).send("Доступ запрещён");
    }

    // Получаем все словари
    const dictionaries = await DictionaryModel.find({}, { DictName: 1, words: 1, label: 1, id: 1 });
    return res.status(200).json(dictionaries);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Ошибка сервера");
  }
});

// routes/admin.js
router.post("/assign-dictionary", async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).send("Токен не найден");
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const adminUser = await UserModel.findOne({ username: decoded.username });
  
      // Проверяем права администратора
      if (adminUser.level !== 2) {
        return res.status(403).send("Доступ запрещён");
      }
  
      const { dictId, users } = req.body;
  
      // Проверяем, существует ли словарь
      const dictionary = await DictionaryModel.findOne({ id: dictId });
      if (!dictionary) {
        return res.status(404).send("Словарь не найден");
      }
  
      // Находим всех пользователей в базе данных
    const allUsers = await UserModel.find();

    // Проходимся по каждому пользователю
    for (const user of allUsers) {
      if (users.includes(user.username)) {
        // Если username содержится в массиве users, устанавливаем active_dict_id в dictId
        user.active_dict_id = dictId;
      } else {
        // Иначе устанавливаем active_dict_id в 0
        user.active_dict_id = 0;
      }

      // Сохраняем изменения для каждого пользователя
      await user.save();
    }
  
      return res.status(200).send("Словарь успешно назначен пользователям.");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Ошибка сервера при назначении словаря.");
    }
  });

// Роут для добавления нового словаря
router.post("/add-dictionary", async (req, res) => {
  try {
    const { DictName, words, label, id } = req.body;

    // Проверяем обязательные поля
    if (!Array.isArray(words) || words.length === 0 || !label) {
      return res.status(400).json({ error: "Необходимо указать массив слов и label." });
    }

    // Проверяем, что все элементы массива являются строками
    for (const word of words) {
      if (word !== id && (typeof word !== "string" || word.trim() === "")) {
        return res.status(400).json({ error: "Каждое слово должно быть непустой строкой." });
      }
    }

    // Создаем новый словарь в базе данных
    const newDictionary = new DictionaryModel({
      words,
      label,
      DictName: '',
      id,
    });

    // Сохраняем словарь
    await newDictionary.save();

    // Возвращаем успешный ответ
    res.status(201).json({ message: "Словарь успешно создан.", dictionary: newDictionary });
  } catch (error) {
    console.error("Ошибка при добавлении словаря:", error);
    res.status(500).json({ error: "Произошла ошибка сервера." });
  }
});

// Роут для удаления словаря
router.delete("/dictionaries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Проверяем, существует ли словарь с указанным ID
    const dictionary = await DictionaryModel.findOne({ id: Number(id) });
    if (!dictionary) {
      return res.status(404).json({ message: "Словарь не найден." });
    }
    
    // Находим всех пользователей в базе данных
    const allUsers = await UserModel.find();

    // Проходимся по каждому пользователю
    for (const user of allUsers) {
      if (Number(user.active_dict_id) === Number(dictionary.id)) {
        // Если у user'a был поставлен такой набор слов, то затираем его
        user.active_dict_id = 0;
      }
      // Сохраняем изменения для каждого пользователя
      await user.save();
    }

    // Удаляем словарь
    await DictionaryModel.findOneAndDelete({ id: Number(id) });


    // Возвращаем успешный ответ
    res.status(200).json({ message: "Словарь успешно удален." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при удалении словаря." });
  }
});


// Получить список всех пользователей (только для администратора)
router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password'); // Исключаем пароль из ответа
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Создать нового пользователя (только для администратора)
router.post('/users', async (req, res) => {
  const { username, password, level } = req.body;

  try {
    // Проверяем, существует ли пользователь
    let user = await UserModel.findOne({ username });
    if (user) return res.status(400).json({ message: 'Пользователь существует' });

    // Генерация хэша пароля
    const saltRounds = 10; // Количество раундов для генерации соли
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем нового пользователя
    user = new UserModel({ username, password: hashedPassword, level });
    await user.save();

    res.status(201).json({ _id: user._id, username: user.username, level: user.level, password: user.password })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Обновить данные пользователя (только для администратора)
router.patch('/users/:id', async (req, res) => {
  const { username, password, level } = req.body;

  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    // Обновляем поля
    user.username = username || user.username;
    user.level = level || user.level;

    if (password) {
      user.password = password;
    }

    await user.save();
    res.status(200).json({ ...user})
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Удалить пользователя (только для администратора)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});


module.exports = router;