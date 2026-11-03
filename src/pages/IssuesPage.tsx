import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Bell, Check, Clock3, Eye, FileText, List, Map, MapPin, MessageCircle, Plus, ShieldCheck, ThumbsUp, Upload, X, Share2, Send } from 'lucide-react';
import type { Issue } from '../data/mockData';
import type { SharedContext } from '../components/AppShell';
import { useLocalStorageState } from '../lib/storage';
import { Avatar, Badge, Button, Modal, SectionHeading } from '../components/ui';
import {
  getIssuesApi,
  getConfidentialIssuesApi,
  createIssueApi,
  toggleIssueSupportApi,
  toggleIssueFollowApi,
  addIssueCommentApi,
} from '../lib/api';
import './IssuesPage.css';

const categories = ['Insecurity and Robbery', 'Electricity Problems', 'Water Shortages', 'Poor Roads', 'Garbage and Sanitation', 'Harassment and Discrimination', 'Internet Connectivity', 'Accommodation Problems', 'Transport Challenges', 'University Facilities', 'Other Community Concerns'];
const statuses = ['All statuses', 'Submitted', 'Under Review', 'Forwarded to Relevant Authority', 'In Progress', 'Resolved', 'Closed'];
const statusTone = (status: string): 'blue' | 'teal' | 'amber' | 'green' | 'neutral' =>
  status === 'Resolved' ? 'green' : status === 'In Progress' ? 'teal' : status.includes('Forwarded') ? 'blue' : status === 'Closed' ? 'neutral' : 'amber';

