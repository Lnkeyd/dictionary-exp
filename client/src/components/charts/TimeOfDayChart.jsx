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

const TimeOfDayChart = ({ data, getFixedColor }) => {
  // Группировка данных по временным интервалам
  const timeOfDayData = data.reduce((acc, item) => {
    const hour = new Date(item.timestamp).getHours();
    const period =
      hour < 6 ? "Ночь" : hour < 12 ? "Утро" : hour < 18 ? "День" : "Вечер";
    if (!acc[period]) acc[period] = 0;
    acc[period]++;
    return acc;
  }, {});

  // Подготовка данных для графика
  const chartData = {
    labels: Object.keys(timeOfDayData),
    datasets: [
      {
        label: "Активность по временным интервалам",
        data: Object.values(timeOfDayData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
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
          Нет данных для анализа активности по временным интервалам.
        </p>
      )}
    </>
  );
};

export default TimeOfDayChart;