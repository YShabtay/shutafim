import { Link } from 'react-router-dom'
import { entryText, prefChips } from '../labels'
import { isNew } from '../match'
import Icon from './Icon'
import Placeholder from './Placeholder'
import PostMenu from './PostMenu'

export default function PostCard({ p, score, fav, onFav, mine = false, onChanged, index = 0 }) {
  const photo = p.photos?.[0]
  const chips = prefChips(p).slice(0, 2).join(' · ')
  return (
    <Link to={`/post/${p.id}`} className="pcard" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="thumb">
        {photo ? <img src={photo} alt="" loading="lazy" /> : <Placeholder id={p.id} />}
        {p.is_sample && <span className="sampletag">דוגמה</span>}
        {mine ? <span className="badge mine">הפוסט שלך</span> : isNew(p) && <span className="badge">חדש</span>}
        {!mine && <button className={'heart' + (fav ? ' on' : '')} aria-label="שמור" onClick={e => { e.preventDefault(); onFav(p.id) }}>
          <Icon n="heart" size={22} fill={fav} />
        </button>}
      </div>
      <div className="body">
        <div className="line1">
          <b>{p.city}{p.neighborhood && `, ${p.neighborhood}`}</b>
          {mine && <PostMenu post={p} onChanged={onChanged} />}
          {!mine && score != null && <span className={'match ' + (score >= 80 ? 'hi' : score >= 50 ? 'mid' : 'lo')}><i />{score}% התאמה</span>}
        </div>
        <div className="sub">{p.title}</div>
        <div className="sub">{p.roommates_total} דיירים · {entryText(p)}</div>
        {chips && <div className="sub">{chips}</div>}
        <div className="priceline"><b>₪{p.rent.toLocaleString()}</b> לחודש</div>
      </div>
    </Link>
  )
}
