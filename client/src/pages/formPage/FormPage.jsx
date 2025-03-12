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
} from "@mantine/core";
import { useSelector } from "react-redux";
import Header from "../../components/header/Header";

const FormPage = () => {
  const navigate = useNavigate();
  const [dict, setDict] = useState([]); // Словарь слов
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Индекс текущего слова
  const [session, setSession] = useState([]); // Текущая сессия (слово-реакция)
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  // Проверка авторизации пользователя
  const { user } = useSelector((store) => store.user);
  // const user = JSON.parse(localStorage.getItem("authUser"));
  console.log("User in FormPage:", user);

  useEffect(() => {
    console.log("Dict updated:", dict);
  }, [dict]);

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

  // Загрузка данных из localStorage
  const loadFromLocalStorage = () => {
    const savedData = JSON.parse(localStorage.getItem("formSession"));
    if (savedData && savedData.username === user?.username) {
      setSession(savedData.session);
    }
  };

  // Сохранение данных в localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem(
      "formSession",
      JSON.stringify({ username: user?.username, session })
    );
  };

  // Получение данных о словах с сервера
  const getData = async () => {
    try {
      console.log('TRY TO GET DATA')
      const res = await axios.get(`/api/dict/${user?.username}`);
      console.log("GET DICT RES: ", res)
      const arrData = res.data
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      setDict(arrData);
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
      const originalWords = dict;
      const submittedWords = session.map((item) => item.word);

      if (
        originalWords.length !== submittedWords.length ||
        !originalWords.every((word, index) => word === submittedWords[index])
      ) {
        throw new Error("Несоответствие списка слов!");
      }

      await axios.post(`/api/dict`, { username: user?.username, session });
      setNotification({ type: "success", message: "Данные успешно отправлены! Возвращайтесь через некоторое время чтобы пройти эксперимент ещё раз." });
      localStorage.setItem(
        "formSession",
        JSON.stringify({ username: user?.username, session: []})
      );
      setSession([])
      setCurrentWordIndex(0)
      setTimeout(() => {
        navigate("/form");
      }, 5000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Ошибка при отправке данных!",
      });
    }
  };

  // Текущее слово и реакция
  const currentWord = dict[currentWordIndex];
  const currentReaction = session.find((item) => item.word === currentWord)?.reaction || "";

  return (
    <>
      <Header/>
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
                    Реакции начинать писать с большой буквы, после слов не оставлять лишних пробелов,
                    заполнять и отправлять данные только один раз, больше не нужно. Результаты по всем
                    словам всех других людей можно видеть в разделе статистика.
                  </p>
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
                  <td>{currentWord}&nbsp;</td>
                  <td>
                    <input
                      className="input"
                      value={currentReaction}
                      onChange={(e) => {
                        const newReaction = e.target.value;

                        // Обновляем текущую сессию
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
                Заполните все поля
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
            disabled={!currentReaction.trim()}
          >
            {currentWordIndex === dict.length - 1 ? "Отправить" : "Далее"}
          </Button>
        </form>
      </Box>
    </>
  );
};

export default FormPage;