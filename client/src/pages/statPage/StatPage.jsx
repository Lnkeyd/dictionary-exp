import React, { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import axios from "axios";
import { useSelector } from "react-redux";
import TableItem from "../../components/tableItem/TableItem";
import styles from "./StatPage.module.scss";

const StatPage = () => {
  const { user } = useSelector((store) => store.user);
  const [stat, setStat] = useState([]);

  useEffect(() => {
    getStat();
  }, []);

  //   useEffect(() => {
  //     console.log("STAT IS", stat);
  //   }, [stat]);

  const getStat = async () => {
    try {
      const res = await axios.get(`/api/stat/`, { params: { username: user } });
      const data = await res.data;
      //   sorted
      data.sort(function (a, b) {
        var nameA = a.word.toLowerCase(),
          nameB = b.word.toLowerCase();
        if (nameA < nameB)
          //сортируем строки по возрастанию
          return -1;
        if (nameA > nameB) return 1;
        return 0; // Никакой сортировки
      });
      setStat(data);
      //   console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <h1>Статистика</h1>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>Слово</th>
              <th>Реакции</th>
            </tr>
          </thead>
          <tbody>
            {stat.length &&
              stat.map((item) => <TableItem key={item._id} row={item} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatPage;
