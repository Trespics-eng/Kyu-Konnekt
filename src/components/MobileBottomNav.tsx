import { NavLink } from 'react-router-dom';
import { Compass, Home, MessageCircle, Plus, UsersRound } from 'lucide-react';
import './MobileBottomNav.css';

type MobileBottomNavProps = {
  onCreatePost: () => void;
};

export default function MobileBottomNav({ onCreatePost }: MobileBottomNavProps) {
  return (
    <nav className="mobile-bottom-nav">{[{ label: 'Home', path: '/', icon: Home }, { label: 'Explore', path: '/explore', icon: Compass }, { label: 'Create', path: '#create', icon: Plus }, { label: 'Messages', path: '/messages', icon: MessageCircle }, { label: 'Profile', path: '/profile', icon: UsersRound }].map(({ label, path, icon: Icon }) => path === '#create' ? <button key={label} onClick={onCreatePost} className="mobile-nav-create"><Icon size={18} /><span>{label}</span></button> : <NavLink key={label} to={path} end={path === '/'} className={({ isActive }) => `mobile-nav-item${isActive ? ' mobile-nav-active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
  );
}

