import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Container, Table, Title, Text, Center, Flex } from "@mantine/core";
import Header from "../../components/header/Header";
import TableItem from "../../components/tableItem/TableItem";

const StatPage = () => {
  const { user } = useSelector((store) => store.user);
  console.dir(user)
  const [stat, setStat] = useState([]);

  useEffect(() => {
    async function getStat() {
      try {
        const res = await axios.get(`/api/stat/${user.username}`);
        const data = res.data;
  
        // Сортировка данных по алфавиту
        data.sort((a, b) => {
          const nameA = a.word.toLowerCase();
          const nameB = b.word.toLowerCase();
          return nameA.localeCompare(nameB);
        });
  
        setStat(data);
      } catch (err) {
        console.error("Ошибка при получении статистики:", err);
      }
    }
    getStat();
  }, [user.username]);


  return (
    <Container size="xl" px="md">
      <Header />
      <Title order={1} align="center" mt="xl">
        Статистика
      </Title>
      <Text color="dimmed" align="center" mb="xl" fw={500}>
        Здесь вы можете просмотреть все слова и их реакции.
      </Text>
      <Flex style={{display: 'flex'}} justify="center" mt="xl">
        <Table style={{maxWidth: "700px", marginBottom: "40px"}} striped highlightOnHover withBorder withColumnBorders mt="lg">
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
        </Table>
      </Flex>
    </Container>
  );
};

export default StatPage;