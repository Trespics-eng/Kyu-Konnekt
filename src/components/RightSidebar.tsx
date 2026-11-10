import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, CalendarDays, ChevronDown, MoreHorizontal, Sparkles, Star, UsersRound } from 'lucide-react';
import { useLocalStorageState } from '../lib/storage';
import { getTrendingTagsApi, toggleFollowUserApi, getEventsApi } from '../lib/api';
import { Avatar } from './ui';
import './RightSidebar.css';

type RightSidebarProps = {
  toast: (message: string) => void;
  className?: string;
};

export default function RightSidebar({ toast, className = '' }: RightSidebarProps) {
  const navigate = useNavigate();
  const [followedPeople, setFollowedPeople] = useLocalStorageState<string[]>('followed-people', []);
  const [trending, setTrending] = useState<{ tag: string; count: string }[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<{ title: string; time: string; location: string; date: string }[]>([]);
  const [suggestedPeople] = useState<{ id: string; name: string; initials: string; color: string; role: string; verified?: boolean }[]>([]);

  // Fetch trending tags
  useEffect(() => {
    let active = true;
    getTrendingTagsApi()
      .then((res) => {
        if (active && res?.data && res.data.length > 0) {
          setTrending(res.data);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Fetch upcoming events
  useEffect(() => {
    let active = true;
    getEventsApi()
      .then((res) => {
        if (active && res?.data && Array.isArray(res.data)) {
          const upcoming = res.data.filter((event: any) => {
            const timestamp = Date.parse(event.date);
            return Number.isFinite(timestamp) && timestamp >= new Date().setHours(0, 0, 0, 0);
          }).sort((a: any, b: any) => Date.parse(a.date) - Date.parse(b.date));
          setUpcomingEvents(upcoming.slice(0, 2).map((e: any) => ({
            title: e.title,
            time: e.time || '',
            location: e.location || '',
            date: e.date || '',
          })));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleToggleFollow = async (personId: string, personName: string) => {
    const isFollowed = followedPeople.includes(personId);
    setFollowedPeople((current) => (isFollowed ? current.filter((id) => id !== personId) : [...current, personId]));
    toast(isFollowed ? `You unfollowed ${personName}.` : `You are now following ${personName}.`);
    try {
      await toggleFollowUserApi(personId, isFollowed);
    } catch {
      // Graceful offline fallback
    }
  };

  return (
    <aside className={`right-sidebar ${className}`.trim()}>
      {trending.length > 0 && (
        <div className="right-card trending-card">
          <div className="right-card-title">
            <span className="title-icon title-icon-blue"><Sparkles size={15} /></span>
            <h3>Trending on campus</h3>
            <button className="small-more" onClick={() => navigate('/explore')} aria-label="More trending"><MoreHorizontal size={17} /></button>
          </div>
          {trending.map((item, index) => (
            <button className="trend-item" key={item.tag} onClick={() => navigate('/explore?q=' + encodeURIComponent(item.tag))}>
              <span className="trend-rank">0{index + 1}</span>
              <span><strong>{item.tag}</strong><small>{item.count}</small></span>
              <ChevronDown className="trend-arrow" size={14} />
            </button>
          ))}
          <button className="right-card-link" onClick={() => navigate('/explore')}>Explore trending topics <span>→</span></button>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="right-card events-card">
          <div className="right-card-title">
            <span className="title-icon title-icon-teal"><CalendarDays size={15} /></span>
            <h3>Coming up</h3>
            <button className="small-more" onClick={() => navigate('/events')} aria-label="All events"><MoreHorizontal size={17} /></button>
          </div>
          {upcomingEvents.map((event, index) => (
            <button className="mini-event" key={event.title} onClick={() => navigate('/events')}>
              <span className={`event-date date-${index}`}><b>{event.date ? new Date(event.date).getDate().toString().padStart(2, '0') : '--'}</b><small>{event.date ? new Date(event.date).toLocaleString('en', { month: 'short' }).toUpperCase() : ''}</small></span>
              <span><strong>{event.title}</strong><small>{event.time} · {event.location.split(' ')[0]}</small></span>
            </button>
          ))}
          <button className="right-card-link" onClick={() => navigate('/events')}>View event calendar <span>→</span></button>
        </div>
      )}

      <div className="right-card business-card">
        <div className="right-card-title">
          <span className="title-icon title-icon-amber"><Star size={14} /></span>
          <h3>Local favourite</h3>
          <button className="small-more" onClick={() => navigate('/marketplace')} aria-label="More businesses"><MoreHorizontal size={17} /></button>
        </div>
        <div className="featured-business">
          <img src="/assets/kenyan-enterprise.jpg" alt="Student-owned local enterprise" />
          <div className="featured-business-info">
            <strong>Discover businesses</strong>
            <small>Student-owned · Local services</small>
            <b>Browse marketplace</b>
          </div>
        </div>
        <button className="right-card-link" onClick={() => navigate('/marketplace')}>Discover local businesses <span>→</span></button>
      </div>

      <div className="right-card announcement-card">
        <div className="right-card-title">
          <span className="title-icon title-icon-blue"><BadgeCheck size={15} /></span>
          <h3>Community announcements</h3>
        </div>
        {upcomingEvents.slice(0, 2).map((event) => (
          <button className="announcement-row" key={`${event.title}-${event.date}`} onClick={() => navigate('/events')}>
            <b>{event.title}</b>
            <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Community activity'}{event.location ? ` · ${event.location}` : ''}</span>
            <small>See event details <ArrowUpRight size={12} /></small>
          </button>
        ))}
        {upcomingEvents.length === 0 && <p className="px-4 pb-4 text-xs text-slate-500">No community announcements at the moment.</p>}
      </div>

      {suggestedPeople.length > 0 && (
        <div className="right-card suggested-people-card">
          <div className="right-card-title">
            <span className="title-icon title-icon-teal"><UsersRound size={15} /></span>
            <h3>People to connect with</h3>
          </div>
          {suggestedPeople.map((person) => {
            const isFollowed = followedPeople.includes(person.id);
            return (
              <div className="suggested-person-row" key={person.id}>
                <Avatar name={person.name} initials={person.initials} color={person.color} size="sm" verified={person.verified} />
                <span><b>{person.name}</b><small>{person.role}</small></span>
                <button aria-label={isFollowed ? `Unfollow ${person.name}` : `Follow ${person.name}`} onClick={() => handleToggleFollow(person.id, person.name)}>
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
          <button className="right-card-link" onClick={() => navigate('/community')}>Explore the community <span>→</span></button>
        </div>
      )}

      <div className="help-card">
        <div className="help-icon"><BadgeCheck size={17} /></div>
        <div>
          <strong>A community that cares</strong>
          <p>Report an issue, share a solution, help KyU move forward.</p>
          <button onClick={() => navigate('/issues')}>Visit Community Issues <span>→</span></button>
        </div>
      </div>

      <div className="sidebar-footer">
        <small>© {new Date().getFullYear()} KyU Community. All rights reserved.</small>
        <small className='small'>Designed &amp; Developed by <strong>F&amp;T</strong>.</small>
      </div>
    </aside>
  );
}
