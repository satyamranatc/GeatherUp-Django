import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export default function Auth({isLoggedIn,setIsLoggedIn}) {
  let navigate = useNavigate()


  useEffect(()=>{
    if(isLoggedIn){
      navigate('/profile')
    }
  },[isLoggedIn])


  async function handleSignUp(e) {
    e.preventDefault();
    let data = {
      fullName : e.target.fullName.value,
      avatar : e.target.avatar.value,
      bio : e.target.bio.value,
      email : e.target.email.value,
      password : e.target.password.value
    }
    console.log(data)

    let res = await axios.post("http://localhost:8000/api/userApp/register",data)

    if(res.data.email != null){
      setIsLoggedIn(true)
      localStorage.setItem("isLoggedIn","true")
      localStorage.setItem("user",JSON.stringify(res.data))
      navigate('/')
    }

    
  }
  async function handleLogin(e) {

    e.preventDefault();
    let data = {
      email : e.target.email.value,
      password : e.target.password.value
    }
    console.log(data)

    let res = await axios.post("http://localhost:8000/api/userApp/login",data)

    if(res.data.email != null){
      setIsLoggedIn(true)
      localStorage.setItem("isLoggedIn","true")
      localStorage.setItem("user",JSON.stringify(res.data))
      navigate('/')
    }
  }


  return (
    <div className='flex flex-col md:flex-row gap-8 justify-center items-start p-6' >

      <div id="LoginSection" className='bg-slate-200 w-full md:w-[400px] p-10 rounded-2xl shadow-lg flex items-center justify-center flex-col'>
        <h3 className='font-bold text-2xl text-rose-500 mb-6' >Login Section</h3>
        
        <form onSubmit={handleLogin} className='w-full'>
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="email" type="text" placeholder='Type Your Email:' />
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="password" type="text" placeholder='Type Your Password:' />
          
          <button className='bg-black text-white w-full py-2 rounded-xl font-semibold hover:bg-gray-800 transition' >
            Login
          </button>
        </form>
      </div>
      

      <div id="RegisterSection" className='bg-slate-200 w-full md:w-[400px] p-10 rounded-2xl shadow-lg flex items-center justify-center flex-col'>
        <h3 className='font-bold text-2xl text-rose-500 mb-6'>Register Section</h3>
        
        <form onSubmit={handleSignUp} className='w-full'>
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="fullName" type="text" placeholder='Type Your Full Name:' />
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="bio" type="text" placeholder='Type Your Bio:' />
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="avatar" type="text" placeholder='Type Your Avatar:' />
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-4' name="email" type="text" placeholder='Type Your Email:' />
          <input className='border border-gray-300 px-4 py-2 w-full rounded-lg outline-none focus:ring-2 focus:ring-rose-400 block mb-6' name="password" type="text" placeholder='Type Your Password:' />
          
          <button className='bg-rose-500 text-white w-full py-2 rounded-xl font-semibold hover:bg-rose-600 transition'>
            Register
          </button>
        </form>
      </div>
      
    </div>
  )
}
