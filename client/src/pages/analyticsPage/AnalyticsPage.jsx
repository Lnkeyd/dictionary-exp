import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/header/Header";
import {
  Title,
  Table,
  TextInput,
  Button,
  Group,
  Text,
  Box,
  Tabs,
  MultiSelect,
} from "@mantine/core";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import analyzedData from '../../python/analyzed_data_default.json'
import FrequencyChart from "../../components/charts/FrequencyChart";
import TimelineChart from "../../components/charts/TimlineChart";
import TimeOfDayChart from "../../components/charts/TimeOfDayChart";

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    word: "",
    startDate: "",
    endDate: "",
    selectedReactions: [], // Новый фильтр для выбранных реакций
    selectedUsers: [],
  });
  const [activeTab, setActiveTab] = useState("frequency");

  // Загрузка данных
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/admin/analytics", {
        params: {
          word: filters.word,
          startDate: filters.startDate ? filters.startDate.toISOString() : null,
          endDate: filters.endDate ? filters.endDate.toISOString() : null,
          usernames: filters.selectedUsers?.length > 0 ? filters?.selectedUsers.join(",") : null,
        },
      });
      response.data.forEach((item, index) => {
        const foundIndex = analyzedData.findIndex((t) => t.timestamp === item.timestamp)
        if (foundIndex) {
            console.log("FOUND!")
            response.data[index] = {...item, syntagmatic_relationship: analyzedData[foundIndex]?.syntagmatic_relationship || [], paradigmatic_relationship: analyzedData[foundIndex]?.paradigmatic_relationship || []}
        }
      })
      setData(response.data);
      console.log(data)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  // // Обработка изменения фильтров
  // const handleFilterChange = (field, value) => {
  //   if (field === "startDate" || field === "endDate") {
  //     const dateValue = value ? new Date(value) : null;
  //     setFilters((prev) => ({ ...prev, [field]: dateValue }));
  //   } else if (field === "selectedReactions") {
  //     setFilters((prev) => ({ ...prev, [field]: value }));
  //   } else {
  //     setFilters((prev) => ({
  //       ...prev,
  //       [field]: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  //     }));
  //   }
  // };

  const handleFilterChange = (field, value) => {
    if (field === "startDate" || field === "endDate") {
      const dateValue = value ? new Date(value) : null;
      setFilters((prev) => ({ ...prev, [field]: dateValue }));
    } else if (field === "selectedReactions" || field === "selectedUsers") {
      setFilters((prev) => ({ ...prev, [field]: value }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
      }));
    }
  };

  // Функция для генерации фиксированных цветов
  const getFixedColor = (relation) => {
    const colors = [
      "#FF6384", // Красный
      "#36A2EB", // Синий
      "#FFCE56", // Жёлтый
      "#4BC0C0", // Зелёный
      "#9966FF", // Фиолетовый
      "#FF9F40", // Оранжевый
    ];
    const hash = relation.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Фильтрация данных по выбранным реакциям
  // const filteredData = data.filter((item) =>
  //   filters.selectedReactions.includes(item.reaction)
  // );

  const [filteredData, setFilteredData] = useState(data.filter((item) => {
    const matchesReaction = filters.selectedReactions.includes(item.reaction);
    const matchesUser = filters.selectedUsers.length === 0 || filters.selectedUsers.includes(item.username);
    return matchesReaction && matchesUser;
  }))
  useEffect(() => {
    console.log("DATA", data)
    console.log(filters)
    console.log(filters.selectedUsers)
    setFilteredData(data.filter((item) => {
      // console.log(item)
      const matchesReaction = filters.selectedReactions.length === 0 || filters.selectedReactions.includes(item.reaction);
      const matchesUser = filters.selectedUsers.length === 0 || filters.selectedUsers.includes(item.username);
      return matchesReaction && matchesUser;
    }))
    console.log(filteredData)
  }, [data, filters, filters.selectedReactions, filters.selectedUsers])

  // Группировка данных для синтагматических отношений
  const syntagmaticRelations = filteredData.reduce((acc, item) => {
    if (!acc[item.syntagmatic_relationship]) acc[item.syntagmatic_relationship] = 0;
    acc[item.syntagmatic_relationship]++;
    return acc;
  }, {});

  // Группировка данных для парадигматических отношений
  const paradigmaticRelations = filteredData?.reduce((acc, item) => {
    const relations = item?.paradigmatic_relationship?.split(", ");
    relations?.forEach((relation) => {
      if (!acc[relation]) acc[relation] = 0;
      acc[relation]++;
    });
    return acc;
  }, {});

  // Подготовка данных для графика синтагматических отношений
  const syntagmaticChartData = {
    labels: Object.keys(syntagmaticRelations),
    datasets: [
      {
        label: "Синтагматические отношения",
        data: Object.values(syntagmaticRelations),
        backgroundColor: Object.keys(syntagmaticRelations)?.map(getFixedColor),
      },
    ],
  };

  // Подготовка данных для графика парадигматических отношений
  const paradigmaticChartData = {
    labels: Object.keys(paradigmaticRelations),
    datasets: [
      {
        label: "Парадигматические отношения",
        data: Object.values(paradigmaticRelations),
        backgroundColor: Object.keys(paradigmaticRelations).map(getFixedColor),
      },
    ],
  };

  return (
    <>
      <Header />
      <Box p="md">
        <Title order={2} align="center" mb="lg">
          Аналитика ответов пользователей
        </Title>

        {/* Фильтры */}
        <Group mb="md">
          <TextInput
            placeholder="Слово"
            value={filters.word}
            onChange={(e) => handleFilterChange("word", e.target.value)}
          />
          <TextInput
            type="date"
            placeholder="Дата начала"
            value={filters.startDate ? filters.startDate.toISOString().split("T")[0] : ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
          <TextInput
            type="date"
            placeholder="Дата окончания"
            value={filters.endDate ? filters.endDate.toISOString().split("T")[0] : ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
          <Button onClick={fetchData}>Применить фильтры</Button>
        </Group>

        <Group mt="sm">
          <MultiSelect
            label="Выбрать реакции"
            data={[
              { value: "All", label: "Выбрать все" },
              { value: "Clear", label: "Очистить" },
              ...Array.from(new Set(data.map((item) => item.reaction)))
                .sort()
                .map((reaction) => ({ value: reaction, label: reaction })),
            ]}
            value={filters.selectedReactions}
            searchable
            nothingFoundMessage="Нет подходящих реакций"
            onChange={(value) => {
              if (value.includes("All")) {
                handleFilterChange("selectedReactions", Array.from(new Set(data.map((item) => item.reaction))));
              } else if (value.includes("Clear")) {
                handleFilterChange("selectedReactions", []);
              } else {
                handleFilterChange("selectedReactions", value);
              }
            }}
          />
          <MultiSelect
            label="Выберите пользователей"
            data={Array.from(new Set(data.map(item => item.username))).filter(Boolean).map(username => ({
              value: username,
              label: username,
            }))}
            value={filters.selectedUsers}
            onChange={(value) =>
              handleFilterChange("selectedUsers", value)
            }
            searchable
            nothingFoundMessage="Пользователь не найден"
          />
          <Button onClick={() => axios.get("/api/admin/export")}>Экспорт данных</Button>
        </Group>

        {/* Табы */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="frequency">Частота реакций</Tabs.Tab>
            <Tabs.Tab value="timeline">Динамика во времени</Tabs.Tab>
            <Tabs.Tab value="timeOfDay">Активность по временным интервалам</Tabs.Tab>
            <Tabs.Tab value="relations">Отношения</Tabs.Tab> {/* Новый таб */}
          </Tabs.List>

          {/* Вкладка: Частота реакций */}
          <Tabs.Panel value="frequency">
            {/* Реализация частоты реакций */}
            <FrequencyChart data={filteredData} getFixedColor={getFixedColor}/>
          </Tabs.Panel>

          {/* Вкладка: Динамика во времени */}
          <Tabs.Panel value="timeline">
            <TimelineChart data={filteredData} getFixedColor={getFixedColor}/>
          </Tabs.Panel>

          {/* Вкладка: Активность по временным интервалам */}
          <Tabs.Panel value="timeOfDay">
            {/* Реализация активности по временным интервалам */}
            <TimeOfDayChart data={filteredData} getFixedColor={getFixedColor}/>
          </Tabs.Panel>

          {/* Вкладка: Отношения */}
          <Tabs.Panel value="relations">
            <Tabs defaultValue="syntagmatic">
              <Tabs.List>
                <Tabs.Tab value="syntagmatic">Синтагматические</Tabs.Tab>
                <Tabs.Tab value="paradigmatic">Парадигматические</Tabs.Tab>
              </Tabs.List>

              {/* Синтагматические отношения */}
              <Tabs.Panel value="syntagmatic">
                {filteredData.length > 0 && (
                  <Bar data={syntagmaticChartData} options={{ responsive: true }} />
                )}
                {filteredData.length === 0 && (
                  <Text align="center" color="dimmed">
                    Нет данных для анализа синтагматических отношений.
                  </Text>
                )}
              </Tabs.Panel>

              {/* Парадигматические отношения */}
              <Tabs.Panel value="paradigmatic">
                {filteredData.length > 0 && (
                  <Bar  data={paradigmaticChartData} options={{ responsive: true }} />
                )}
                {filteredData.length === 0 && (
                  <Text align="center" color="dimmed">
                    Нет данных для анализа парадигматических отношений.
                  </Text>
                )}
              </Tabs.Panel>
            </Tabs>
          </Tabs.Panel>
        </Tabs>

        {/* Таблица */}
        <Table striped highlightOnHover mt="xl">
          <thead>
            <tr>
              <th>Слово</th>
              <th>Реакция</th>
              <th>Время</th>
              <th>Синтагматическое отношение</th>
              <th>Парадигматическое отношение</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.word}</td>
                  <td>{item.reaction}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td>{item?.syntagmatic_relationship || ''}</td>
                  <td>{item?.paradigmatic_relationship || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <Text align="center" color="dimmed">
                    Нет данных
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Box>
    </>
  );
};

export default AnalyticsPage;