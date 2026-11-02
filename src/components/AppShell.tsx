import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { Post, MemberProfile } from '../data/mockData';
import { initialPosts, me } from '../data/mockData';
import { useLocalStorageState } from '../lib/storage';
import { Toast } from './ui';
import Topbar from './Topbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import PostComposer from './PostComposer';
import './AppShell.css';

export type SharedContext = {
  profile: MemberProfile;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  liked: string[];
  setLiked: React.Dispatch<React.SetStateAction<string[]>>;
  saved: string[];
  setSaved: React.Dispatch<React.SetStateAction<string[]>>;
  openComposer: () => void;
  toast: (message: string) => void;
};

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Community', path: '/community' },
  { label: 'Community Issues', path: '/issues' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Blogs & Stories', path: '/blogs' },
  { label: 'Opportunities', path: '/opportunities' },
  { label: 'Accommodation', path: '/accommodation' },
  { label: 'Events', path: '/events' },
  { label: 'Lost & Found', path: '/lost-found' },
  { label: 'Academic Communities', path: '/academics' },
  { label: 'Messages', path: '/messages' },
  { label: 'Saved Posts', path: '/saved' },
];

export default function AppShell() {
  const location = useLocation();
  const [profile] = useLocalStorageState<MemberProfile>('profile', me);
  const [posts, setPosts] = useLocalStorageState<Post[]>('posts', initialPosts);
  const [liked, setLiked] = useLocalStorageState<string[]>('liked', []);
  const [saved, setSaved] = useLocalStorageState<string[]>('saved', []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const title = navItems.find((item) => item.path === location.pathname)?.label || (location.pathname.startsWith('/business/') ? 'Business' : location.pathname.startsWith('/article/') ? 'Article' : 'Your community');
  const toast = (message: string) => { setToastMessage(message); window.setTimeout(() => setToastMessage(''), 3200); };
  const openComposer = () => setComposerOpen(true);
  const context: SharedContext = { profile, posts, setPosts, liked, setLiked, saved, setSaved, openComposer, toast };

  const handlePostSubmit = (post: Post) => {
    setPosts((previous) => [post, ...previous]);
    toast('Your post is now in the KyU community feed.');
  };
   
  return <div className="app-shell">
    <Topbar profile={profile} posts={posts} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

    <div className={`app-body${sidebarOpen ? ' sidebar-open' : ''}`}>
      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} openComposer={openComposer} toast={toast} className="my-sidebar"/>

      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <main className="main-column"><div className="mobile-page-heading"><span>{title}</span></div><Outlet context={context} /></main>

      <RightSidebar toast={toast} className="my-sidebar"/>
    </div>

    <MobileBottomNav onCreatePost={() => setComposerOpen(true)} />

    {composerOpen && <PostComposer profile={profile} onClose={() => setComposerOpen(false)} onSubmit={handlePostSubmit} />}
    {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      
  </div>;
}
