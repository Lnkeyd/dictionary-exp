import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  Select,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import Header from "../../components/header/Header";


const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [openedCreateModal, setOpenedCreateModal] = useState(false);
  const [openedEditModal, setOpenedEditModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    level: '1',
  });

  // Загрузка пользователей с сервера
  useEffect(() => {
    fetch('/api/admin/users') // Замените на ваш API-эндпоинт
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Ошибка загрузки пользователей:', error));
  }, []);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Создание нового пользователя
  const handleCreateUser = () => {
    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((newUser) => {
        setUsers([...users, newUser]);
        setOpenedCreateModal(false);
        setFormData({ username: '', password: '', level: '1' });
      })
      .catch((error) => console.error('Ошибка создания пользователя:', error));
  };

  // Редактирование пользователя
  const handleEditUser = () => {
    fetch(`/api/admin/users/${currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((updatedUser) => {
        setUsers(users.map((user) => (user._id === currentUserId ? updatedUser : user)));
        setOpenedEditModal(false);
        setCurrentUserId(null);
        setFormData({ username: '', password: '', level: '1' });
      })
      .catch((error) => console.error('Ошибка редактирования пользователя:', error));
  };

  // Удаление пользователя
  const handleDeleteUser = (userId) => {
    fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      .then(() => {
        setUsers(users.filter((user) => user._id !== userId));
      })
      .catch((error) => console.error('Ошибка удаления пользователя:', error));
  };

  return (
    <div>
        <Header/>
      <Text weight={700} size="xl" mb="md" style={{width: '100%', textAlign: 'center', marginTop: '20px'}}>
        Управление пользователями
      </Text>

        <div style={{display: 'flex', justifyContent: 'center'}}>
        {/* Кнопка для создания нового пользователя */}
        <Button
            leftIcon={<IconPlus />}
            onClick={() => setOpenedCreateModal(true)}
            style={{margin: '0 auto'}}
            mb="md"
            
            >
            Создать пользователя
        </Button>
        </div>

      {/* Таблица пользователей */}
      <Table striped highlightOnHover style={{maxWidth: '700px', margin: '0 auto'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Уровень</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.username}</td>
                <td>{user.level}</td>
                <td>
                  <Group spacing="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => {
                        setCurrentUserId(user._id);
                        setFormData({ username: user.username, password: user.password, level: String(user.level) });
                        setOpenedEditModal(true);
                      }}
                    >
                      <IconEdit />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" align="center">
                Нет пользователей
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Модальное окно для создания пользователя */}
      <Modal
        opened={openedCreateModal}
        onClose={() => setOpenedCreateModal(false)}
        title="Создать нового пользователя"
      >
        <TextInput
          label="Имя пользователя"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          mb="sm"
        />
        <TextInput
          label="Пароль"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          mb="sm"
        />
        <Select
          label="Уровень"
          name="level"
          value={formData.level}
          onChange={(value) => setFormData({ ...formData, level: value })}
          data={['1', '2', '3']}
          required
          mb="sm"
        />
        <Button onClick={handleCreateUser}>Создать</Button>
      </Modal>

      {/* Модальное окно для редактирования пользователя */}
      <Modal
        opened={openedEditModal}
        onClose={() => setOpenedEditModal(false)}
        title="Редактировать пользователя"
      >
        <TextInput
          label="Имя пользователя"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          mb="sm"
        />
        <TextInput
          label="Пароль"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          mb="sm"
        />
        <Select
          label="Уровень"
          name="level"
          value={formData.level}
          onChange={(value) => setFormData({ ...formData, level: value })}
          data={['1', '2', '3']}
          required
          mb="sm"
        />
        <Button onClick={handleEditUser}>Сохранить изменения</Button>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;