import React from 'react'
import styles from './TableItem.module.scss'

const TableItem = ({row}) => {

  const sortedReactions = row.allReactions
  sortedReactions.sort(function(a, b) {
    return b.count - a.count;
  })

  const stringReactions = sortedReactions.map(item => ' ' + item.reaction + ' ('+ item.count +')').join()

  return (
    <tr className={styles.tr}>
      <td className={styles.word}>{row.word}</td>
      <td className={styles.reaction}>{stringReactions}</td>
    </tr>
  )
}

export default TableItem