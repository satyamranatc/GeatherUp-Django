import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Profile({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate()
  let [user, setUser] = useState(null)
  let [userPost, setUserPost] = useState([])
  let [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("Hey", isLoggedIn)
    if (!isLoggedIn) {
      navigate('/auth')
    } else {
      setUser(JSON.parse(localStorage.getItem("user")))
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:8000/api/postApp/postByUser/${user.id}`)
        .then((res) => {
          console.log(res.data)
          setUserPost(res.data)
        })
    }
  }, [user])

  async function handlePostSubmit(e) {
    e.preventDefault()
    setIsLoading(true)

    let data = {
      title: e.target.title.value,
      description: e.target.description.value,
      image: e.target.image.value,
      uploadedBy: user.id
    }

    console.log(data)

    let res = await axios.post("http://localhost:8000/api/postApp/createPost", data)
    console.log(res.data)

    // refresh posts after upload
    setUserPost([res.data, ...userPost])

    e.target.reset()

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Profile Header */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <div className="flex items-center gap-8">
            <img
              src={user?.avatar}
              alt={user?.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-black mb-2">
                {user?.fullName}
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                {user?.bio}
              </p>
              <button
                onClick={() => {
                  setIsLoggedIn(false)
                  localStorage.setItem("isLoggedIn", "false")
                  localStorage.removeItem("user")
                  navigate('/auth')
                }}
                className="bg-gray-200 px-6 py-1.5 rounded text-sm font-semibold text-black hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Upload Post Section */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Create New Post
          </h2>

          <form onSubmit={handlePostSubmit} className="space-y-3">
            <input
              name="title"
              type="text"
              placeholder="Title"
              className="border border-gray-300 px-3 py-2 w-full rounded text-sm outline-none focus:border-gray-400"
              required
            />

            <textarea
              name="description"
              placeholder="Write a caption..."
              className="border border-gray-300 px-3 py-2 w-full rounded text-sm outline-none focus:border-gray-400 resize-none"
              rows="3"
              required
            />

            <input
              name="image"
              type="text"
              placeholder="Image URL"
              className="border border-gray-300 px-3 py-2 w-full rounded text-sm outline-none focus:border-gray-400"
              required
            />

            <button
              disabled={isLoading}
              className="bg-blue-500 text-white w-full py-2 rounded text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Posting..." : "Share"}
            </button>
          </form>
        </div>

        {/* User Posts Grid */}
        <div className="border-t border-gray-300 pt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center">
            Posts
          </h2>

          {
            userPost.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {
                  userPost.map((post) => (
                    <div
                      key={post._id}
                      className="aspect-square bg-white"
                    >
                      <img
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                        src={post.image}
                        alt={post.title}
                      />
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No posts yet</p>
              </div>
            )
          }
        </div>

      </div>
    </div>
  )
}