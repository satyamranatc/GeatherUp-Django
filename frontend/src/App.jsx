import React, { useState, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import NavBar from './components/NavBar.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import Toast from './components/Toast.jsx'
import Feed from './pages/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Auth from './pages/Auth.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true' && Boolean(localStorage.getItem('token'))
  })

  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2800)
  }, [])

  const handleAuthSuccess = (authUser, token) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(authUser))
    setUser(authUser)
    setIsLoggedIn(true)
    showToast(`Welcome, ${authUser.fullName.split(' ')[0]}!`)
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
    showToast('Signed out')
  }

  return (
    <div className="min-h-screen bg-[#FAFCFC] text-slate-900">
      <CustomCursor />
      <BrowserRouter>
        <NavBar isLoggedIn={isLoggedIn} user={user} />
        <main className="pb-16">
          <Routes>
            <Route
              path="/"
              element={<Feed isLoggedIn={isLoggedIn} currentUser={user} showToast={showToast} />}
            />
            <Route
              path="/profile"
              element={
                <Profile
                  isLoggedIn={isLoggedIn}
                  currentUser={user}
                  setCurrentUser={setUser}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/profile/:id"
              element={
                <Profile
                  isLoggedIn={isLoggedIn}
                  currentUser={user}
                  setCurrentUser={setUser}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/auth"
              element={<Auth isLoggedIn={isLoggedIn} onAuthSuccess={handleAuthSuccess} />}
            />
            <Route
              path="*"
              element={
                <div className="max-w-md mx-auto text-center py-24 px-4">
                  <p className="text-sm font-semibold text-[#008080] uppercase tracking-wider mb-2">
                    404
                  </p>
                  <h1 className="text-3xl font-semibold text-slate-900 mb-3">Page not found</h1>
                  <p className="text-slate-600 text-sm mb-6">
                    The page you are looking for does not exist or has been moved.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#008080] text-white text-sm font-medium hover:bg-[#006666] transition"
                  >
                    Back to Feed
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  )
}
