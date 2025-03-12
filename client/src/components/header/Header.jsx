import React from "react";
import {
  Group,
  Anchor,
  Button,
  Burger,
  Box,
  useMantineTheme,
} from "@mantine/core";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { removeAuthUser } from "../../store/userSlice";
import {BiLogOut} from 'react-icons/bi'
import {BsFillClipboardCheckFill} from 'react-icons/bs'
import {IoStatsChart} from 'react-icons/io5'
import { FaUserCircle } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { useMediaQuery } from "@mantine/hooks";


const Menu = () => {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const [opened, setOpened] = React.useState(false);
  const { user } = useSelector((store) => store.user);

  // Используем useMediaQuery для проверки ширины экрана
  const isLargeScreen = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);

  const handleLogout = async () => {
    try {
      await axios.post("/api/login/logout");
      console.log("User logged out!");
      dispatch(removeAuthUser());
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: theme.colors.blue[0],
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}
    >
      {/* Левая часть: Навигация */}
      <Group spacing="xl">
        <Anchor
          component={Link}
          to="/form"
          size="sm"
          color="gray.7"
          sx={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <BsFillClipboardCheckFill />
          Анкета
        </Anchor>
        {/* <Anchor
          component={Link}
          to="/stat"
          size="sm"
          color="gray.7"
          sx={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <IoStatsChart />
          Статистика
        </Anchor> */}
        {(user?.role === 2) ?
            <Anchor
            component={Link}
            to="/admin-dictionaries"
            size="sm"
            color="gray.7"
            sx={{ display: "flex", alignItems: "center", gap: 4 }}
            >
        <FaBookmark />
          Наборы слов
        </Anchor> : ''
        }
        {(user?.role === 2) &&
              <Anchor
              component={Link}
              to="/admin/users"
              size="sm"
              color="gray.7"
              sx={{ display: "block", marginBottom: "10px" }}
              >
            <FaUserCircle />
            Пользователи
          </Anchor>
        }
      </Group>

      {/* Правая часть: Кнопка выхода */}
      <Button
        variant="outline"
        color="red"
        leftIcon={<BiLogOut />}
        onClick={handleLogout}
        sx={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        Выйти
      </Button>
    </Box>
  );
};

export default Menu;