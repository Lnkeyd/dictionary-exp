const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Генерация access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "30m" } // Access token действителен 30 минут
  );
};

// Генерация refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "21d" } // Refresh token действителен 21 день
  );
};

// LOGIN
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Находим пользователя по имени
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json("Пользователь не найден!");
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // const isPasswordValid = password === user.password
    console.log("IS_VALID_PASS: ", isPasswordValid)
    if (!isPasswordValid) {
      return res.status(400).json("Неверный пароль!");
    }

    // Генерируем токены
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Сохраняем refresh token в базе данных
    user.refreshToken = refreshToken;
    await user.save();

    // Устанавливаем токены в cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Только для HTTPS в production
      maxAge: 30 * 60 * 1000, // 30 минут
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Только для HTTPS в production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    res.cookie('user', JSON.stringify({
      username: user.username,
      role: user.level,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Возвращаем успешный ответ
    return res.status(200).json({
      user: {
        username: user.username,
        role: user.level, // Добавляем уровень пользователя (например, роль)
      },
      accessToken: accessToken
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ошибка сервера.");
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(204).json("Пользователь уже вышел.");
    }

    // Находим пользователя по refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      return res.status(204).json("Пользователь вышел.");
    }

    // Удаляем refresh token из базы данных
    user.refreshToken = null;
    await user.save();

    // Очищаем cookies
    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.clearCookie("user");

    return res.status(200).json("Пользователь успешно вышел.");
  } catch (e) {
    console.error(e);
    return res.status(500).json("Ошибка сервера.");
  }
});

// CHECK AUTH
router.get("/check-auth", async (req, res) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // Если refreshToken отсутствует, пользователь не авторизован
    if (!refreshToken) {
      console.log("No refresh token found");
      res.clearCookie("accessToken");
      res.clearCookie("user");
      return res.status(401).json({ message: "Unauthorized: No refresh token" });
    }

    // Проверяем accessToken
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (accessTokenError) {
      console.log("ACCESS TOKEN ERROR: ", accessTokenError);

      // Если accessToken истёк, проверяем refreshToken
      let decodedRefreshToken;
      try {
        decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (refreshTokenError) {
        console.log("REFRESH TOKEN ERROR: ", refreshTokenError);
        console.log("Invalid or expired refresh token");

        // Очищаем cookies и возвращаем ошибку
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.clearCookie("user");
        return res.status(401).json({ message: "Unauthorized: Invalid or expired tokens" });
      }

      // Генерируем новый accessToken
      const newAccessToken = jwt.sign(
        { id: decodedRefreshToken.id, username: decodedRefreshToken.username },
        process.env.JWT_SECRET,
        { expiresIn: "30m" } // Срок действия нового токена
      );

      // Устанавливаем новый accessToken в cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Включаем secure только в production
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, // 30 минут
      });

      // Используем данные из refreshToken для получения пользователя
      const user = await User.findOne({ _id: decodedRefreshToken.id });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      // Возвращаем данные пользователя
      return res.status(200).json({
        username: user.username,
        role: user.level,
      });
    }

    // Если accessToken действителен, используем его для получения пользователя
    const user = await User.findOne({ _id: decodedAccessToken.id });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Возвращаем данные пользователя
    return res.status(200).json({
      user: {
        username: user.username,
        role: user.level, // Добавляем уровень пользователя (например, роль)
      },
      accessToken: accessToken
    });
  } catch (error) {
    console.error("Error in /check-auth route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;