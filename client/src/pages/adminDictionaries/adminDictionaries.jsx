import React, { useState, useEffect } from "react";
import {
  Card,
  Group,
  Text,
  Button,
  Modal,
  TextInput,
  ScrollArea,
  ActionIcon,
  Checkbox,
  FileInput,
} from "@mantine/core";
import axios from "axios";
import Header from "../../components/header/Header";

const AdminDictionaries = () => {
  const [dictionaries, setDictionaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [openedAssignModal, setOpenedAssignModal] = useState(false);
  const [openedWordsModal, setOpenedWordsModal] = useState(false);
  const [openedAddModal, setOpenedAddModal] = useState(false);
  const [selectedDict, setSelectedDict] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [newWords, setNewWords] = useState([]);   // Состояние для хранения новых слов
  const [openedDeleteModal, setOpenedDeleteModal] = useState(false); 

  // Загрузка всех словарей
  useEffect(() => {
    axios
      .get("/api/admin/dictionaries")
      .then((res) => {setDictionaries(res.data);})
      .catch((err) => console.error(err));
  }, []);

  // Загрузка всех пользователей
  useEffect(() => {
    axios
      .get("/api/admin/users")
      .then((res) => {
        const usersWithChecked = res.data.map((user) => ({
          ...user,
          checked: false,
        }));
        setUsers(usersWithChecked);
      })
      .catch((err) => console.error(err));
  }, []);

  // Назначение словаря
  const handleAssign = async () => {
    const selectedUsers = users.filter((user) => user.checked);
    const payload = {
      dictId: selectedDict.id,
      users: selectedUsers.map((user) => user.username)
    };
    try {
      await axios.post("/api/admin/assign-dictionary", payload);
      setOpenedAssignModal(false);
      setUsers([])
    } catch (err) {
      console.error(err);
    }
  };

  // Добавление нового слова
  // const handleAddWord = () => {
  //   setNewWords([...newWords, ""]); // Добавляем пустое слово
  // };

  // Удаление слова
  // const handleRemoveWord = (index) => {
  //   const updatedWords = newWords.filter((_, i) => i !== index);
  //   setNewWords(updatedWords);
  // };

  // Изменение слова
  // const handleChangeWord = (index, value) => {
  //   const updatedWords = [...newWords];
  //   updatedWords[index] = value;
  //   setNewWords(updatedWords);
  // };

  const handleChangeWord = (index, value) => {
    setNewWords((prevWords) =>
      prevWords.map((word, i) => (i === index ? value : word))
    );
  };
  
  const handleRemoveWord = (index) => {
    setNewWords((prevWords) => prevWords.filter((_, i) => i !== index));
  };

  // Сохранение нового набора слов
  const handleSaveDictionary = async () => {
    const wordsToSave = newWords.slice(0, 120); 

    try {
      await axios.post("/api/admin/add-dictionary", {
        DictName: "",
        words: wordsToSave,
        label: newLabel,
        id: Number(`${Math.floor(Math.random() * 9999)}${Math.floor(Math.random() * 9999)}${Math.floor(Math.random() * 9999)}`)
      });
      setOpenedAddModal(false);
      setNewLabel("");
      setNewWords([]); // Очистка формы
      const res = await axios.get("/api/admin/dictionaries");
      setDictionaries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

    // Удаление словаря
    const handleDeleteDictionary = async () => {
      try {
        await axios.delete(`/api/admin/dictionaries/${selectedDict.id}`);
        setOpenedDeleteModal(false);
        setSelectedDict(null);
  
        // Обновляем список словарей после удаления
        const res = await axios.get("/api/admin/dictionaries");
        setDictionaries(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const handleFileUpload = (file) => {
      if (!file) return;
    
      const reader = new FileReader();
    
      reader.onload = (event) => {
        const text = event.target.result;
        const parsedWords = parseCSV(text);
    
        // Ограничиваем количество слов до 120
        const limitedWords = parsedWords.slice(0, 120);
    
        // Обновляем массив слов
        setNewWords((prevWords) => [...prevWords, ...limitedWords]);
      };
    
      reader.readAsText(file);
    };
    
    // Функция для парсинга CSV
    const parseCSV = (csvText) => {
      const rows = csvText.split('\n'); // Разделяем строки
      return rows
        .map((row) => row.split(',')[0].trim()) // Берём первый столбец и удаляем лишние пробелы
        .filter((word) => word.length > 0); // Убираем пустые строки
    };
    
    const handleAddWord = () => {
      if (newWords.length >= 120) {
        alert("Максимальное количество слов — 120.");
        return;
      }
    
      setNewWords((prevWords) => [...prevWords, ""]);
    };

  return (
    <>
    <Header />
    <div style={{maxWidth: '1200px', margin: '0 auto'}}>
      <h1>Наборы слов</h1>
      <Group>
      {dictionaries.map((dict) => (
          <Card
            key={dict._id}
            shadow="sm"
            p="lg"
            style={{ width: 200, cursor: "pointer", position: "relative" }}
            onClick={() => {
              setSelectedDict(dict)
              setOpenedWordsModal(true)
            }}
          >
            {/* Кнопка удаления (крестик) */}
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDict(dict);
                setOpenedDeleteModal(true);
              }}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
              }}
            >
              X
            </ActionIcon>

            {/* Основной контент карточки */}
            <Text weight={500}>{dict?.label}</Text>
            <Text size="sm" color="dimmed" mt="xs">
              Слов: {dict.words?.length || 0}
            </Text>
            <Button
              mt="md"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDict(dict);
                setOpenedAssignModal(true);
              }}
            >
              + Назначить
            </Button>
          </Card>
        ))}

      {/* Модальное окно для просмотра слов */}
      <Modal
        opened={openedWordsModal}
        onClose={() => setOpenedWordsModal(false)}
        title={`Слова из словаря: ${selectedDict?.label}`}
      >
        <ScrollArea style={{ maxHeight: 300 }}>
          {selectedDict?.words?.map((word, index) => (
            <Text key={index} size="sm" mb="xs">
              {word}
            </Text>
          ))}
        </ScrollArea>
      </Modal>

        {/* Модальное окно для подтверждения удаления */}
      <Modal
        opened={openedDeleteModal}
        onClose={() => {
          setOpenedDeleteModal(false);
          setSelectedDict(null);
        }}
        title="Удалить набор слов?"
      >
        <Text size="sm" mb="md">
          Вы уверены, что хотите удалить набор слов "{selectedDict?.label}"?
        </Text>
        <Group position="right">
          <Button
            variant="outline"
            onClick={() => setOpenedDeleteModal(false)}
          >
            Отмена
          </Button>
          <Button color="red" onClick={handleDeleteDictionary}>
            Удалить
          </Button>
        </Group>
      </Modal>
        {/* Карточка для добавления нового набора */}
        <Card
          shadow="sm"
          p="lg"
          style={{ width: 200, cursor: "pointer" }}
          onClick={() => setOpenedAddModal(true)}
        >
          <Text weight={500}>Добавить набор</Text>
          <Button mt="md" fullWidth>
            + Добавить
          </Button>
        </Card>
      </Group>

      {/* Модальное окно для просмотра слов */}
      <Modal
        opened={openedWordsModal}
        onClose={() => setOpenedWordsModal(false)}
        title={`Слова из словаря: ${selectedDict?.label}`}
      >
        <ScrollArea style={{ maxHeight: 300, overflowY: "scroll" }}>
          {selectedDict?.words?.map((word, index) => (
            <Text key={index} size="sm" mb="xs">
              {word}
            </Text>
          ))}
        </ScrollArea>
      </Modal>

      {/* Модальное окно для назначения словаря */}
      <Modal
        opened={openedAssignModal}
        onClose={() => setOpenedAssignModal(false)}
        title="Назначить словарь"
      >
        <div>
          {users.map((user) => (
            <Checkbox
              key={user.username}
              label={user.username}
              checked={(Number(user.active_dict_id) === Number(selectedDict?.id)) || user.checked}
              onChange={(e) => {
                const updatedUsers = users.map((u) =>
                  u.username === user.username
                    ? { ...u, checked: e.target.checked }
                    : u
                );
                setUsers(updatedUsers);
              }}
            />
          ))}
        </div>
        <Group position="right" mt="md">
          <Button variant="outline" onClick={() => setOpenedAssignModal(false)}>
            Отмена
          </Button>
          <Button onClick={handleAssign}>Подтвердить</Button>
        </Group>
      </Modal>

      {/* Модальное окно для добавления нового набора */}
      {/* <Modal
        opened={openedAddModal}
        onClose={() => setOpenedAddModal(false)}
        title="Добавить новый набор слов"
        size="lg"
      >
        <TextInput
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          mb="sm"
        />
        <ScrollArea style={{ maxHeight: 300 }}>
          {newWords.map((word, index) => (
            <Group key={index} mb="sm" align="flex-start">
              <TextInput
                placeholder="Слово"
                value={word}
                onChange={(e) => handleChangeWord(index, e.target.value)}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="outline"
                onClick={() => handleRemoveWord(index)}
              >
                X
              </ActionIcon>
            </Group>
          ))}
        </ScrollArea>
        <Group position="center" mt="md">
          <Button variant="outline" onClick={handleAddWord}>
            Добавить слово
          </Button>
        </Group>
        <Group position="right" mt="md">
          <Button onClick={handleSaveDictionary}>Сохранить</Button>
        </Group>
      </Modal> */}
      <Modal
        opened={openedAddModal}
        onClose={() => setOpenedAddModal(false)}
        title="Добавить новый набор слов"
        size="lg"
      >
        <TextInput
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          mb="sm"
        />
        
        {/* Поле для загрузки CSV-файла */}
        <FileInput
          label="Загрузить CSV файл"
          placeholder="Выберите файл"
          accept=".csv"
          onChange={handleFileUpload}
          mb="sm"
        />

        <ScrollArea style={{ maxHeight: 300, overflowY: 'scroll', paddingRight: '16px'}}>
          {newWords.map((word, index) => (
            <Group key={index} mb="sm" align="flex-start">
              <TextInput
                placeholder="Слово"
                value={word}
                onChange={(e) => handleChangeWord(index, e.target.value)}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="outline"
                onClick={() => handleRemoveWord(index)}
              >
                X
              </ActionIcon>
            </Group>
          ))}
        </ScrollArea>

        <Group position="center" mt="md">
          <Button variant="outline" onClick={handleAddWord}>
            Добавить слово
          </Button>
        </Group>

        <Group position="right" mt="md">
          <Button onClick={handleSaveDictionary}>Сохранить</Button>
        </Group>
      </Modal>
    </div>
    </>
  );
};

export default AdminDictionaries;