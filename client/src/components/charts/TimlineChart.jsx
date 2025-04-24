import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// Регистрируем компоненты Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const TimelineChart = ({ data, getFixedColor }) => {
  // Группировка данных по дням и реакциям
  const timelineData = data.reduce((acc, item) => {
    const date = new Date(item.timestamp).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = {};
    if (!acc[date][item.reaction]) acc[date][item.reaction] = 0;
    acc[date][item.reaction]++;
    return acc;
  }, {});

  const reactions = Array.from(new Set(data.map((item) => item.reaction)));

  // Подготовка данных для графика
  const chartData = {
    labels: Object.keys(timelineData),
    datasets: reactions.map((reaction) => ({
      label: reaction,
      data: Object.keys(timelineData).map((date) => timelineData[date][reaction] || 0),
      borderColor: getFixedColor(reaction),
      fill: false,
    })),
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
      {data.length > 0 && <Line data={chartData} options={options} />}
      {data.length === 0 && (
        <p style={{ textAlign: "center", color: "gray" }}>
          Нет данных для анализа динамики во времени.
        </p>
      )}
    </>
  );
};

export default TimelineChart;