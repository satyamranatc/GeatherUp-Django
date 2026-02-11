import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function NavBar({ isLoggedIn }) {

  let [menuItems, setMenuItems] = useState([
    {
      name: "Feed",
      path: "/",
    },
    {
      name: "Profile",
      path: "/profile",
    },
    {
      name: "Auth",
      path: "/auth",
    }
  ])

  return (
    <nav className='border-b border-gray-300 bg-white'>
      <div className='max-w-5xl mx-auto flex items-center justify-between px-4 py-3'>
        <h2 className='text-2xl font-semibold text-black tracking-tight'>
          Gather Up
        </h2>

        <ul className='flex gap-5 items-center'>
          <li className='text-black hover:text-gray-600 transition'>
            <Link to={"/"}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </li>

          {
            (isLoggedIn)
              ? <li className='text-black hover:text-gray-600 transition'>
                  <Link to={"/profile"}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </li>
              : <li className='text-black hover:text-gray-600 transition'>
                  <Link to={"/auth"}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                </li>
          }
        </ul>
      </div>
    </nav>
  )
}