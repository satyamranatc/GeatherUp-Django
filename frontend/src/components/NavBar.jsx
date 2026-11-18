import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, LogIn, User as UserIcon } from 'lucide-react'
import { getAvatarFallback } from '../api/client.js'

export default function NavBar({ isLoggedIn, user }) {
  const { pathname } = useLocation()

  const navLinkClass = (active) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      active
        ? 'bg-[#F3F6F6] text-[#006666]'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#008080] text-white flex items-center justify-center font-bold text-sm tracking-tight">
            GU
          </span>
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            GatherUp
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/" className={navLinkClass(pathname === '/')}>
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </Link>

          {isLoggedIn ? (
            <Link to="/profile" className={navLinkClass(pathname.startsWith('/profile'))}>
              {user ? (
                <img
                  src={user.avatar || getAvatarFallback(user.fullName)}
                  alt={user.fullName}
                  onError={(e) => {
                    e.currentTarget.src = getAvatarFallback(user.fullName)
                  }}
                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{user?.fullName?.split(' ')[0] || 'Profile'}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[#008080] text-white hover:bg-[#006666] transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
