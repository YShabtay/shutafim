import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api } from '../api'
import NewPost from './NewPost'

// עריכת פוסט: רק לבעל הפוסט
export default function EditPost() {
  const { id } = useParams()
  const [state, setState] = useState({ loading: true })
  useEffect(() => {
    Promise.all([api.getPost(id), api.getSocial(id), api.getUser()]).then(([post, social, user]) => setState({ post, social: social || '', user }))
  }, [id])
  if (state.loading) return <div className="skel tall" />
  if (!state.post) return <p className="empty">הפוסט לא נמצא. <Link to="/mine">לפוסטים שלי</Link></p>
  if (!state.user || state.post.owner_id !== state.user.id) return <Navigate to={`/post/${id}`} replace />
  return <NewPost key={id} post={state.post} social={state.social} />
}
