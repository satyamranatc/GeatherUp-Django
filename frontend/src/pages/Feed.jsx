import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Search, Trash2, Send, PlusCircle } from 'lucide-react'
import api, { formatRelativeTime, getApiError, getAvatarFallback } from '../api/client.js'

export default function Feed({ isLoggedIn, currentUser }) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [openComments, setOpenComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})

  const fetchPosts = useCallback(async (query = '') => {
    setLoading(true)
    setError('')
    try {
      const params = query.trim() ? { q: query.trim() } : {}
      const res = await api.get('/api/postApp/allPosts', { params })
      setPosts(res.data)
    } catch (err) {
      setError(getApiError(err, 'Unable to load feed. Make sure the backend server is running.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPosts(searchQuery)
  }

  const handleToggleLike = async (postId) => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    try {
      const res = await api.post(`/api/postApp/posts/${postId}/like`)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, is_liked: res.data.liked, likes_count: res.data.likes_count }
            : post
        )
      )
    } catch (err) {
      setError(getApiError(err, 'Failed to update like.'))
    }
  }

  const handleAddComment = async (e, postId) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    const text = (commentInputs[postId] || '').trim()
    if (!text) return

    try {
      const res = await api.post(`/api/postApp/posts/${postId}/comments`, { text })
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), res.data],
                comments_count: (post.comments_count || 0) + 1,
              }
            : post
        )
      )
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
    } catch (err) {
      setError(getApiError(err, 'Failed to post comment.'))
    }
  }

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/api/postApp/comments/${commentId}`)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter((c) => c.id !== commentId),
                comments_count: Math.max(0, (post.comments_count || 1) - 1),
              }
            : post
        )
      )
    } catch (err) {
      setError(getApiError(err, 'Failed to delete comment.'))
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/postApp/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      setError(getApiError(err, 'Failed to delete post.'))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Community Feed</h1>
          <p className="text-sm text-slate-500">Discover posts, ideas, and updates from members.</p>
        </div>

        {isLoggedIn && (
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#008080] text-white text-sm font-medium hover:bg-[#006666] transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title, caption, or author..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#B2D8D8]/50 transition"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              fetchPosts('')
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 transition"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="h-56 bg-slate-100 rounded-xl mb-4" />
              <div className="h-5 w-1/2 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-600 font-medium mb-1">No posts found</p>
          <p className="text-slate-400 text-sm">
            {searchQuery ? 'Try a different search keyword.' : 'Be the first to share a post!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isOwner = currentUser && post.uploadedBy?.id === currentUser.id
            const showComments = Boolean(openComments[post.id])

            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <Link
                    to={`/profile/${post.uploadedBy?.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={post.uploadedBy?.avatar || getAvatarFallback(post.uploadedBy?.fullName)}
                      alt={post.uploadedBy?.fullName || 'User'}
                      onError={(e) => {
                        e.currentTarget.src = getAvatarFallback(post.uploadedBy?.fullName)
                      }}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#008080] transition">
                        {post.uploadedBy?.fullName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(post.created_at)}
                      </p>
                    </div>
                  </Link>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Image */}
                {post.image && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      className="w-full max-h-[420px] object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <h2 className="text-lg font-semibold text-slate-900 mb-1.5">{post.title}</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition ${
                      post.is_liked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likes_count || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count || 0} Comments</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    {(post.comments || []).length > 0 ? (
                      <div className="space-y-2.5">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start justify-between gap-2 bg-[#F3F6F6] rounded-xl px-3.5 py-2.5"
                          >
                            <div className="flex items-start gap-2.5">
                              <img
                                src={
                                  comment.author?.avatar ||
                                  getAvatarFallback(comment.author?.fullName)
                                }
                                alt={comment.author?.fullName}
                                onError={(e) => {
                                  e.currentTarget.src = getAvatarFallback(comment.author?.fullName)
                                }}
                                className="w-7 h-7 rounded-full object-cover mt-0.5"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-900">
                                    {comment.author?.fullName}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {formatRelativeTime(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 mt-0.5">{comment.text}</p>
                              </div>
                            </div>

                            {currentUser && comment.author?.id === currentUser.id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No comments yet. Start the conversation.</p>
                    )}

                    <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={isLoggedIn ? 'Write a comment...' : 'Sign in to comment...'}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008080]"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#008080] text-white text-sm font-medium hover:bg-[#006666] transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
