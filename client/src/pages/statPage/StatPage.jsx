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
  console.dir(user)
  const [stat, setStat] = useState([]);
  
    const [loading, setLoading] = useState(false);
    
    const form = useForm({
      initialValues: {
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
        const response = await fetch('/api/export-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.values),
        });
  
        const { data } = await response.json();
  
        // Создаем Excel файл
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Данные");
        XLSX.writeFile(wb, "exported_data.xlsx");
  
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const isFormValid = form.values.group && form.values.gender && form.values.age;

  // useEffect(() => {
  //   async function getStat() {
  //     try {
  //       const res = await axios.get(`/api/stat/${user.username}`);
  //       const data = res.data;
  
  //       // Сортировка данных по алфавиту
  //       data.sort((a, b) => {
  //         const nameA = a.word.toLowerCase();
  //         const nameB = b.word.toLowerCase();
  //         return nameA.localeCompare(nameB);
  //       });
  
  //       setStat(data);
  //     } catch (err) {
  //       console.error("Ошибка при получении статистики:", err);
  //     }
  //   }
  //   getStat();
  // }, [user.username]);


  return (
    <Container size="xl" px="md">
      <Header />
      <Title order={1} align="center" mt="xl">
        Статистика
      </Title>
      <Text color="dimmed" align="center" mb="xl" fw={500}>
        Здесь вы можете просмотреть все слова и их реакции.
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
              min={1}
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
          </form>
        </Box>
      </Flex>
    </Container>
  );
};

export default StatPage;


