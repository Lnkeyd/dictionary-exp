import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Container, Table, Title, Text, Center, Flex, Box, Select, Radio, Group, NumberInput, Button } from "@mantine/core";
import Header from "../../components/header/Header";
import TableItem from "../../components/tableItem/TableItem";
import { useForm } from '@mantine/form';
import * as XLSX from 'xlsx';

const StatPage = () => {
  const { user } = useSelector((store) => store.user);
  const [stat, setStat] = useState([]);
  
    const [loading, setLoading] = useState(false);
    const [loadingDictionaries, setLoadingDictionaries] = useState(false);
    
    const form = useForm({
      initialValues: {
        username: user?.username,
        group: null,
        gender: null,
        age: null
      },
      validate: {
        group: (value) => (!value ? 'Выберите группу' : null),
        gender: (value) => (!value ? 'Выберите пол' : null),
        age: (value) => (!value ? 'Введите возраст' : null),
      },
    });
  
    const handleExport = async () => {
      setLoading(true);
      try {
        // Отправляем запрос на сервер для получения данных
        const response = await fetch('/api/stat/export-stat-data-exel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.values),
        });
    
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
    
        const { userInfo, sessions, summary } = await response.json();
    
        // Преобразуем данные в формат, подходящий для Excel
        const excelData = sessions.flat().map((sessionItem) => ({
          Группа: userInfo.group,
          ID: userInfo.username,
          Username: userInfo.username,
          Стимул: sessionItem.word,
          Реакция: sessionItem.reaction,
          'Дата и время получения стимула': sessionItem.stimulusTime
            ? new Date(sessionItem.stimulusTime).toLocaleString()
            : 'N/A',
          'Дата и время получения реакции': new Date(sessionItem.reactionTime).toLocaleString(),
          Пол: userInfo.gender,
          'Возраст, лет': userInfo.age,
        }));
    
        // Добавляем сводные данные в конец таблицы
        excelData.push(
          {},
          {
            Группа: 'Сводка',
            ID: 'Всего сессий',
            Username: summary.totalSessions,
          },
          {
            Группа: '',
            ID: 'Всего реакций',
            Username: summary.totalReactions,
          },
          {
            Группа: '',
            ID: 'Среднее время реакции (мс)',
            Username: summary.averageReactionTime?.toFixed(2),
          }
        );
    
        // Создаем Excel файл
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Данные");
        XLSX.writeFile(wb, `${user?.username}_personal_stat.xlsx`);
    
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const isFormValid = form.values.group && form.values.gender && form.values.age;

    const handleExportDictionaries = async () => {
      setLoadingDictionaries(true);
      try {
        // Запрашиваем данные с сервера
        const response = await fetch(`/api/stat/build-dictionaries?username=${user?.username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }
    
        // Получаем данные в формате JSON
        const { forward, reverse } = await response.json();
    
        // Функция для добавления пустых строк между группами слов/реакций
        const formatDataWithEmptyRows = (data, keyForGrouping) => {
          const formattedData = [];
          let previousGroup = null;
    
          for (const item of data) {
            const currentGroup = item[keyForGrouping];
    
            if (currentGroup !== previousGroup) {
              // Если это новая группа, добавляем пустую строку
              if (previousGroup !== null) {
                formattedData.push({});
              }
              previousGroup = currentGroup;
            }
            
            if (keyForGrouping === 'word') {
              // Добавляем все реакции/стимулы для текущей группы
              item.allReactions.forEach(reaction => {
                formattedData.push({
                  word: item.word,
                  association: reaction.reaction,
                  count: reaction.count,
                });
              });
            }
            if (keyForGrouping === 'reaction') {
              item.allStimuls.forEach(stimul => {
                formattedData.push({
                  reaction: item.reaction,
                  stimul: stimul.stimul,
                  count: stimul.count,
                });
              });

            }
          }
    
          return formattedData;
        };
    
        // Форматируем данные для прямого словаря
        const formattedForward = formatDataWithEmptyRows(forward, 'word');
    
        // Форматируем данные для обратного словаря
        const formattedReverse = formatDataWithEmptyRows(reverse, 'reaction');
    
        // Создаем Excel файл
        const wb = XLSX.utils.book_new();
    
        // Лист для прямого словаря
        const forwardWs = XLSX.utils.json_to_sheet(formattedForward);
        XLSX.utils.book_append_sheet(wb, forwardWs, "Прямой словарь");
    
        // Лист для обратного словаря
        const reverseWs = XLSX.utils.json_to_sheet(formattedReverse);
        XLSX.utils.book_append_sheet(wb, reverseWs, "Обратный словарь");
    
        // Сохраняем файл
        XLSX.writeFile(wb, `${user?.username}_dictionaries.xlsx`);
    
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setLoadingDictionaries(false);
      }
    };


  return (
    <Container size="xl" px="md">
      <Header />
      <Title order={1} align="center" mt="xl">
        Статистика
      </Title>
      <Text color="dimmed" align="center" mb="xl" fw={500}>
        Получить статистику прохождения эксперимента.
      </Text>
      <Flex style={{ display: "flex" }} justify="center" mt="xl">
        {/* <Table style={{maxWidth: "700px", marginBottom: "40px"}} striped highlightOnHover withBorder withColumnBorders mt="lg">
          <thead>
            <tr>
              <th>Слово</th>
              <th>Реакции</th>
            </tr>
          </thead>
          <tbody>
            {stat.length > 0 ? (
              stat.map((item) => <TableItem key={item._id} row={item} />)
            ) : (
              <tr>
                <td colSpan={2}>
                  <Text align="center" color="dimmed">
                    Нет данных для отображения.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table> */}
        <Box maw={400} mx="auto">
          <form onSubmit={form.onSubmit(handleExport)}>
            <Select
              label="Группа"
              placeholder="Выберите группу"
              data={["244-321", "244-322"]}
              {...form.getInputProps("group")}
            />

            <Radio.Group label="Пол" mt="md" {...form.getInputProps("gender")}>
              <Group mt="xs">
                <Radio value="мужской" label="Мужской" />
                <Radio value="женский" label="Женский" />
              </Group>
            </Radio.Group>

            <NumberInput
              mt="md"
              label="Возраст (лет)"
              min={5}
              max={120}
              {...form.getInputProps("age")}
            />

            <Button
              type="submit"
              mt="xl"
              disabled={!isFormValid}
              loading={loading}
            >
              Получить данные в Excel
            </Button>
            
            <Button
              type="button"
              mt="xl"
              disabled={!user}
              loading={loadingDictionaries}
              onClick={handleExportDictionaries}
            >
              Получить прямой и обратный словари в Excel
            </Button>

          </form>
        </Box>
      </Flex>
    </Container>
  );
};

export default StatPage;


