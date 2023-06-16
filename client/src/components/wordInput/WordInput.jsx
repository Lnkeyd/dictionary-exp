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
    <div className={styles.container}>
        <label>{word}</label>
        <input className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  )
}

export default WordInput