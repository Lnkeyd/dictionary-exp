import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Регистрируем компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FrequencyChart = ({ data, getFixedColor}) => {
  // Группируем данные по реакциям
  const reactionCounts = data.reduce((acc, item) => {
    if (!acc[item.reaction]) acc[item.reaction] = 0;
    acc[item.reaction]++;
    return acc;
  }, {});

  // Подготовка данных для графика
  const chartData = {
    labels: Object.keys(reactionCounts),
    datasets: [
      {
        label: "Частота реакций",
        data: Object.values(reactionCounts),
        backgroundColor: [
          "#FF6384", // Красный
          "#36A2EB", // Синий
          "#FFCE56", // Жёлтый
          "#4BC0C0", // Зелёный
          "#9966FF", // Фиолетовый
          "#FF9F40", // Оранжевый
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <>
      {data.length > 0 && <Bar data={chartData} options={options} />}
      {data.length === 0 && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Нет данных для анализа частоты реакций.
        </p>
      )}
    </>
  );
};

export default FrequencyChart;