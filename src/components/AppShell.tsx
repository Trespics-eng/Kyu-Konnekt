import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Post, MemberProfile } from '../data/mockData';
import { defaultProfile } from '../data/mockData';
import { useLocalStorageState } from '../lib/storage';
import { getMeApi, getPostsApi } from '../lib/api';
import { kyuSocket } from '../lib/socket';
import { getValidAuthToken, initSessionTracker, type SignOutReason } from '../lib/session';
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

/** Normalises a raw post object from the API or socket into the app's Post type */
function normalisePost(p: any, fallbackProfile?: MemberProfile): Post {
  return {
    id: p.id,
    author: p.author || fallbackProfile || defaultProfile,
    createdAt: p.created_at
      ? new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : p.createdAt || 'Just now',
    category: p.category || 'Campus Life',
    type: p.type || 'Announcement',
    body: p.body,
    image: p.media_url || p.image || null,
    mediaType: p.media_type || p.mediaType || null,
    likes: p.like_count ?? p.likes ?? p.likes_count ?? 0,
    comments: (p.comments || []).map((c: any) => ({
      id: c.id,
      author: c.author?.name || c.author || 'User',
      initials: c.author?.initials || 'U',
      text: c.body || c.text || '',
      time: c.created_at
        ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Now',
    })),
  };
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useLocalStorageState<MemberProfile>('profile', defaultProfile);
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useLocalStorageState<string[]>('liked', []);
  const [saved, setSaved] = useLocalStorageState<string[]>('saved', []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Stable toast helper — using a ref so it never goes stale inside effects
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 4000);
  };

  // Keep a stable ref to toast so the socket effect can call it without stale closure
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  // Initialize session inactivity tracker and signout event listener
  useEffect(() => {
    const cleanup = initSessionTracker((reason: SignOutReason) => {
      kyuSocket.disconnect();
      setProfile(defaultProfile);
      if (reason === 'inactivity') {
        toast('Signed out due to 1 hour of inactivity.');
      }
      navigate('/login');
    });

    const handleSignoutEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ reason?: string }>;
      kyuSocket.disconnect();
      setProfile(defaultProfile);
      if (customEvent.detail?.reason === 'inactivity') {
        toast('Signed out due to 1 hour of inactivity.');
      }
      navigate('/login');
    };

    window.addEventListener('kyu:auth_signout', handleSignoutEvent);

    return () => {
      cleanup();
      window.removeEventListener('kyu:auth_signout', handleSignoutEvent);
    };
  }, [navigate, setProfile]);

  // Fetch authenticated user profile on mount
  useEffect(() => {
    const token = getValidAuthToken();
    if (!token) return;
    getMeApi()
      .then((res) => {
        if (res.data) {
          const u = res.data;
          setProfile((prev) => ({
            ...prev,
            id: u.id || prev.id,
            name: u.name || prev.name,
            email: u.email || prev.email,
            role: u.role || prev.role,
            initials:
              u.initials ||
              u.name
                ?.split(' ')
                .map((p: string) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() ||
              prev.initials,
            color: u.color || prev.color,
            image: u.avatar_url || prev.image,
            bio: u.bio || prev.bio,
            verified: u.verified ?? prev.verified,
            category: u.category || prev.category,
            school: u.school || prev.school,
            course: u.course || prev.course,
            year: u.year || prev.year,
          }));
        }
      })
      .catch(() => {});
  }, [setProfile]);

  // Fetch initial posts on mount
  useEffect(() => {
    getPostsApi()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setPosts(res.data.map((p: any) => normalisePost(p)));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect to Socket.IO and listen for real-time AI-published news posts
  useEffect(() => {
    const token = getValidAuthToken();
    kyuSocket.connect(token);

    const unsubscribe = kyuSocket.onPostCreated((payload) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === payload.id)) return prev;
        return [normalisePost(payload), ...prev];
      });
      // Use the ref so we always call the latest toast without stale closure
      toastRef.current('🤖 AI News: A new community update has just been posted!');
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title =
    navItems.find((item) => item.path === location.pathname)?.label ||
    (location.pathname.startsWith('/business/')
      ? 'Business'
      : location.pathname.startsWith('/article/')
      ? 'Article'
      : 'Your community');

  const openComposer = () => setComposerOpen(true);
  const context: SharedContext = {
    profile,
    posts,
    setPosts,
    liked,
    setLiked,
    saved,
    setSaved,
    openComposer,
    toast,
  };

  const handlePostSubmit = (post: Post) => {
    setPosts((previous) => [post, ...previous]);
    toast('Your post is now in the KyU community feed.');
  };

  return (
    <div className="app-shell">
      <Topbar profile={profile} posts={posts} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`app-body${sidebarOpen ? ' sidebar-open' : ''}`}>
        <LeftSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          openComposer={openComposer}
          toast={toast}
          className="my-sidebar"
        />

        {sidebarOpen && (
          <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="main-column">
          <div className="mobile-page-heading">
            <span>{title}</span>
          </div>
          <Outlet context={context} />
        </main>

        <RightSidebar toast={toast} className="my-sidebar" />
      </div>

      <MobileBottomNav onCreatePost={() => setComposerOpen(true)} />

      {composerOpen && (
        <PostComposer profile={profile} onClose={() => setComposerOpen(false)} onSubmit={handlePostSubmit} />
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}
