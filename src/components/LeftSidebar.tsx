import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, CalendarDays, CircleHelp, Compass, FileText, GraduationCap, House, ListFilter, MapPin, MessagesSquare, Plus, ShieldAlert, ShoppingBag, UsersRound, X } from 'lucide-react';
import { BrandMark, Button } from './ui';
import './LeftSidebar.css';

const navItems = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Explore', path: '/explore', icon: Compass },
  { label: 'Community', path: '/community', icon: UsersRound },
  { label: 'Community Issues', path: '/issues', icon: ShieldAlert },
  { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  { label: 'Blogs & Stories', path: '/blogs', icon: FileText },
  { label: 'Opportunities', path: '/opportunities', icon: BriefcaseBusiness },
  { label: 'Accommodation', path: '/accommodation', icon: MapPin },
  { label: 'Events', path: '/events', icon: CalendarDays },
  { label: 'Lost & Found', path: '/lost-found', icon: CircleHelp },
  { label: 'Academic Communities', path: '/academics', icon: GraduationCap },
  { label: 'Messages', path: '/messages', icon: MessagesSquare },
  { label: 'Saved Posts', path: '/saved', icon: Bookmark },
];

type LeftSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openComposer: () => void;
  toast: (message: string) => void;
  className?: string;
};

export default function LeftSidebar({ sidebarOpen, setSidebarOpen, openComposer, toast, className = '' }: LeftSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className={`left-sidebar${sidebarOpen ? ' mobile-open' : ''} ${className}`.trim()} id="primary-navigation" aria-label="Primary navigation" aria-hidden={!sidebarOpen}>
      <div className="mobile-sidebar-header">
        <Link className="brand-lockup" to="/" onClick={() => setSidebarOpen(false)}>
          <BrandMark small />
          <span className="brand-copy"><strong>KyU Community</strong><small>Your campus, connected</small></span>
        </Link>
        <button className="icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button>
      </div>
      <div className="sidebar-section-label">YOUR SPACE</div>
      <nav className="main-nav">{navItems.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link${isActive ? ' nav-active' : ''}`}><Icon size={17} strokeWidth={1.9} /><span>{label}</span>{label === 'Messages' && <span className="nav-count">2</span>}</NavLink>)}</nav>
      <Button className="create-post-button" onClick={() => openComposer()}><Plus size={18} /> Create Post</Button>
      <div className="sidebar-divider" />
      <div className="sidebar-section-label">YOUR COMMUNITIES <button aria-label="Browse communities" onClick={() => navigate('/academics')}><ListFilter size={13} /></button></div>
      <Link to="/academics" className="community-shortcut"><span className="shortcut-dot shortcut-blue">C</span><span>Computer Science</span></Link>
      <Link to="/academics" className="community-shortcut"><span className="shortcut-dot shortcut-teal">B</span><span>Business & Economics</span></Link>
      <Link to="/academics" className="community-shortcut"><span className="shortcut-dot shortcut-gold">R</span><span>Research Circle</span></Link>
      <Link to="/academics" className="see-all">Explore communities <span>→</span></Link>
      <div className="sidebar-footer">
        <span>KyU Community is a free space for the whole community.</span>

        <div>
          <a
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
          </a>
        </div>

        <small>
          © {new Date().getFullYear()} KyU Community. All rights reserved.
        </small>

        <small>
          Designed &amp; Developed by <strong>F&amp;T</strong>.
        </small>
      </div>
    </aside>
  );
}
