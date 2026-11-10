import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImagePlus, Send, UsersRound, X } from 'lucide-react';
import type { Category, MemberProfile, Post } from '../data/mockData';
import { createPostApi, uploadPostMediaApi } from '../lib/api';
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
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [composerMediaLink, setComposerMediaLink] = useState('');
  const [composerLinkType, setComposerLinkType] = useState<'image' | 'video' | 'link'>('link');
  const [composerVideo, setComposerVideo] = useState(false);
  const [composerError, setComposerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitPost = async () => {
    if (!composerText.trim() && !composerFile && !composerMediaLink.trim()) {
      setComposerError('Add a message, upload media, or paste a media link before sharing.');
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = composerFile ? await uploadPostMediaApi(composerFile) : null;
      const mediaUrl = uploaded?.media_url || composerMediaLink.trim() || undefined;
      const mediaType = uploaded?.media_type || (mediaUrl ? (composerLinkType === 'link' ? 'link' : composerLinkType) : undefined);
      const resolvedType = mediaType === 'video' ? 'Video' : mediaType === 'image' ? 'Photo' : composerType;
      const postBody = composerText.trim() || (resolvedType === 'Video' ? 'Shared a video.' : 'Shared an image.');
      const result = await createPostApi({
        body: postBody,
        category: composerCategory,
        type: resolvedType,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      const saved = result.data;
      const post: Post = {
        id: saved.id,
        author: saved.author || profile,
        createdAt: 'Just now',
        category: composerCategory,
        type: resolvedType,
        mediaType,
        body: saved.body || postBody,
        image: saved.media_url || mediaUrl,
        likes: 0,
        comments: [],
      };
      onSubmit(post);
      onClose();
      if (location.pathname !== '/') navigate('/');
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : 'Could not publish the post.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type)) {
      setComposerError('Choose an image, MP4, or WebM video.');
      return;
    }
    if (file.size > 20_000_000) { setComposerError('Media files must be 20 MB or smaller.'); return; }
    setComposerFile(file);
    setComposerMediaLink('');
    setComposerImage(URL.createObjectURL(file));
    setComposerVideo(file.type.startsWith('video/'));
    setComposerError('');
  };

  return (
    <Modal title="Create a post" subtitle="Share something with the KyU community." onClose={onClose} wide>
      <div className="composer-modal-body">
        <div className="composer-author">
          <Avatar name={profile.name} initials={profile.initials} color={profile.color} verified={profile.verified} image={profile.image} />
          <div>
            <b>{profile.name}</b>
            <small>Posting to the KyU community</small>
          </div>
          <select
            value={composerCategory}
            onChange={(event) => setComposerCategory(event.target.value as Category)}
            aria-label="Choose post category"
          >
            {categoryOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        <textarea
          className="composer-textarea"
          placeholder="What's happening in the KyU community?"
          value={composerText}
          onChange={(event) => setComposerText(event.target.value)}
          rows={5}
        />

        <div className="composer-tools">
          <label className="upload-control">
            <ImagePlus size={17} /> Upload image or video
            <input type="file" accept="image/*,video/mp4,video/webm" onChange={(event) => void pickImage(event.target.files?.[0])} hidden />
          </label>
          <label className="select-label">
            Post type
            <select value={composerType} onChange={(event) => setComposerType(event.target.value as Post['type'])}>
              <option>Discussion</option>
              <option>Question</option>
              <option>Announcement</option>
              <option>Text</option>
              <option>Photo</option>
            </select>
          </label>
          <span className="composer-privacy"><UsersRound size={14} /> Community</span>
        </div>

        <div className="composer-media-link">
          <input type="url" value={composerMediaLink} onChange={(event) => { setComposerMediaLink(event.target.value); setComposerFile(null); setComposerImage(event.target.value); setComposerVideo(composerLinkType === 'video'); setComposerError(''); }} placeholder="Or paste an image/video link (https://…)" aria-label="Image or video URL" />
          <select value={composerLinkType} onChange={(event) => { const value = event.target.value as 'image' | 'video' | 'link'; setComposerLinkType(value); setComposerVideo(value === 'video'); }} aria-label="Link media type">
            <option value="link">Web link</option><option value="image">Image URL</option><option value="video">Video URL</option>
          </select>
        </div>

        {composerImage && (
          <div className="upload-preview">
            {composerLinkType === 'link' && !composerFile ? (
              <a href={composerMediaLink} target="_blank" rel="noreferrer" className="composer-media-preview-link">Open linked media</a>
            ) : composerVideo ? (
              <video src={composerImage} controls aria-label="Post video preview" />
            ) : (
              <img src={composerImage} alt="Post attachment preview" />
            )}
            <button
              className="icon-button"
              onClick={() => { setComposerImage(''); setComposerFile(null); setComposerMediaLink(''); setComposerVideo(false); }}
              aria-label="Remove attachment"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {composerError && <p className="form-error">{composerError}</p>}

        <div className="modal-actions">
          <span className="muted-small">Be kind. Keep personal information private.</span>
          <Button onClick={submitPost} disabled={submitting}>
            <Send size={15} /> {submitting ? 'Sharing...' : 'Share post'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
