import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, MessageCircle, Search, Settings, UsersRound, X } from 'lucide-react';
import type { MemberProfile, Post } from '../data/mockData';
import { articles, businesses, communityGroups, events, initialIssues, opportunities, stays, users } from '../data/mockData';
import { useLocalStorageState } from '../lib/storage';
import { Avatar, BrandMark } from './ui';
import './Topbar.css';

const initialNotifications = [
  { id: 'n1', title: 'Faith Njeri liked your comment', time: '12 min ago', read: false },
  { id: 'n2', title: 'Street lighting report is now under review', time: '1 hr ago', read: false },
  { id: 'n3', title: 'KyU Innovation & Enterprise Day is coming up', time: 'Yesterday', read: true },
];

type TopbarProps = {
  profile: MemberProfile;
  posts: Post[];
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
};

export default function Topbar({ profile, posts, sidebarOpen, setSidebarOpen, className = '' }: TopbarProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useLocalStorageState('notifications', initialNotifications);
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;

  const searchResults = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return [];
    return [
      ...users.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(term)).slice(0, 1).map((person) => ({ label: person.name, meta: `Person · ${person.role}`, path: '/profile' })),
      ...posts.filter((post) => `${post.body} ${post.category}`.toLowerCase().includes(term)).slice(0, 1).map((post) => ({ label: post.body.slice(0, 62), meta: `Post · ${post.category}`, path: '/' })),
      ...businesses.filter((business) => `${business.name} ${business.category} ${business.description} ${business.location} ${business.products?.join(' ') || ''}`.toLowerCase().includes(term)).slice(0, 1).map((business) => ({ label: business.name, meta: `Business · ${business.category}`, path: '/marketplace' })),
      ...articles.filter((article) => `${article.title} ${article.category} ${article.excerpt}`.toLowerCase().includes(term)).slice(0, 1).map((article) => ({ label: article.title, meta: `Story · ${article.category}`, path: `/article/${article.id}` })),
      ...initialIssues.filter((issue) => `${issue.title} ${issue.category} ${issue.location}`.toLowerCase().includes(term)).slice(0, 1).map((issue) => ({ label: issue.title, meta: `Community issue · ${issue.category}`, path: '/issues' })),
      ...opportunities.filter((item) => `${item.title} ${item.org} ${item.type}`.toLowerCase().includes(term)).slice(0, 1).map((item) => ({ label: item.title, meta: `Opportunity · ${item.type}`, path: '/opportunities' })),
      ...events.filter((event) => `${event.title} ${event.category} ${event.location}`.toLowerCase().includes(term)).slice(0, 1).map((event) => ({ label: event.title, meta: `Event · ${event.category}`, path: '/events' })),
      ...stays.filter((stay) => `${stay.name} ${stay.type} ${stay.location}`.toLowerCase().includes(term)).slice(0, 1).map((stay) => ({ label: stay.name, meta: `Accommodation · ${stay.location}`, path: '/accommodation' })),
      ...communityGroups.filter((group) => `${group.name} ${group.category}`.toLowerCase().includes(term)).slice(0, 1).map((group) => ({ label: group.name, meta: `Academic community · ${group.category}`, path: '/academics' })),
    ].slice(0, 5);
  }, [posts, searchText]);

  return (
    <header className={`topbar ${className}`.trim()} onClick={(event) => event.stopPropagation()}>
      <button className="mobile-menu-button icon-button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={sidebarOpen} aria-controls="primary-navigation">{sidebarOpen ? <X size={21} /> : <Menu size={21} />}</button>
      <Link className="brand-lockup" to="/" aria-label="KyU Konnekt home"><BrandMark /><span className="brand-copy"><strong>KyU Konnekt</strong><small>Your campus, connected</small></span></Link>
      <div className="global-search-wrap">
        <Search size={17} /><input aria-label="Search KyU Konnekt" placeholder="Search people, posts, businesses..." value={searchText} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchText(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => event.key === 'Enter' && navigate('/explore?q=' + encodeURIComponent(searchText))} />
        {searchText && <button className="search-clear" onClick={() => setSearchText('')} aria-label="Clear search"><X size={14} /></button>}
        {searchOpen && searchText.trim() && <div className="search-popover"><div className="popover-label">SEARCH RESULTS</div>{searchResults.length ? searchResults.map((item, index) => <button className="search-result" key={`${item.label}-${index}`} onClick={() => { navigate(item.path); setSearchOpen(false); }}><span className="search-result-icon"><Search size={14} /></span><span><b>{item.label}</b><small>{item.meta}</small></span></button>) : <p className="popover-empty">No matches yet. Try a name or topic.</p>}<button className="search-all" onClick={() => { navigate('/explore?q=' + encodeURIComponent(searchText)); setSearchOpen(false); }}>Search all of KyU Konnekt <span>→</span></button></div>}
      </div>
      <div className="top-actions">
        <button className="icon-button top-icon top-message-btn" aria-label="Messages" onClick={() => navigate('/messages')}><MessageCircle size={19} /><span className="tiny-dot" /></button>
        <div className="top-action-wrap"><button className={`icon-button top-icon${notifyOpen ? ' active' : ''}`} aria-label={`Notifications ${unread} unread`} onClick={() => { setNotifyOpen(!notifyOpen); setProfileOpen(false); }}><Bell size={19} />{unread > 0 && <span className="notification-count">{unread}</span>}</button>
          {notifyOpen && <div className="top-popover notification-popover"><div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}>Mark all read</button></div>{notifications.slice(0, 5).map((item) => <button key={item.id} className={`notification-row${item.read ? '' : ' unread'}`} onClick={() => { setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry)); navigate(item.title.includes('report') ? '/issues' : '/'); }}><span className="notification-bullet" /><span><b>{item.title}</b><small>{item.time}</small></span></button>)}<Link to="/settings" className="popover-footer" onClick={() => setNotifyOpen(false)}>Notification settings <span>→</span></Link></div>}
        </div>
        <div className="top-action-wrap"><button className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNotifyOpen(false); }}><Avatar name={profile.name} initials={profile.initials} color={profile.color} size="sm" verified={profile.verified} image={profile.image} /><span className="profile-trigger-name">Wanjiku</span><ChevronDown size={14} /></button>
          {profileOpen && <div className="top-popover profile-popover"><div className="profile-menu-person"><Avatar name={profile.name} initials={profile.initials} color={profile.color} verified={profile.verified} image={profile.image} /><div><b>{profile.name}</b><small>Student · Verified</small></div></div><Link to="/profile" onClick={() => setProfileOpen(false)}><UsersRound size={15} /> View profile</Link><Link to="/settings" onClick={() => setProfileOpen(false)}><Settings size={15} /> Settings</Link><Link to="/login" onClick={() => setProfileOpen(false)}><LogOut size={15} /> Log out</Link></div>}
        </div>
      </div>
    </header>
  );
}

