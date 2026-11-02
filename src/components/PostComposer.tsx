import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImagePlus, Send, UsersRound, X } from 'lucide-react';
import type { Category, MemberProfile, Post } from '../data/mockData';
import { readMediaPreview } from '../lib/storage';
import { Avatar, Button, Modal } from './ui';
import './PostComposer.css';

const categoryOptions: Category[] = ['Campus Life', 'Academics', 'Community Issues', 'Business', 'Opportunities', 'Events', 'Blogs'];

type PostComposerProps = {
  profile: MemberProfile;
  onClose: () => void;
  onSubmit: (post: Post) => void;
};

export default function PostComposer({ profile, onClose, onSubmit }: PostComposerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [composerText, setComposerText] = useState('');
  const [composerCategory, setComposerCategory] = useState<Category>('Campus Life');
  const [composerType, setComposerType] = useState<Post['type']>('Discussion');
  const [composerImage, setComposerImage] = useState('');
  const [composerVideo, setComposerVideo] = useState(false);
  const [composerError, setComposerError] = useState('');

  const submitPost = () => {
    if (!composerText.trim() && !composerImage) { setComposerError('Add a message or an image before sharing.'); return; }
    const post: Post = { id: `p-${Date.now()}`, author: profile, createdAt: 'Just now', category: composerCategory, type: composerVideo ? 'Video' : composerImage ? 'Photo' : composerType, mediaType: composerImage ? composerVideo ? 'video' : 'image' : undefined, body: composerText.trim(), image: composerImage || undefined, likes: 0, comments: [] };
    onSubmit(post);
    setComposerText(''); setComposerImage(''); setComposerVideo(false); setComposerError(''); onClose();
    if (location.pathname !== '/') navigate('/');
  };

  const pickImage = async (file?: File) => {
    if (!file) return;
    try { setComposerImage(await readMediaPreview(file)); setComposerVideo(file.type.startsWith('video/')); setComposerError(''); }
    catch (error) { setComposerError(error instanceof Error ? error.message : 'Could not read image.'); }
  };

  return (
    <Modal title="Create a post" subtitle="Share something with the KyU community." onClose={onClose} wide>
      <div className="composer-modal-body">
        <div className="composer-author"><Avatar name={profile.name} initials={profile.initials} color={profile.color} verified={profile.verified} image={profile.image} /><div><b>{profile.name}</b><small>Posting to the KyU community</small></div><select value={composerCategory} onChange={(event) => setComposerCategory(event.target.value as Category)} aria-label="Choose post category">{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <textarea className="composer-textarea" placeholder="What's happening in the KyU community?" value={composerText} onChange={(event) => setComposerText(event.target.value)} rows={5} />
        <div className="composer-tools"><label className="upload-control"><ImagePlus size={17} /> Add a photo<input type="file" accept="image/*,video/mp4,video/webm" onChange={(event) => void pickImage(event.target.files?.[0])} hidden /></label><label className="select-label">Post type<select value={composerType} onChange={(event) => setComposerType(event.target.value as Post['type'])}><option>Discussion</option><option>Question</option><option>Announcement</option><option>Text</option><option>Photo</option></select></label><span className="composer-privacy"><UsersRound size={14} /> Community</span></div>
        {composerImage && <div className="upload-preview">{composerVideo ? <video src={composerImage} controls aria-label="Post video preview" /> : <img src={composerImage} alt="Post attachment preview" />}<button className="icon-button" onClick={() => { setComposerImage(''); setComposerVideo(false); }} aria-label="Remove attachment"><X size={15} /></button></div>}
        {composerError && <p className="form-error">{composerError}</p>}
        <div className="modal-actions"><span className="muted-small">Be kind. Keep personal information private.</span><Button onClick={submitPost}><Send size={15} /> Share post</Button></div>
      </div>
    </Modal>
  );
}
