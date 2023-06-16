import React, { useContext, useRef, useState } from "react";
import styles from "./AuthPage.module.scss";
import { Navigate } from "react-router";
import { authUser } from "../../services/auth.service";
import { useDispatch, useSelector } from "react-redux";
import { setUserToken } from "../../store/userSlice";

const AuthPage = () => {
  const userRef = useRef();
  const passwordRef = useRef();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);
  const [error, setError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await authUser(
      userRef.current.value,
      passwordRef.current.value
    );
    if (!token) {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 2000)
    }
    else {
      setError(false)
    }
    dispatch(setUserToken(token));
  };

  return (
    <div className={styles.page}>
      {user && <Navigate to="/form" replace={true} />}
      <div className={styles.container}>
        <div>
          <h1 className={styles.header}>Авторизация</h1>
        </div>
        <form action="" className="loginForm" onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Введите username..."
              ref={userRef}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Пароль</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Введите пароль..."
              ref={passwordRef}
            />
          </div>
          <button className={styles.button} type="submit">
            Войти
          </button>
          {error && <p className={styles.error}>Такого пользователя не существует</p>}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
