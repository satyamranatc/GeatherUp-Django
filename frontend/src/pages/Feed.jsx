import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  Search,
  Trash2,
  Send,
  Share2,
  Image as ImageIcon,
} from 'lucide-react'
import api, { formatRelativeTime, getApiError, getAvatarFallback } from '../api/client.js'

export default function Feed({ isLoggedIn, currentUser, showToast }) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('latest')
  const [openComments, setOpenComments] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [likedAnimId, setLikedAnimId] = useState(null)

  // Quick composer state
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDesc, setQuickDesc] = useState('')
  const [quickImage, setQuickImage] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

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

  const displayedPosts = useMemo(() => {
    let list = [...posts]
    if (activeFilter === 'photos') {
      list = list.filter((p) => Boolean(p.image && p.image.trim()))
    } else if (activeFilter === 'popular') {
      list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    }
    return list
  }, [posts, activeFilter])

  const totalLikes = useMemo(
    () => posts.reduce((acc, p) => acc + (p.likes_count || 0), 0),
    [posts]
  )

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPosts(searchQuery)
  }

  const handleQuickPost = async (e) => {
    e.preventDefault()
    if (!quickTitle.trim() || !quickDesc.trim()) return
    setIsPublishing(true)
    setError('')
    try {
      const res = await api.post('/api/postApp/createPost', {
        title: quickTitle.trim(),
        description: quickDesc.trim(),
        image: quickImage.trim(),
      })
      setPosts((prev) => [res.data, ...prev])
      setQuickTitle('')
      setQuickDesc('')
      setQuickImage('')
      showToast?.('Post published')
    } catch (err) {
      setError(getApiError(err, 'Failed to publish post.'))
    } finally {
      setIsPublishing(false)
    }
  }

  const handleToggleLike = async (postId) => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    setLikedAnimId(postId)
    setTimeout(() => setLikedAnimId((prev) => (prev === postId ? null : prev)), 380)

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
      showToast?.('Comment added')
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
      showToast?.('Comment deleted')
    } catch (err) {
      setError(getApiError(err, 'Failed to delete comment.'))
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/api/postApp/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      showToast?.('Post deleted')
    } catch (err) {
      setError(getApiError(err, 'Failed to delete post.'))
    }
  }

  const handleShare = async (post) => {
    const url = `${window.location.origin}/profile/${post.uploadedBy?.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast?.('Author link copied')
    } catch {
      showToast?.('Share link ready')
    }
  }

  const filterButtonClass = (key) =>
    `px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
      activeFilter === key
        ? 'bg-[#008080] text-white shadow-xs'
        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
    }`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Feed Column */}
        <div className="min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Community Feed
              </h1>
              <p className="text-sm text-slate-500">
                Ideas, updates, and moments shared by members.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter('latest')}
                className={filterButtonClass('latest')}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('popular')}
                className={filterButtonClass('popular')}
              >
                Most Liked
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('photos')}
                className={filterButtonClass('photos')}
              >
                With Photos
              </button>
            </div>
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
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition"
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
                <div
                  key={n}
                  className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                  </div>
                  <div className="h-52 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-5 w-1/2 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center animate-fade-up">
              <p className="text-slate-700 font-medium mb-1">No posts found</p>
              <p className="text-slate-400 text-sm">
                {searchQuery
                  ? 'Try a different search keyword.'
                  : 'Be the first to share something with the community.'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {displayedPosts.map((post, idx) => {
                const isOwner = currentUser && post.uploadedBy?.id === currentUser.id
                const showComments = Boolean(openComments[post.id])
                const hasImage = Boolean(post.image && post.image.trim())

                return (
                  <article
                    key={post.id}
                    style={{ animationDelay: `${Math.min(idx * 40, 240)}ms` }}
                    className="animate-fade-up bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300/80 transition duration-200"
                  >
                    {/* Author Header */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <Link
                        to={`/profile/${post.uploadedBy?.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={
                            post.uploadedBy?.avatar ||
                            getAvatarFallback(post.uploadedBy?.fullName)
                          }
                          alt={post.uploadedBy?.fullName || 'User'}
                          onError={(e) => {
                            e.currentTarget.src = getAvatarFallback(post.uploadedBy?.fullName)
                          }}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-[#B2D8D8] transition"
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

                    {/* Image or Editorial Note Card */}
                    {hasImage ? (
                      <>
                        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                          <img
                            src={post.image}
                            alt={post.title}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                            className="w-full max-h-[420px] object-cover group-hover:scale-[1.01] transition duration-300"
                          />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
                          {post.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                          {post.description}
                        </p>
                      </>
                    ) : (
                      <div className="rounded-xl bg-[#F3F6F6] border-l-4 border-[#008080] px-4 py-3.5">
                        <h2 className="text-base font-semibold text-slate-900 mb-1">
                          {post.title}
                        </h2>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                          {post.description}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center gap-5">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium transition active:scale-95 ${
                            post.is_liked
                              ? 'text-rose-600'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition ${
                              post.is_liked ? 'fill-rose-600' : ''
                            } ${likedAnimId === post.id ? 'animate-heart-pop' : ''}`}
                          />
                          <span>{post.likes_count || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleShare(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#008080] transition"
                        title="Copy author profile link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {showComments && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-up">
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
                                      e.currentTarget.src = getAvatarFallback(
                                        comment.author?.fullName
                                      )
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
                          <p className="text-xs text-slate-400">
                            No comments yet. Start the conversation.
                          </p>
                        )}

                        <form
                          onSubmit={(e) => handleAddComment(e, post.id)}
                          className="flex gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              isLoggedIn ? 'Write a comment...' : 'Sign in to comment...'
                            }
                            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#008080]"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#008080] text-white text-sm font-medium hover:bg-[#006666] active:scale-95 transition"
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

        {/* Sticky Right Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          {isLoggedIn && currentUser ? (
            <>
              {/* Mini Profile Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <img
                    src={currentUser.avatar || getAvatarFallback(currentUser.fullName)}
                    alt={currentUser.fullName}
                    onError={(e) => {
                      e.currentTarget.src = getAvatarFallback(currentUser.fullName)
                    }}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#008080] transition">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser.bio || 'View your profile'}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Inline Quick Post Composer */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Quick Post</h2>
                <form onSubmit={handleQuickPost} className="space-y-2.5">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Title"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#008080]"
                  />
                  <textarea
                    value={quickDesc}
                    onChange={(e) => setQuickDesc(e.target.value)}
                    placeholder="Share a thought or update..."
                    rows="3"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#008080] resize-none"
                  />
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={quickImage}
                      onChange={(e) => setQuickImage(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#008080]"
                    />
                  </div>
                  {quickImage.trim() && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={quickImage}
                        alt="Preview"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                        className="w-full h-28 object-cover"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-2 rounded-lg bg-[#008080] text-white text-sm font-semibold hover:bg-[#006666] active:scale-[0.98] transition disabled:opacity-50"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="text-base font-semibold text-slate-900 mb-1.5">
                Join the conversation
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Sign in or create an account to share posts, like updates, and leave comments.
              </p>
              <Link
                to="/auth"
                className="block text-center w-full py-2.5 rounded-lg bg-[#008080] text-white text-sm font-semibold hover:bg-[#006666] transition"
              >
                Sign In / Register
              </Link>
            </div>
          )}

          {/* Community Snapshot */}
          <div className="bg-[#F3F6F6] border border-slate-200/80 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Community Snapshot
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-200/70">
                <p className="text-lg font-semibold text-slate-900">{posts.length}</p>
                <p className="text-xs text-slate-500">Total Posts</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200/70">
                <p className="text-lg font-semibold text-slate-900">{totalLikes}</p>
                <p className="text-xs text-slate-500">Total Likes</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
