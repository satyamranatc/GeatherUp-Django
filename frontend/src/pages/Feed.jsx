import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Feed() {
  let [allPosts, setAllPost] = useState([])

  useEffect(() => {
    axios.get("http://localhost:8000/api/postApp/allPosts")
      .then((res) => {
        console.log(res.data)
        setAllPost(res.data)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-bold text-rose-500 mb-10 text-center tracking-tight">
          Feed
        </h1>

        <div className="flex flex-col gap-6">
          {
            allPosts.map((post) => (
              <div 
                key={post._id}
                className="bg-white w-full p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200"
              >

                {/* Author Section */}
                <div className="flex items-center gap-4 mb-5">
                  <img 
                    className="w-12 h-12 rounded-full border-2 border-rose-400 object-cover shadow-sm"
                    src={post.uploadedBy.avatar} 
                    alt={post.uploadedBy.fullName} 
                  />
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">
                      {post.uploadedBy.fullName}
                    </h4>
                  </div>
                </div>

                {/* Post Data */}
                <div className="w-full">
                  <img 
                    className="w-full h-[400px] object-cover rounded-xl border border-slate-200 mb-4 shadow-sm"
                    src={post.image} 
                    alt={post.title} 
                  />

                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 leading-relaxed text-base">
                    {post.description}
                  </p>
                </div>

              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}