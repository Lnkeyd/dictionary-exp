import React from "react";
import { Table, Text } from "@mantine/core";

const TableItem = ({ row }) => {
  // Сортировка реакций по количеству
  const sortedReactions = [...row.allReactions].sort((a, b) => b.count - a.count);

  // Форматирование строк реакций
  const stringReactions = sortedReactions
    .map((item) => `${item.reaction} (${item.count})`)
    .join(", ");

  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={500}>{row.word}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{stringReactions}</Text>
      </Table.Td>
    </Table.Tr>
  );
};

export default TableItem;