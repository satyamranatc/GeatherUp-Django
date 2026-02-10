import React,{useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom';

export default function Profile({isLoggedIn,setIsLoggedIn}) {
  const navigate = useNavigate()
  let [user,setUser] = useState(null)

  useEffect(()=>{
    console.log("Hey",isLoggedIn)
    if(!isLoggedIn){
      navigate('/auth')
    }
    else
    {
      setUser(JSON.parse(localStorage.getItem("user")))
    }
  },[isLoggedIn])

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-100 px-4'>
      
      <div className='bg-white w-full max-w-lg rounded-2xl shadow-xl p-10 text-center'>
        
        <h1 className='text-3xl font-extrabold text-rose-500 mb-2'>
          Profile
        </h1>

        <h2 className='text-xl font-semibold text-gray-700 mb-6'>
          Welcome <span className='text-rose-500'>{user?.fullName}</span>
        </h2>

        <img 
          src={user?.avatar} 
          alt={user?.fullName} 
          className='w-32 h-32 rounded-full mx-auto border-4 border-rose-400 shadow-md object-cover mb-6'
        />

        <p className='text-gray-600 text-base font-medium leading-relaxed mb-8'>
          {user?.bio}
        </p>

        <button 
          onClick={()=>{
            setIsLoggedIn(false)
            localStorage.setItem("isLoggedIn","false")
            localStorage.removeItem("user")
            navigate('/auth')
          }} 
          className='bg-rose-500 px-8 py-2 rounded-xl text-white font-bold shadow-md hover:bg-rose-600 transition'
        >
          Logout
        </button>

      </div>

    </div>
  )
}
