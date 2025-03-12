import React, { useRef, useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Group,
  Box,
  Loader,
} from "@mantine/core";
import { Navigate, useNavigate } from "react-router";
import { authUser } from "../../services/auth.service";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../store/userSlice";

const AuthPage = () => {
  const userRef = useRef();
  const passwordRef = useRef();
  const dispatch = useDispatch();
  const { token } = useSelector((store) => store.user);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = await authUser(
        userRef.current.value,
        passwordRef.current.value
      );
      // Сохраняем токен в Redux
      dispatch(setAuthUser(data));
    } catch (err) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
    } finally {
      setLoading(false); // Выключаем загрузку
    }
  };

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[1],
      })}
      style={{
        maxWidth: "500px",
        margin: "150px auto",
        marginTop: "150px",
      }}
    >
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        withBorder
        sx={(theme) => ({
          maxWidth: 400,
          width: "100%",
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.white,
        })}
      >
        <Title order={2} align="center" mb="lg">
          Авторизация
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Имя пользователя"
            placeholder="Введите username..."
            ref={userRef}
            required
            mb="sm"
          />

          <TextInput
            label="Пароль"
            placeholder="Введите пароль..."
            type="password"
            ref={passwordRef}
            required
            mb="md"
          />

          <Button
            type="submit"
            fullWidth
            mb="md"
            loading={loading}
            loader={<Loader size="sm" />}
          >
            {loading ? "Загрузка..." : "Войти"}
          </Button>

          {error && (
            <Text color="red" size="sm" align="center">
              Такого пользователя не существует
            </Text>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default AuthPage;