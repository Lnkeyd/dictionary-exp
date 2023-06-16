import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { removeUserToken } from '../../store/userSlice';
import {BiLogOut} from 'react-icons/bi'
import {BsFillClipboardCheckFill} from 'react-icons/bs'
import {IoStatsChart} from 'react-icons/io5'

const Header = () => {
    const dispath = useDispatch()
    
    const handleLogout = async () => {
        await axios.post('/api/login/logout').then(res => console.log('User logged out!'))
        dispath(removeUserToken())
    }

  return (
    <div>
        <ul>
            <li>
                <Link to='/form'><BsFillClipboardCheckFill/> Анкета</Link>
            </li>
            <li>
                <Link to='/stat'><IoStatsChart/> Статистика</Link>
            </li>
            <li>
                <Link onClick={handleLogout} to='/'><BiLogOut/>Logout</Link>
            </li>
        </ul>
    </div>
  )
}

export default Header