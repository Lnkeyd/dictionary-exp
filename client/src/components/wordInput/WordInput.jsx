import React, { useEffect, useState } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useDispatch } from 'react-redux'
import { updateWord } from '../../store/userSlice'
import styles from './WordInput.module.scss'

const WordInput = ({word, success}) => {
    const [value, setValue] = useState('')
    const debouncedValue = useDebounce(value, 1000)
    const dispatch = useDispatch()
    
    useEffect(() => {
        if (value && success){
          setValue('')
        }
        else if (value) {
            dispatch(updateWord({word, reaction: debouncedValue}))
        }
    }, [debouncedValue, success])

  return (
    <tr className={styles.container}>
        <td>{word}&nbsp;</td>
        <input className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} />
    </tr>
  )
}

export default WordInput