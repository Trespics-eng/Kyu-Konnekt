import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronDown, MoreHorizontal, Sparkles, Star, UsersRound } from 'lucide-react';
import { events, users } from '../data/mockData';
import { useLocalStorageState } from '../lib/storage';
import { Avatar } from './ui';
import './RightSidebar.css';

type RightSidebarProps = {
  toast: (message: string) => void;
  className?: string;
};

export default function RightSidebar({ toast, className = '' }: RightSidebarProps) {
  const navigate = useNavigate();
  const [followedPeople, setFollowedPeople] = useLocalStorageState<string[]>('followed-people', []);

  return (
    <aside className={`right-sidebar ${className}`.trim()}>
      <div className="right-card trending-card"><div className="right-card-title"><span className="title-icon title-icon-blue"><Sparkles size={15} /></span><h3>Trending on campus</h3><button className="small-more" onClick={() => navigate('/explore')} aria-label="More trending"><MoreHorizontal size={17} /></button></div>{[['#KyUInnovationDay', '128 conversations'], ['#CampusHousing', '76 conversations'], ['#StudyGroupFind', '54 conversations']].map(([tag, count], index) => <button className="trend-item" key={tag} onClick={() => navigate('/explore?q=' + encodeURIComponent(tag))}><span className="trend-rank">0{index + 1}</span><span><strong>{tag}</strong><small>{count}</small></span><ChevronDown className="trend-arrow" size={14} /></button>)}<button className="right-card-link" onClick={() => navigate('/explore')}>Explore trending topics <span>→</span></button></div>
      <div className="right-card events-card"><div className="right-card-title"><span className="title-icon title-icon-teal"><CalendarDays size={15} /></span><h3>Coming up</h3><button className="small-more" onClick={() => navigate('/events')} aria-label="All events"><MoreHorizontal size={17} /></button></div>{events.slice(0, 2).map((event, index) => <button className="mini-event" key={event.title} onClick={() => navigate('/events')}><span className={`event-date date-${index}`}><b>{index === 0 ? '08' : '10'}</b><small>NOV</small></span><span><strong>{event.title}</strong><small>{event.time} · {event.location.split(' ')[0]}</small></span></button>)}<button className="right-card-link" onClick={() => navigate('/events')}>View event calendar <span>→</span></button></div>
      <div className="right-card business-card"><div className="right-card-title"><span className="title-icon title-icon-amber"><Star size={14} /></span><h3>Local favourite</h3><button className="small-more" onClick={() => navigate('/marketplace')} aria-label="More businesses"><MoreHorizontal size={17} /></button></div><div className="featured-business"><img src="/assets/kenyan-enterprise.jpg" alt="Student-owned local enterprise" /><div className="featured-business-info"><strong>Maua Bites</strong><small>Food & Restaurants · Student-owned</small><b>From KES 120</b></div></div><button className="right-card-link" onClick={() => navigate('/marketplace')}>Discover local businesses <span>→</span></button></div>
      <div className="right-card announcement-card"><div className="right-card-title"><span className="title-icon title-icon-blue"><BadgeCheck size={15} /></span><h3>Community announcements</h3></div><button className="announcement-row" onClick={() => navigate('/events')}><b>KyU Innovation & Enterprise Day</b><span>Registration is open · Nov 10</span><small>See event details <ArrowUpRight size={12} /></small></button><button className="announcement-row" onClick={() => navigate('/settings')}><b>Keep your community safe</b><span>Never share full ID, bank or account details in public posts.</span><small>Read community guidance <ArrowUpRight size={12} /></small></button></div>
      <div className="right-card suggested-people-card"><div className="right-card-title"><span className="title-icon title-icon-teal"><UsersRound size={15} /></span><h3>People to connect with</h3></div>{users.filter((person) => person.id !== 'me').slice(0, 3).map((person) => { const isFollowed = followedPeople.includes(person.id); return <div className="suggested-person-row" key={person.id}><Avatar name={person.name} initials={person.initials} color={person.color} size="sm" verified={person.verified} /><span><b>{person.name}</b><small>{person.role}</small></span><button aria-label={isFollowed ? `Unfollow ${person.name}` : `Follow ${person.name}`} onClick={() => { setFollowedPeople((current) => isFollowed ? current.filter((id) => id !== person.id) : [...current, person.id]); toast(isFollowed ? `You unfollowed ${person.name}.` : `You are now following ${person.name}.`); }}>{isFollowed ? 'Following' : 'Follow'}</button></div>; })}<button className="right-card-link" onClick={() => navigate('/community')}>Explore the community <span>→</span></button></div>
      <div className="help-card"><div className="help-icon"><BadgeCheck size={17} /></div><div><strong>A community that cares</strong><p>Report an issue, share a solution, help KyU move forward.</p><button onClick={() => navigate('/issues')}>Visit Community Issues <span>→</span></button></div></div>
      <div className="sidebar-footer">
        <div>
          {/* <a
            href="#guidelines"
            onClick={(event) => {
              event.preventDefault();
              toast('Community guidelines: be respectful, helpful and keep private details safe.');
            }}
          >
            Guidelines
          </a>

          <span>·</span>

          <a
            href="#privacy"
            onClick={(event) => {
              event.preventDefault();
              navigate('/settings');
            }}
          >
            Privacy
          </a> */}
        </div>

        <small>
          © {new Date().getFullYear()} KyU Konnekt. All rights reserved.
        </small>

        <small className='small'>
          Designed &amp; Developed by <strong>F&amp;T</strong>.
        </small>
      </div>
    </aside>
  );
}

