import React,{useState,useEffect} from 'react'

import {BrowserRouter,Routes,Route} from "react-router-dom"

import NavBar from "./components/NavBar.jsx"
import Feed from "./pages/Feed.jsx"
import Profile from "./pages/Profile.jsx"
import Auth from "./pages/Auth.jsx"

export default function App() 
{

  let [isLoggedIn,setIsLoggedIn] = useState(false)

  useEffect(()=>{
    if(localStorage.getItem("isLoggedIn") == "true"){
      setIsLoggedIn(true)
    }
  },[])

  return (
    <div>

      <BrowserRouter>
        <NavBar isLoggedIn = {isLoggedIn}/>
        <Routes>
          <Route path="/" element={<Feed/>}/>
          <Route path="/profile" element={<Profile isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn} />}/>
          <Route path="/auth" element={<Auth isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn} />}/>
          <Route path="*" element={<h1 className='text-8xl m-32 text-black text-center' >Not Found 404</h1>}/>
        </Routes>
      </BrowserRouter>
      
    </div>
  )
}
