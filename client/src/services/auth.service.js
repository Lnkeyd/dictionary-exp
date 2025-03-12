import axios from "axios";

const authEndpoint = "/api";

// Функция для авторизации пользователя
export const authUser = async (username, password) => {
  try {
    const res = await axios.post(`${authEndpoint}/login`, {
      username,
      password,
    });

    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.error("Ошибка авторизации:", err);
    throw new Error("Неверное имя пользователя или пароль");
  }
};