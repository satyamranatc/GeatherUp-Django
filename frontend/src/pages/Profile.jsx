import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit3, LogOut, Trash2, X, Heart, MessageCircle } from 'lucide-react'
import api, { formatRelativeTime, getApiError, getAvatarFallback } from '../api/client.js'

export default function Profile({ isLoggedIn, currentUser, setCurrentUser, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const targetUserId = id ? Number(id) : currentUser?.id
  const isOwnProfile = Boolean(currentUser && targetUserId === currentUser.id)

  const [profileUser, setProfileUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id && !isLoggedIn) {
      navigate('/auth')
      return
    }
    if (!targetUserId) return

    let active = true
    setIsLoading(true)
    setError('')

    Promise.all([
      api.get(`/api/userApp/getProfile/${targetUserId}`),
      api.get(`/api/postApp/postByUser/${targetUserId}`),
    ])
      .then(([profileRes, postsRes]) => {
        if (!active) return
        setProfileUser(profileRes.data)
        setUserPosts(postsRes.data)
      })
      .catch((err) => {
        if (!active) return
        setError(getApiError(err, 'Could not load profile.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isLoggedIn, targetUserId, navigate])

  async function handlePostSubmit(e) {
    e.preventDefault()
    setIsPosting(true)
    setError('')
    const form = e.currentTarget

    const data = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      image: form.image.value.trim(),
    }

    try {
      const res = await api.post('/api/postApp/createPost', data)
      setUserPosts((prev) => [res.data, ...prev])
      setProfileUser((prev) =>
        prev ? { ...prev, posts_count: (prev.posts_count || 0) + 1 } : prev
      )
      form.reset()
    } catch (err) {
      setError(getApiError(err, 'Failed to create post.'))
    } finally {
      setIsPosting(false)
    }
  }

  async function handleProfileUpdate(e) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const payload = {
      fullName: form.fullName.value.trim(),
      bio: form.bio.value.trim(),
      avatar: form.avatar.value.trim(),
    }

    try {
      const res = await api.patch('/api/userApp/updateProfile', payload)
      setProfileUser(res.data)
      setCurrentUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setIsEditingProfile(false)
    } catch (err) {
      setError(getApiError(err, 'Failed to update profile.'))
    }
  }

  async function handleDeletePost(postId) {
    try {
      await api.delete(`/api/postApp/posts/${postId}`)
      setUserPosts((prev) => prev.filter((p) => p.id !== postId))
      setProfileUser((prev) =>
        prev ? { ...prev, posts_count: Math.max(0, (prev.posts_count || 1) - 1) } : prev
      )
      if (selectedPost?.id === postId) setSelectedPost(null)
    } catch (err) {
      setError(getApiError(err, 'Failed to delete post.'))
    }
  }

  async function handleLogoutClick() {
    try {
      await api.post('/api/userApp/logout')
    } catch {
      // ignore network error on logout
    } finally {
      onLogout()
      navigate('/auth')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-200" />
            <div className="space-y-3 flex-1">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile Header */}
      {profileUser && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <img
              src={profileUser.avatar || getAvatarFallback(profileUser.fullName)}
              alt={profileUser.fullName}
              onError={(e) => {
                e.currentTarget.src = getAvatarFallback(profileUser.fullName)
              }}
              className="w-20 h-20 rounded-full object-cover border border-slate-200 shrink-0"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">{profileUser.fullName}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {profileUser.bio || 'No bio added yet.'}
                  </p>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{profileUser.posts_count ?? userPosts.length}</span>{' '}
                  <span className="text-slate-500">Posts</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{profileUser.likes_received ?? 0}</span>{' '}
                  <span className="text-slate-500">Likes Received</span>
                </div>
              </div>
            </div>
          </div>

          {isOwnProfile && isEditingProfile && (
            <form
              onSubmit={handleProfileUpdate}
              className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={profileUser.fullName}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Avatar URL</label>
                <input
                  name="avatar"
                  type="url"
                  defaultValue={profileUser.avatar}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Bio</label>
                <input
                  name="bio"
                  type="text"
                  defaultValue={profileUser.bio}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080]"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#008080] text-white text-sm font-medium hover:bg-[#006666]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Create New Post (Own Profile Only) */}
      {isOwnProfile && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Create New Post</h2>

          <form onSubmit={handlePostSubmit} className="space-y-3">
            <input
              name="title"
              type="text"
              placeholder="Post title"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080]"
              required
            />

            <textarea
              name="description"
              placeholder="Write a caption..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080] resize-none"
              rows="3"
              required
            />

            <input
              name="image"
              type="url"
              placeholder="Image URL (optional)"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#008080]"
            />

            <button
              disabled={isPosting}
              className="w-full py-2.5 rounded-lg bg-[#008080] text-white text-sm font-semibold hover:bg-[#006666] transition disabled:opacity-50"
            >
              {isPosting ? 'Sharing...' : 'Share Post'}
            </button>
          </form>
        </section>
      )}

      {/* Posts Grid */}
      <section className="pt-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Posts
        </h2>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {userPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition"
              >
                {post.image ? (
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-[#F3F6F6] p-4 flex items-center justify-center text-center">
                    <p className="text-sm font-medium text-slate-700 line-clamp-4">{post.description}</p>
                  </div>
                )}

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{post.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>{formatRelativeTime(post.created_at)}</span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {post.likes_count || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl text-center py-12">
            <p className="text-slate-500 text-sm">No posts yet</p>
          </div>
        )}
      </section>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPost.image && (
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full max-h-80 object-cover bg-slate-100"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-xl font-semibold text-slate-900">{selectedPost.title}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {formatRelativeTime(selectedPost.created_at)}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-5">
                {selectedPost.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> {selectedPost.likes_count || 0} Likes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" /> {selectedPost.comments_count || 0} Comments
                  </span>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
