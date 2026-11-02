import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { X, Check } from 'lucide-react';
import './ui.css';

export function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark${small ? ' brand-mark-sm' : ''}`} aria-hidden="true"><img src="/logo.svg" alt="" /></span>;
}

export function Avatar({ name, initials, color = '#e7edf7', size = 'md', verified = false, image }: { name: string; initials?: string; color?: string; size?: 'sm' | 'md' | 'lg'; verified?: boolean; image?: string }) {
  const letters = initials || name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className={`avatar avatar-${size}`} style={{ backgroundColor: color }} aria-label={name}>{image ? <img src={image} alt="" /> : letters}{verified && <span className="avatar-check"><Check size={9} strokeWidth={3} /></span>}</span>;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'teal' | 'green' | 'amber' | 'red' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Modal({ title, subtitle, onClose, children, wide = false }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><h2 id="modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
      {children}
    </section>
  </div>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="toast" role="status"><span className="toast-check"><Check size={14} /></span>{message}<button onClick={onClose} aria-label="Dismiss message"><X size={16} /></button></div>;
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="section-heading"><h2>{title}</h2>{action}</div>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Check size={22} /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}
