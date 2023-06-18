import React, { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import { useDispatch, useSelector } from "react-redux";
import { initSession, removeUserToken } from "../../store/userSlice";
import { Navigate } from "react-router";
import axios from "axios";
import WordInput from "../../components/wordInput/WordInput";
import styles from "./FormPage.module.scss";

const FormPage = () => {
  const dispatch = useDispatch();
  const [dict, setDict] = useState([]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, session } = useSelector((store) => store.user);

  useEffect(() => {
    if (!user) {
      Navigate({ to: "/", replace: true });
    }
    getData();
  }, [user]);

  useEffect(() => {
    dispatch(initSession(dict));
  }, [dict, success]);

  const setupSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const getData = async () => {
    await axios
      .get(`/api/dict`)
      .then((res) => {
        const arrData = res.data.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

        setDict(arrData);
      })
      .catch((err) => {
        if (err.response.data === "no token" || "invalid token") {
          console.log("У вас нет нужного токена");
          dispatch(removeUserToken());
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkFilledAll = session.every((item) => item.reaction.length >= 1);
    // Если не все поля заполнены
    if (!checkFilledAll) {
      setError(true);
      return;
    } else {
      // Отправляем запрос
      await axios
        .post(`/api/dict`, { username: user, session: session })
        .then((res) => {
          setError(false);
          setupSuccess();
          console.log(res);
          console.log("Данные успешно загружены");
          // обнуление значения сессии
          dispatch(initSession(dict));
        })
        .catch((err) => {
          console.log(err);
          if (err?.response?.data === "no token" || "invalid token") {
            console.log("У вас нет нужного токена");
            dispatch(removeUserToken());
          }
        });
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <br />
      <div className={styles.form}>
        <h1 className={styles.header}>Анкета</h1>
        <div>
          <div><h3>Требования к заполнению:</h3></div>
          <div>
          <p>Реакции начинать писать с большой буквы, после слов не оставлять лишних пробелов, заполнять и отправлять данные только один раз, больше не нужно.
Результаты по всем словам всех других людей можно видеть в разделе статистика.</p>
          <p>Можно использовать русские-латинские, цифры и др. спец. символы. Единственное, по-возможности, не использовать букву "ё" и вместо нее писать "е".</p>
          </div>
        </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          {dict &&
            dict.map((item) => (
              <WordInput key={item} word={item} success={success} />
            ))}
          <div>
            {error && <p className={styles.error}>Заполните все поля</p>}
            {success && (
              <p className={styles.success}>Данные успешно загружены!</p>
            )}
          </div>
          <button className={styles.button} type="submit">
            Отправить
          </button>
        </form>
      </div>
      <br />
      <br />
    </div>
  );
};

export default FormPage;
