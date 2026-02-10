import React,{useState} from 'react'
import { Link } from 'react-router-dom'

export default function NavBar({isLoggedIn}) {

    let [menuItems,setMenuItems] = useState([
        {
            name:"Feed",
            path:"/",
        },
        {
            name:"Profile",
            path:"/profile",
        },
        {
            name:"Auth",
            path:"/auth",
        }
    ])

  return (
    <nav className='flex items-center justify-between px-6 py-4 bg-slate-200 shadow-lg shadow-gray-300'>
        <h2 className='text-3xl font-extrabold text-rose-500 tracking-wide'>
          Geather Up
        </h2>

        <ul className='flex gap-6 items-center'>
          <li className='text-lg font-bold text-rose-500 hover:text-rose-600 transition'>
            <Link to={"/"}>Feed</Link>
          </li>

          {
            (isLoggedIn)
              ? <li className='text-lg font-bold text-rose-500 hover:text-rose-600 transition'>
                  <Link to={"/profile"}>Profile</Link>
                </li>
              : <li className='text-lg font-bold text-rose-500 hover:text-rose-600 transition'>
                  <Link to={"/auth"}>Auth</Link>
                </li> 
          }
        </ul>
    </nav>
  )
}
