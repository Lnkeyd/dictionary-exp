import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import axios from "axios";
import {
  Tooltip,
  Table,
  Text,
  Group,
  Button,
  Box,
  Title,
  Notification,
  Loader,
} from "@mantine/core";
import { useSelector } from "react-redux";
import Header from "../../components/header/Header";

const FormPage = () => {
  // Проверка авторизации пользователя
  const { user } = useSelector((store) => store.user);

  // Загрузка данных из localStorage
  const loadFromLocalStorage = () => {
    const savedData = JSON.parse(localStorage.getItem("formSession"));
    if (savedData && savedData.username === user?.username) {
      return savedData.session || [];
    }
    return [];
  };

  const navigate = useNavigate();
  const [fullDict, setFullDict] = useState([]); // полный словарь слов
  const [dict, setDict] = useState([]); // отфильтрованный словарь слов
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Индекс текущего слова
  const [session, setSession] = useState(loadFromLocalStorage()); // Текущая сессия (слово-реакция)
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false); // Новое состояние для загрузки

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
    loadFromLocalStorage();
    getData();
  }, [user]);

  useEffect(() => {
    saveToLocalStorage();
  }, [session]);

  // Сохранение данных в localStorage
  const saveToLocalStorage = (localSession = null) => {
    localStorage.setItem(
      "formSession",
      JSON.stringify({ username: user?.username, session: localSession ?? session })
    );
  };

  // Получение данных о словах с сервера
  const getData = async () => {
    try {
      const res = await axios.get(`/api/dict/${user?.username}`);
      const arrData = res.data;

      // Сохраняем полный список слов
      setFullDict(arrData);

      // Исключаем слова, которые уже есть в session
      const filteredData = arrData.filter((word) => !session.some((item) => item.word === word));

      // Перемешиваем оставшиеся слова
      const shuffledData = filteredData
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      // Сохраняем отфильтрованный список слов
      setDict(shuffledData);
    } catch (err) {
      if (err?.response?.data === "no token" || err?.response?.data === "invalid token") {
        console.log("У вас нет нужного токена");
        navigate("/", { replace: true });
      }
    }
  };

  // Переход к следующему слову
  const handleNext = () => {
    if (currentWordIndex < dict.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  // Отправка данных на сервер
  const handleSubmit = async () => {
    try {
      setLoading(true); // Включаем загрузку

      // Используем полный список слов для проверки
      const originalWords = fullDict;
      const storageSession = JSON.parse(localStorage.getItem("formSession"))?.session;
      const submittedWords = storageSession?.map((item) => item.word);

      if (
        originalWords.length !== submittedWords.length ||
        !originalWords.every((word) => submittedWords.includes(word))
      ) {
        throw new Error("Несоответствие списка слов!");
      }

      // Проверка timestamp
      const isTimestampValid = storageSession.every((item) => {
        // Проверяем, что поле timestamp существует
        if (!item.timestamp) {
          return false;
        }

        // Проверяем, что timestamp является валидной датой
        const date = new Date(item.timestamp);
        return date instanceof Date && !isNaN(date); // Валидная дата
      });

      if (!isTimestampValid) {
        throw new Error("Некорректный или отсутствующий timestamp!");
      }

      await axios.post(`/api/dict`, { username: user?.username, session: storageSession });
      setNotification({
        type: "success",
        message:
          "Данные успешно отправлены! Возвращайтесь через некоторое время чтобы пройти эксперимент ещё раз.",
      });

      localStorage.setItem(
        "formSession",
        JSON.stringify({ username: user?.username, session: [] })
      );

      setSession([]);
      setCurrentWordIndex(0);
      setTimeout(() => {
        navigate("/form");
      }, 5000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Ошибка при отправке данных!",
      });
    } finally {
      setLoading(false); // Выключаем загрузку
    }
  };

  // Текущее слово и реакция
  const currentWord = dict[currentWordIndex];
  const currentReaction = session.find((item) => item.word === currentWord)?.reaction || "";

  return (
    <>
      <Header />
      <Box p="md">
        <Title order={1} align="center" mb="lg">
          Анкета
        </Title>

        {notification && (
          <Notification
            color={notification.type === "success" ? "green" : "red"}
            onClose={() => setNotification(null)}
            style={{ marginBottom: 20 }}
          >
            {notification.message}
          </Notification>
        )}

        {dict.length ? (
          <Group position="apart" style={{ display: "flex", justifyContent: "center" }} mb="md">
            <Text weight={500}>Заполните анкету</Text>
            <Tooltip
              style={{ maxWidth: "500px" }}
              position="bottom"
              label={
                <div>
                  <p>
                    Можно использовать русские-латинские, цифры и др. спец. символы. Единственное,
                    по-возможности, не использовать букву "ё" и вместо нее писать "е".
                  </p>
                </div>
              }
              width={100}
              multiline
              withArrow
            >
              <Text color="blue" underline>
                Требования к заполнению
              </Text>
            </Tooltip>
          </Group>
        ) : (
          <Text align="center" color="dimmed">
            Нет данных для отображения.
          </Text>
        )}

      <form
        onSubmit={(e) => {
          e.preventDefault();

          // Проверяем, что реакция содержит хотя бы одну букву
          if (!currentReaction.trim()) {
            setError(true);
            return;
          }

          setError(false); // Сбрасываем ошибку, если она была

          // Добавляем timestamp при нажатии на кнопку
          const updatedSession = session.map((item) => {
            if (item.word === currentWord) {
              return { ...item, reaction: currentReaction.trim(), timestamp: new Date().toISOString() };
            } else {
              return item;
            }
          });

          // Если слово еще не добавлено в сессию, добавляем его с timestamp
          if (!session.some((item) => item.word === currentWord)) {
            updatedSession.push({
              word: currentWord,
              reaction: currentReaction.trim(),
              timestamp: new Date().toISOString(),
            });
          }

          saveToLocalStorage(updatedSession);
          setSession(updatedSession);

          if (currentWordIndex === dict.length - 1) {
            handleSubmit();
            e.target.reset();
          } else {
            handleNext();
          }
        }}
        style={{
          maxWidth: "max-content",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        {dict.length > 0 && (
          <Table striped highlightOnHover>
            <tbody>
              <tr key={currentWord}>
                <td>{currentWord.charAt(0).toUpperCase() + currentWord.slice(1).toLowerCase()}&nbsp;</td>
                <td>
                  <input
                    className="input"
                    value={currentReaction}
                    onChange={(e) => {
                      const newReaction = e.target.value;

                      // Проверяем, что введённое значение содержит хотя бы одну букву
                      const hasLetters = /[a-zA-Zа-яА-Я]/.test(newReaction);

                      if (!hasLetters && newReaction.trim() !== "") {
                        setError(true);
                        return;
                      }

                      setError(false); // Сбрасываем ошибку, если она была

                      // Обновляем текущую сессию без изменения timestamp
                      const updatedSession = session.map((item) =>
                        item.word === currentWord ? { ...item, reaction: newReaction } : item
                      );

                      // Если слово еще не добавлено в сессию, добавляем его
                      if (!session.some((item) => item.word === currentWord)) {
                        updatedSession.push({ word: currentWord, reaction: newReaction });
                      }

                      setSession(updatedSession);
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        )}

        <Group mt="md">
          {error && (
            <Text color="red" size="sm">
              Реакция должна содержать хотя бы одну букву!
            </Text>
          )}
          {success && (
            <Text color="green" size="sm">
              Данные успешно загружены!
            </Text>
          )}
        </Group>

        <Button
          type="submit"
          fullWidth
          mt="md"
          disabled={!currentReaction || loading}
          loading={loading}
          loader={<Loader size="sm" />}
        >
          {currentWordIndex === dict.length - 1 ? "Отправить" : "Далее"}
        </Button>
      </form>
      </Box>
    </>
  );
};

export default FormPage;