export default function IssuesPage() {
  const { toast, profile } = useOutletContext<SharedContext>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [privateIssues, setPrivateIssues] = useState<Issue[]>([]);
  const [myPrivateOpen, setMyPrivateOpen] = useState(false);
  const [supported, setSupported] = useLocalStorageState<string[]>('issue-support', []);
  const [followed, setFollowed] = useLocalStorageState<string[]>('issue-followed', []);
  const [issueComments, setIssueComments] = useLocalStorageState<Record<string, string[]>>('issue-comments', {});
  const [activeComments, setActiveComments] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [activeStatus, setActiveStatus] = useState('All statuses');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [observedDate, setObservedDate] = useState('2026-11-02');
  const [observedTime, setObservedTime] = useState('');
  const [confidential, setConfidential] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
  const [error, setError] = useState('');

  // Fetch live issues from API
  useEffect(() => {
    let ignore = false;
    getIssuesApi({
      category: activeCategory === 'All categories' ? undefined : activeCategory,
      status: activeStatus === 'All statuses' ? undefined : activeStatus,
      search: search || undefined,
    }).then((res) => {
      if (!ignore && res.data && Array.isArray(res.data)) {
        setIssues(res.data);
      }
    }).catch(() => {});

    getConfidentialIssuesApi().then((res) => {
      if (!ignore && res.data && Array.isArray(res.data)) {
        setPrivateIssues(res.data.map((i: any) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          location: i.location,
          description: i.description,
          status: i.status || 'Submitted',
          date: i.observed_date || 'Recently',
          support: 0,
          comments: 0,
          reporter: 'Confidential report',
          confidential: true,
          attachment: i.attachment_url,
          attachmentName: i.attachment_name,
        })));
      }
    }).catch(() => {});

    return () => { ignore = true; };
  }, [activeCategory, activeStatus, search, setIssues, setPrivateIssues]);

  const visible = useMemo(() =>
    issues.filter((issue) =>
      (activeCategory === 'All categories' || issue.category === activeCategory) &&
      (activeStatus === 'All statuses' || issue.status === activeStatus) &&
      `${issue.title} ${issue.location} ${issue.description}`.toLowerCase().includes(search.toLowerCase())
    ),
    [issues, activeCategory, activeStatus, search]
  );

  const reset = () => {
    setOpen(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setAttachment(null);
    setConfidential(false);
    setError('');
  };

  const submit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please complete the title, description and location.');
      return;
    }

    const observedLabel = observedDate
      ? new Date(`${observedDate}T00:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Date not specified';

    const issue: Issue = {
      id: `i-${Date.now()}`,
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      status: 'Submitted',
      date: `${observedLabel} · ${observedTime || 'Time not specified'}`,
      support: 0,
      comments: 0,
      reporter: confidential ? 'Confidential report' : profile.name,
      confidential,
      image: attachment?.type.startsWith('image/') ? attachment.url : undefined,
      attachment: attachment?.url,
      attachmentName: attachment?.name,
    };

    if (confidential) {
      setPrivateIssues((items) => [issue, ...items]);
      toast('Your confidential report was submitted privately. It is not visible in public issue lists.');
    } else {
      setIssues((items) => [issue, ...items]);
      toast('Your report is submitted. The community can now follow its progress.');
    }
    reset();

    try {
      await createIssueApi({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        observedDate,
        observedTime,
        confidential,
        media_url: attachment?.url,
        attachment_name: attachment?.name,
      });
    } catch {
      // Handled locally
    }
  };

  const chooseAttachment = (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setError('Choose a file smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachment({ name: file.name, url: reader.result, type: file.type });
        setError('');
      } else setError('Could not read this attachment.');
    };
    reader.onerror = () => setError('Could not read this attachment.');
    reader.readAsDataURL(file);
  };

  const toggleSupport = async (id: string) => {
    const exists = supported.includes(id);
    setSupported((items) => exists ? items.filter((item) => item !== id) : [...items, id]);
    setIssues((items) => items.map((item) => item.id === id ? { ...item, support: Math.max(0, item.support + (exists ? -1 : 1)) } : item));
    toast(exists ? 'Support removed.' : 'Thanks for supporting this report.');

    try {
      await toggleIssueSupportApi(id);
    } catch {
      // Retained locally
    }
  };

  const toggleFollow = async (id: string) => {
    const exists = followed.includes(id);
    setFollowed((items) => exists ? items.filter((item) => item !== id) : [...items, id]);
    toast(exists ? 'You are no longer following this issue.' : 'You’ll receive issue status updates.');

    try {
      await toggleIssueFollowApi(id);
    } catch {
      // Retained locally
    }
  };

  const addComment = async (id: string) => {
    if (!commentDraft.trim()) return;
    const commentText = commentDraft.trim();
    setIssueComments((items) => ({ ...items, [id]: [...(items[id] || []), commentText] }));
    setCommentDraft('');
    toast('Your comment was added.');

    try {
      await addIssueCommentApi(id, commentText);
    } catch {
      // Retained locally
    }
  };

  const shareIssue = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/issues#${id}`);
      toast('Issue link copied.');
    } catch {
      toast('Issue link is ready to share.');
    }
  };

  return (
    <div className="page-content section-page issues-page">
      <div className="page-kicker">
        <span className="kicker-icon kicker-issue"><ShieldCheck size={17} /></span>
        <span>COMMUNITY CARE</span>
        <span className="kicker-separator">/</span>
        <span>ISSUE TRACKER</span>
      </div>

      <div className="issues-title-row">
        <div>
          <h1>Community <em>Issues</em></h1>
          <p>See what’s happening. Help your community move things forward.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={17} /> Report an issue</Button>
      </div>

      <div className="safety-notice">
        <span className="safety-icon"><AlertTriangle size={18} /></span>
        <div>
          <strong>Is anyone in immediate danger?</strong>
          <p>This community tracker is for follow-up, not emergency response. Please contact the appropriate emergency services directly if there’s an urgent threat.</p>
        </div>
        <button className="notice-close" onClick={(event) => event.currentTarget.parentElement?.classList.add('notice-dismissed')} aria-label="Dismiss safety notice">
          <X size={16} />
        </button>
      </div>

      <div className="private-report-access">
        <button onClick={() => setMyPrivateOpen(!myPrivateOpen)}>
          <ShieldCheck size={15} /> My confidential reports <Badge tone="neutral">{privateIssues.length}</Badge>
          <span>{myPrivateOpen ? 'Hide' : 'View'}</span>
        </button>
        {myPrivateOpen && (
          <div className="private-report-panel">
            <p><ShieldCheck size={14} /> Confidential reports are strictly private to your account and authorized campus moderators.</p>
            {privateIssues.length ? (
              privateIssues.map((issue) => (
                <article className="private-report-row" key={issue.id}>
                  <div>
                    <strong>{issue.title}</strong>
                    <small>{issue.category} · {issue.location} · {issue.date}</small>
                    <Badge tone={statusTone(issue.status)}>{issue.status}</Badge>
                  </div>
                  <button className={followed.includes(issue.id) ? 'is-followed' : ''} onClick={() => toggleFollow(issue.id)}>
                    {followed.includes(issue.id) ? 'Following updates' : 'Follow updates'}
                  </button>
                </article>
              ))
            ) : (
              <span className="private-report-empty">You have not submitted a confidential report.</span>
            )}
          </div>
        )}
      </div>

      <div className="issue-stats">
        <div>
          <span className="issue-stat-icon stat-blue"><FileText size={17} /></span>
          <span><b>{issues.length}</b><small>Issues reported</small></span>
        </div>
        <div>
          <span className="issue-stat-icon stat-amber"><Clock3 size={17} /></span>
          <span><b>{issues.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length}</b><small>Being followed up</small></span>
        </div>
        <div>
          <span className="issue-stat-icon stat-green"><Check size={17} /></span>
          <span><b>{issues.filter((i) => i.status === 'Resolved').length + 18}</b><small>Resolved together</small></span>
        </div>
        <div className="issue-stat-caption"><span className="online-dot" /> Community-supported reports</div>
      </div>

      <div className="issue-toolbar">
        <div className="filter-group">
          <select aria-label="Filter by category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
            <option>All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by status" value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="view-toggle">
          <button className={view === 'list' ? 'view-active' : ''} onClick={() => setView('list')}><List size={15} /> List</button>
          <button className={view === 'map' ? 'view-active' : ''} onClick={() => setView('map')}><Map size={15} /> Map</button>
        </div>
      </div>

      <div className="issue-search">
        <MapPin size={16} />
        <input placeholder="Search by issue or location..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <span>{visible.length} reports</span>
      </div>

      {view === 'map' && (
        <div className="map-preview">
          <div className="map-watermark">KERUGOYA · KYU</div>
          <div className="map-roads">
            <span className="road road-one" />
            <span className="road road-two" />
            <span className="road road-three" />
            <span className="road road-four" />
          </div>
          {visible.slice(0, 4).map((issue, i) => (
            <button className={`map-pin map-pin-${i + 1}`} key={issue.id} title={issue.location} onClick={() => toast(`${issue.title} · ${issue.location}`)}>
              <MapPin size={19} fill="currentColor" />
            </button>
          ))}
          <div className="map-legend">{visible.length} community reports in this view</div>
        </div>
      )}

      <div className={`issues-list${view === 'map' ? ' issues-list-compact' : ''}`}>
        <SectionHeading title="Community reports" action={<span className="results-label">Latest activity <span>·</span> {visible.length} results</span>} />
        {visible.length ? (
          visible.map((issue) => (
            <article className="issue-card" key={issue.id}>
              <div className="issue-card-top">
                <div className="issue-category-label">
                  <span className={`issue-marker ${issue.category.includes('Water') ? 'marker-blue' : issue.category.includes('Road') ? 'marker-amber' : 'marker-teal'}`} />
                  <span>{issue.category}</span>
                </div>
                <Badge tone={statusTone(issue.status)}>{issue.status}</Badge>
              </div>
              <h3>{issue.title}</h3>
              <p className="issue-description">{issue.description}</p>
              {issue.image && <img className="issue-thumb" src={issue.image} alt="Report supporting image" />}
              {issue.attachmentName && !issue.image && (
                <a className="issue-attachment-link" href={issue.attachment} download={issue.attachmentName}>
                  <FileText size={14} /> Supporting file: {issue.attachmentName}
                </a>
              )}
              <div className="issue-location">
                <MapPin size={14} />
                <span>{issue.location}</span>
                <span>·</span>
                <span>{issue.date}</span>
              </div>
              <div className="issue-history">
                <span className="history-track">
                  <i />
                  <i />
                  <i className={issue.status === 'In Progress' || issue.status === 'Resolved' ? 'step-done' : ''} />
                  <i className={issue.status === 'Resolved' ? 'step-done' : ''} />
                </span>
                <span>Reported <b>{issue.status}</b></span>
                <button onClick={() => toast(`Issue history: Submitted → Under Review → ${issue.status}.`)}>
                  View history <ArrowUpRight size={13} />
                </button>
              </div>
              <div className="issue-card-bottom">
                <div className="issue-reporter">
                  <Avatar name={issue.reporter} initials={issue.reporter.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U'} size="sm" />
                  <span><b>{issue.reporter}</b><small>Community member</small></span>
                </div>
                <div className="issue-engagement">
                  <button className={supported.includes(issue.id) ? 'is-supported' : ''} onClick={() => toggleSupport(issue.id)}>
                    <ThumbsUp size={15} /> {issue.support}
                  </button>
                  <button onClick={() => setActiveComments(activeComments === issue.id ? '' : issue.id)}>
                    <MessageCircle size={15} /> {issue.comments + (issueComments[issue.id]?.length || 0)}
                  </button>
                  <button className={followed.includes(issue.id) ? 'is-followed' : ''} onClick={() => toggleFollow(issue.id)}>
                    <Bell size={14} /> {followed.includes(issue.id) ? 'Following' : 'Follow'}
                  </button>
                  <button onClick={() => void shareIssue(issue.id)}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
              {activeComments === issue.id && (
                <div className="issue-comments-panel">
                  {(issueComments[issue.id] || []).map((text, index) => (
                    <p key={`${text}-${index}`}><b>{profile.name}</b> {text}</p>
                  ))}
                  <div className="comment-input-wrap">
                    <input
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && addComment(issue.id)}
                      placeholder="Add a constructive comment..."
                    />
                    <button onClick={() => addComment(issue.id)} aria-label="Send issue comment">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="empty-results">
            <ShieldCheck size={24} />
            <strong>No reports match those filters</strong>
            <span>Try another category or location.</span>
          </div>
        )}
      </div>

      {open && (
        <Modal title="Report a community issue" subtitle="Help us document the issue clearly so it can be followed up." onClose={reset} wide>
          <div className="issue-form">
            <div className="form-grid">
              <label className="form-field span-two">
                <span>Issue title <i>*</i></span>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs attention?" />
              </label>
              <label className="form-field">
                <span>Category <i>*</i></span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Location <i>*</i></span>
                <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area, building or landmark" />
              </label>
              <label className="form-field span-two">
                <span>What happened? <i>*</i></span>
                <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share clear details that help the community understand the issue." />
              </label>
              <label className="form-field">
                <span>Date observed</span>
                <input type="date" value={observedDate} onChange={(e) => setObservedDate(e.target.value)} />
              </label>
              <label className="form-field">
                <span>Approximate time</span>
                <input type="time" value={observedTime} onChange={(e) => setObservedTime(e.target.value)} />
              </label>
              <label className="form-field span-two">
                <span>Photo or supporting document (optional)</span>
                <label className="file-drop">
                  <Upload size={16} /> Choose a photo or document (up to 2 MB)
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => chooseAttachment(e.target.files?.[0])} hidden />
                  {attachment && <span className="file-added"><Check size={14} /> {attachment.name}</span>}
                </label>
                {attachment?.type.startsWith('image/') && <img className="form-image-preview" src={attachment.url} alt="Issue attachment preview" />}
              </label>
            </div>
            <div className="privacy-choice">
              <div>
                <strong><Eye size={16} /> Report visibility</strong>
                <p>Choose whether this report can be seen in public community lists.</p>
              </div>
              <label className="toggle-label">
                <input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} />
                <span className="toggle-switch" />
                <span>{confidential ? 'Confidential' : 'Public report'}</span>
              </label>
            </div>
            {confidential && <div className="confidential-note"><ShieldCheck size={15} /> Your confidential report will not appear in public lists or feeds.</div>}
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <span className="muted-small">Please do not include private identification numbers.</span>
              <Button onClick={submit}>Submit report <ArrowUpRight size={15} /></Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
