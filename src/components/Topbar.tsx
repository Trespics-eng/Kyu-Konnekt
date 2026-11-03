import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, MessageCircle, Search, Settings, UsersRound, X } from 'lucide-react';
import type { MemberProfile, Post } from '../data/mockData';
import { Avatar } from './ui';
import logoImg from './logo.png';
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi, globalSearchApi } from '../lib/api';
import './Topbar.css';

type TopbarProps = {
  profile: MemberProfile;
  posts: Post[];
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
};

export default function Topbar({ profile, posts, sidebarOpen, setSidebarOpen, className = '' }: TopbarProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<{ id: string; title: string; time: string; read: boolean }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; meta: string; path: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;

  // Fetch notifications from API
  useEffect(() => {
    let active = true;
    getNotificationsApi()
      .then((res) => {
        if (active && res?.data && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [setNotifications]);

  // Debounced server-side search
  useEffect(() => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    // Client-side search on loaded posts as instant fallback
    const localResults = posts
      .filter((post) => `${post.body} ${post.category}`.toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 3)
      .map((post) => ({ label: post.body.slice(0, 62), meta: `Post · ${post.category}`, path: '/' }));
    setSearchResults(localResults);

    // Then fetch from server for comprehensive results
    const timer = setTimeout(() => {
      globalSearchApi(trimmed)
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setSearchResults(res.data.map((r) => ({ label: r.title, meta: `${r.kind} · ${r.detail}`, path: r.path })));
          }
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [searchText, posts]);

  const handleMarkAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsReadApi();
    } catch {
      // Graceful offline fallback
    }
  };

  const handleNotificationClick = async (item: { id: string; title: string; read?: boolean }) => {
    setNotifications((items) => items.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    try {
      await markNotificationReadApi(item.id);
    } catch {
      // Graceful fallback
    }
    navigate(item.title.toLowerCase().includes('report') || item.title.toLowerCase().includes('issue') ? '/issues' : '/');
  };

  return (
    <header className={`topbar ${className}`.trim()} onClick={(event) => event.stopPropagation()}>
      <button className="mobile-menu-button icon-button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={sidebarOpen} aria-controls="primary-navigation">{sidebarOpen ? <X size={21} /> : <Menu size={21} />}</button>
      <Link className="brand-lockup" to="/" aria-label="KyU Community home"><span className="brand-mark"><img src={logoImg} alt="KyU logo" /></span><span className="brand-copy"><strong>KyU Community</strong><small>Your campus, connected</small></span></Link>
      <div className="global-search-wrap">
        <Search size={17} /><input aria-label="Search KyU Community" placeholder="Search people, posts, businesses..." value={searchText} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchText(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => event.key === 'Enter' && navigate('/explore?q=' + encodeURIComponent(searchText))} />
        {searchText && <button className="search-clear" onClick={() => setSearchText('')} aria-label="Clear search"><X size={14} /></button>}
        {searchOpen && searchText.trim() && (
          <div className="search-popover">
            <div className="popover-label">SEARCH RESULTS</div>
            {searchResults.length ? (
              searchResults.map((item, index) => (
                <button className="search-result" key={`${item.label}-${index}`} onClick={() => { navigate(item.path); setSearchOpen(false); }}>
                  <span className="search-result-icon"><Search size={14} /></span>
                  <span><b>{item.label}</b><small>{item.meta}</small></span>
                </button>
              ))
            ) : (
              <p className="popover-empty">No matches yet. Try a name or topic.</p>
            )}
            <button className="search-all" onClick={() => { navigate('/explore?q=' + encodeURIComponent(searchText)); setSearchOpen(false); }}>
              Search all of KyU Community <span>→</span>
            </button>
          </div>
        )}
      </div>
      <div className="top-actions">
        <button className="icon-button top-icon top-message-btn" aria-label="Messages" onClick={() => navigate('/messages')}><MessageCircle size={19} /><span className="tiny-dot" /></button>
        <div className="top-action-wrap"><button className={`icon-button top-icon${notifyOpen ? ' active' : ''}`} aria-label={`Notifications ${unread} unread`} onClick={() => { setNotifyOpen(!notifyOpen); setProfileOpen(false); }}><Bell size={19} />{unread > 0 && <span className="notification-count">{unread}</span>}</button>
          {notifyOpen && (
            <div className="top-popover notification-popover">
              <div className="popover-heading">
                <strong>Notifications</strong>
                <button onClick={handleMarkAllRead}>Mark all read</button>
              </div>
              {notifications.length > 0 ? notifications.slice(0, 5).map((item) => (
                <button key={item.id} className={`notification-row${item.read ? '' : ' unread'}`} onClick={() => handleNotificationClick(item)}>
                  <span className="notification-bullet" />
                  <span><b>{item.title}</b><small>{item.time}</small></span>
                </button>
              )) : (
                <p className="popover-empty">No notifications yet.</p>
              )}
              <Link to="/settings" className="popover-footer" onClick={() => setNotifyOpen(false)}>Notification settings <span>→</span></Link>
            </div>
          )}
        </div>
        <div className="top-action-wrap"><button className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNotifyOpen(false); }}><Avatar name={profile.name} initials={profile.initials} color={profile.color} size="sm" verified={profile.verified} image={profile.image} /><span className="profile-trigger-name">{profile.name.split(' ')[0] || 'User'}</span><ChevronDown size={14} /></button>
          {profileOpen && (
            <div className="top-popover profile-popover">
              <div className="profile-menu-person">
                <Avatar name={profile.name} initials={profile.initials} color={profile.color} verified={profile.verified} image={profile.image} />
                <div><b>{profile.name}</b><small>{profile.role} · Verified</small></div>
              </div>
              <Link to="/profile" onClick={() => setProfileOpen(false)}><UsersRound size={15} /> View profile</Link>
              <Link to="/settings" onClick={() => setProfileOpen(false)}><Settings size={15} /> Settings</Link>
              <Link to="/login" onClick={() => { localStorage.removeItem('kyu:auth_token'); setProfileOpen(false); }}><LogOut size={15} /> Log out</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
