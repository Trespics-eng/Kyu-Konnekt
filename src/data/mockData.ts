// ---------------------------------------------------------------------------
// Shared type definitions used across the application.
// All runtime data is now fetched from the backend API.
// ---------------------------------------------------------------------------

export type Category = 'Campus Life' | 'Academics' | 'Community Issues' | 'Business' | 'Opportunities' | 'Events' | 'Blogs';
export type User = { id: string; name: string; role: string; department?: string; verified?: boolean; initials: string; color: string; location?: string; avatar_url?: string };
export type MemberProfile = User & { email?: string; category?: string; school?: string; course?: string; year?: string; image?: string; bio?: string; interests?: string[] };
export type Comment = { id: string; author: string; initials: string; text: string; time: string };
export type Post = { id: string; author: User; createdAt: string; category: Category; type: 'Discussion' | 'Question' | 'Announcement' | 'Text' | 'Photo' | 'Video'; body: string; image?: string; mediaType?: 'image' | 'video'; likes: number; comments: Comment[] };
export type Issue = { id: string; title: string; category: string; location: string; description: string; status: 'Submitted' | 'Under Review' | 'Forwarded to Relevant Authority' | 'In Progress' | 'Resolved' | 'Closed'; date: string; support: number; comments: number; reporter: string; confidential?: boolean; image?: string; attachment?: string; attachmentName?: string };
export type Business = { id: string; name: string; category: string; location: string; description: string; price: string; image: string; initials: string; verified?: boolean; student?: boolean; phone: string; whatsapp?: string; hours?: string; products?: string[] };
export type Article = { id: string; title: string; excerpt: string; category: string; author: string; date: string; read: string; image: string; body: string };
export type Opportunity = { title: string; org: string; type: string; location: string; deadline: string; verified?: boolean; summary: string; url?: string };
export type EventItem = { title: string; category: string; date: string; time: string; location: string; host: string; image?: string; description?: string; registration?: string; contact?: string };
export type Stay = { name: string; type: string; location: string; rent: number; rooms: number; features: string[]; image: string; contact?: string };
export type LostItem = { name: string; status: 'Lost' | 'Found'; location: string; date: string; description: string; initials: string; image?: string; contact?: string };

// Default empty profile for initial app state before authentication
export const defaultProfile: MemberProfile = {
  id: '',
  name: 'Guest',
  role: 'Member',
  initials: 'G',
  color: '#e7edf7',
};
