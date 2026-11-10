import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Check, Clock3, Code2, GraduationCap, Home, Lightbulb, MapPin, MessageCircle, Plus, Search, Send, ShieldAlert, ShieldCheck, SlidersHorizontal, Sprout, Star, UsersRound, ImagePlus, Bookmark, Settings, UserRound, LockKeyhole, Eye, Flag, MoreHorizontal, Calendar, Building2, BookOpen, Clock, CheckCircle2, ClipboardList, FlaskConical, Trash2, Globe, ExternalLink } from 'lucide-react';
import type { EventItem, LostItem, MemberProfile, Opportunity, Stay } from '../data/mockData';
import { defaultProfile } from '../data/mockData';
import type { SharedContext } from '../components/AppShell';
import { useLocalStorageState } from '../lib/storage';
import { Avatar, Badge, Button, EmptyState, SectionHeading } from '../components/ui';
import ListingModal from '../components/ListingModal';
import {
  globalSearchApi,
  getCommunitiesApi,
  toggleJoinCommunityApi,
  getOpportunitiesApi,
  createOpportunityApi,
  getAccommodationsApi,
  createAccommodationApi,
  getEventsApi,
  createEventApi,
  toggleEventAttendApi,
  toggleEventSaveApi,
  getLostFoundApi,
  createLostFoundApi,
  getConversationsApi,
  sendMessageApi,
  getSettingsApi,
  updateSettingsApi,
  getAdminOverviewApi,
  getModerationQueueApi,
  updateModerationStatusApi,
} from '../lib/api';
import './FeaturePage.css';

type CommunityItem = {
  name: string;
  members: string;
  category: string;
  description: string;
  icon: any;
  // External links — may be null/undefined when not set
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  github?: string | null;
  youtube?: string | null;
};

const initialKyUCommunities: CommunityItem[] = [
  {
    name: 'Computer Society of Kirinyaga (CSK)',
    category: 'Technology & Engineering',
    description: 'The premier student tech community for CS, Software Engineering, IT, and BBIT students at Kirinyaga University. Organizes workshops, hackathons, AI/ML masterclasses, and peer coding mentorship.',
    members: '384',
    icon: Code2,
    website: 'https://computersocietyofkirinyaga.org',
    github: 'https://github.com/Computer-Society-Of-Kirinyaga',
    facebook: 'https://www.facebook.com/search/top?q=Computer%20Society%20of%20Kirinyaga',
  },
  {
    name: 'Kirinyaga University Christian Union (KyUCU)',
    category: 'Faith & Spiritual',
    description: 'Non-denominational evangelical fellowship dedicated to spiritual formation, praise and worship, discipleship, and evangelism across the KyU campus community.',
    members: '650',
    icon: Lightbulb,
    website: 'https://www.kyuchristianunion.org',
    facebook: 'https://www.facebook.com/profile.php?id=100079867135744',
    instagram: 'https://instagram.com/kirinyagauniversity_cu',
    youtube: 'https://www.youtube.com/@kirinyagauniversitycu43',
  },
  {
    name: 'Kirinyaga University Students Organization (KyUSO)',
    category: 'Student Governance',
    description: 'Official representative governing council for all KyU undergraduate and postgraduate students, coordinating welfare, academic advocacy, and administration dialogue.',
    members: '4,200',
    icon: ShieldCheck,
    website: 'https://students.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Students%20Organization',
  },
  {
    name: 'Rotaract Club of Kirinyaga University',
    category: 'Community Service & Leadership',
    description: 'Affiliated with Rotary International, empowering young adults through community development, humanitarian drives, youth leadership summits, and professional networking.',
    members: '145',
    icon: Globe,
    website: 'https://www.rotary.org/en/get-involved/rotaract-clubs',
    facebook: 'https://www.facebook.com/search/top?q=Rotaract%20Club%20of%20Kirinyaga%20University',
  },
  {
    name: 'Kenya Red Cross – KyU Chapter',
    category: 'Community Service & First Aid',
    description: 'Campus humanitarian wing providing certified emergency first-aid drills, voluntary blood donation camps, disaster preparedness training, and mental wellness outreach.',
    members: '210',
    icon: ShieldAlert,
    website: 'https://www.redcross.or.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Red%20Cross',
  },
  {
    name: 'Young Catholic Students (YCS - KyU)',
    category: 'Faith & Spiritual',
    description: 'Catholic community at Kirinyaga University promoting faith, fellowship, liturgical celebrations, Sunday masses, annual retreats, and community acts of mercy.',
    members: '195',
    icon: BookOpen,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Young%20Catholic%20Students%20Kirinyaga%20University',
  },
  {
    name: 'Seventh-Day Adventist (SDA) Campus Ministries',
    category: 'Faith & Spiritual',
    description: 'Home for Adventist university students focusing on Sabbath worship, spiritual fellowship, scripture study, choral music, and health missionary campaigns.',
    members: '160',
    icon: Star,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20SDA',
  },
  {
    name: 'Muslim Students Association (MSA - KyU)',
    category: 'Faith & Spiritual',
    description: 'Nurturing Islamic faith, daily prayers in congregation, Ramadan iftar gatherings, community charity drives, and brotherly/sisterly unity on campus.',
    members: '130',
    icon: Home,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Muslim%20Students',
  },
  {
    name: 'KyU Environmental Conservation Club',
    category: 'Environmental & Sustainability',
    description: 'Championing environmental conservation, county-wide tree planting initiatives, campus clean-up exercises, climate resilience, and eco-friendly innovations.',
    members: '220',
    icon: Sprout,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Environmental%20Club',
  },
  {
    name: 'KyU Innovation & Robotics Hub',
    category: 'Technology & Engineering',
    description: 'Hardware, IoT, electronics, automation and robotics lab where KyU students build autonomous rovers, drones, and embedded solutions for local industry challenges.',
    members: '115',
    icon: Lightbulb,
    website: 'https://computersocietyofkirinyaga.org',
    facebook: 'https://www.facebook.com/search/top?q=KyU%20Robotics',
    github: 'https://github.com/Computer-Society-Of-Kirinyaga',
  },
  {
    name: 'Kirinyaga University Debate & Model UN',
    category: 'Academics & Public Speaking',
    description: 'Competitive collegiate debate society fostering rhetorical prowess, research, critical analysis, parliamentary procedure, and national Model UN participation.',
    members: '95',
    icon: MessageCircle,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Debate',
  },
  {
    name: 'KyU Performing Arts, Drama & Music Society',
    category: 'Arts & Culture',
    description: 'Celebrating cultural talent and creative arts through drama stage plays, comedy, spoken-word poetry, choral recitals, and modern dance performances.',
    members: '180',
    icon: UsersRound,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Drama%20Club',
  },
  {
    name: 'KyU Peer Counselors Association',
    category: 'Health & Wellness',
    description: 'Empathetic student peer counselors working in coordination with the Dean of Students to provide mental wellness advocacy, guidance, and substance abuse awareness.',
    members: '85',
    icon: CheckCircle2,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=KyU%20Peer%20Counselors',
  },
  {
    name: 'Kirinyaga University Sports Association',
    category: 'Sports & Athletics',
    description: 'Coordinates varsity football, basketball, volleyball, rugby, hockey, table tennis, and athletics teams competing regionally under Kenya Universities Sports Federation (KUSF).',
    members: '950',
    icon: GraduationCap,
    website: 'https://www.kyu.ac.ke',
    facebook: 'https://www.facebook.com/search/top?q=Kirinyaga%20University%20Sports',
  },
];
type Chat = { id?: string; name: string; initials: string; color?: string; preview: string; time: string; unread: number; online: boolean; messages: string[] };

export default function FeaturePage() {
  const { pathname } = useLocation();
  const [profile] = useLocalStorageState<MemberProfile>('profile', defaultProfile);
  const [params] = useSearchParams();
  const { posts, saved, toast } = useOutletContext<SharedContext>();

  const [query, setQuery] = useState(params.get('q') || '');
  useEffect(() => setQuery(params.get('q') || ''), [params]);

  const [groups, setGroups] = useState<CommunityItem[]>(initialKyUCommunities);
  const [groupSearch, setGroupSearch] = useState('');
  const [joined, setJoined] = useLocalStorageState<string[]>('joined-groups', []);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [lost, setLost] = useState<LostItem[]>([]);
  const [savedEvents, setSavedEvents] = useLocalStorageState<string[]>('saved-events', []);
  const [interested, setInterested] = useLocalStorageState<string[]>('interested-events', []);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [activeChat, setActiveChat] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [chatAttachment, setChatAttachment] = useState('');
  const [businessListings] = useState<any[]>([]);
  const [articleListings] = useState<any[]>([]);
  const [issueListings] = useState<any[]>([]);
  const [savedSettings, setSavedSettings] = useLocalStorageState<Record<string, boolean>>('preferences', { publicProfile: true, messagesFromCommunity: true, eventNotices: true, issueUpdates: true, weeklyDigest: false, reducedMotion: false });
  const [adminStatus, setAdminStatus] = useLocalStorageState<Record<string, string>>('admin-status', {});
  const [adminStats, setAdminStats] = useState<{ label: string; value: string }[]>([]);
  const [adminQueue, setAdminQueue] = useState<any[]>([]);
  const [apiSearchResults, setApiSearchResults] = useState<{ title: string; detail: string; kind: string; path: string }[]>([]);

  const [filter, setFilter] = useState('All');
  const [place, setPlace] = useState('All locations');
  const [budget, setBudget] = useState('Any budget');
  const [stayType, setStayType] = useState('All types');
  const [stayFacility, setStayFacility] = useState('All facilities');
  const [eventView, setEventView] = useState<'List' | 'Calendar'>('List');
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPlace, setFormPlace] = useState('');
  const [formDetail, setFormDetail] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formRooms, setFormRooms] = useState('1');
  const [formExternal, setFormExternal] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formError, setFormError] = useState('');
  const [lostTab, setLostTab] = useState('All items');

  // Load live data from API depending on current feature page
  useEffect(() => {
    let ignore = false;

    if (pathname === '/explore' && query.trim()) {
      globalSearchApi(query.trim()).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setApiSearchResults(res.data);
        }
      }).catch(() => {});
    }

    if (pathname === '/community' || pathname === '/academics') {
      getCommunitiesApi(groupSearch || undefined).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const defaultIcons = [Code2, BriefcaseBusiness, Sprout, GraduationCap, FlaskConical, Lightbulb, ShieldCheck, Globe];
          setGroups(res.data.map((c: any, index: number) => ({
            name: c.name,
            members: c.members || (c.membersCount ? c.membersCount.toLocaleString('en-KE') : '0'),
            category: c.category || 'Academic community',
            description: c.description || '',
            icon: defaultIcons[index % defaultIcons.length],
            website: c.website || null,
            facebook: c.facebook || null,
            instagram: c.instagram || null,
            twitter: c.twitter || null,
            github: c.github || null,
            youtube: c.youtube || null,
          })));
        }
      }).catch(() => {});
    }

    if (pathname === '/opportunities') {
      getOpportunitiesApi({ type: filter === 'All' ? undefined : filter, search: query || undefined }).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setOpps(res.data);
        }
      }).catch(() => {});
    }

    if (pathname === '/accommodation') {
      getAccommodationsApi({
        place: place === 'All locations' ? undefined : place,
        budget: budget === 'Any budget' ? undefined : budget,
        type: stayType === 'All types' ? undefined : stayType,
        facility: stayFacility === 'All facilities' ? undefined : stayFacility,
      }).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setStays(res.data);
        }
      }).catch(() => {});
    }

    if (pathname === '/events') {
      getEventsApi({ category: filter === 'All' ? undefined : filter, search: query || undefined }).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setEventList(res.data);
        }
      }).catch(() => {});
    }

    if (pathname === '/lost-found') {
      getLostFoundApi({ status: lostTab === 'All items' ? undefined : lostTab, search: query || undefined }).then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setLost(res.data);
        }
      }).catch(() => {});
    }

    if (pathname === '/messages') {
      getConversationsApi().then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setChatList(res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            initials: c.initials,
            color: c.color,
            preview: c.preview,
            time: c.time,
            unread: c.unread || 0,
            online: c.online || false,
            messages: [c.preview],
          })));
        }
      }).catch(() => {});
    }

    if (pathname === '/settings') {
      getSettingsApi().then((res) => {
        if (!ignore && res.data) {
          setSavedSettings((prev) => ({ ...prev, ...res.data }));
        }
      }).catch(() => {});
    }

    if (pathname === '/admin') {
      getAdminOverviewApi().then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setAdminStats(res.data);
        }
      }).catch(() => {});

      getModerationQueueApi().then((res) => {
        if (!ignore && res.data && Array.isArray(res.data)) {
          setAdminQueue(res.data);
        }
      }).catch(() => {});
    }

    return () => { ignore = true; };
  }, [pathname, query, filter, place, budget, stayType, stayFacility, lostTab, groupSearch, setOpps, setStays, setEventList, setLost, setChatList, setSavedSettings]);

  const visiblePosts = posts.filter((post) => saved.includes(post.id));

  const localDiscoveryMatches = query.trim() ? [
    ...posts.filter((post) => `${post.body} ${post.category}`.toLowerCase().includes(query.toLowerCase())).map((post) => ({ title: post.body.slice(0, 72), detail: post.category, kind: 'Community post', path: '/' })),
    ...businessListings.filter((item) => `${item.name} ${item.category} ${item.location} ${item.description} ${item.products?.join(' ') || ''}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.name, detail: `${item.category} · ${item.location}`, kind: 'Business', path: '/marketplace' })),
    ...articleListings.filter((item) => `${item.title} ${item.category} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.title, detail: item.category, kind: 'Story', path: `/article/${item.id}` })),
    ...issueListings.filter((item) => `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.title, detail: `${item.category} · ${item.location}`, kind: 'Community issue', path: '/issues' })),
    ...opps.filter((item) => `${item.title} ${item.type} ${item.org}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.title, detail: `${item.type} · ${item.org}`, kind: 'Opportunity', path: '/opportunities' })),
    ...eventList.filter((item) => `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.title, detail: `${item.category} · ${item.location}`, kind: 'Event', path: '/events' })),
    ...stays.filter((item) => `${item.name} ${item.type} ${item.location}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.name, detail: `${item.type} · ${item.location}`, kind: 'Accommodation', path: '/accommodation' })),
    ...groups.filter((item) => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase())).map((item) => ({ title: item.name, detail: item.category, kind: 'Academic community', path: '/academics' })),
  ].slice(0, 12) : [];

  const discoveryMatches = apiSearchResults.length > 0 ? apiSearchResults : localDiscoveryMatches;

  const filteredGroups = useMemo(() => groups.filter((group) => `${group.name} ${group.category} ${group.description}`.toLowerCase().includes(groupSearch.toLowerCase())), [groupSearch]);
  const filteredOpps = useMemo(() => opps.filter((item) => (filter === 'All' || item.type === filter) && `${item.title} ${item.org} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [opps, filter, query]);
  const filteredEvents = eventList.filter((item) => (filter === 'All' || item.category === filter) && `${item.title} ${item.host} ${item.location}`.toLowerCase().includes(query.toLowerCase()));
  const filteredStays = stays.filter((item) => (place === 'All locations' || item.location === place) && (stayType === 'All types' || item.type === stayType) && (stayFacility === 'All facilities' || item.features.includes(stayFacility)) && (budget === 'Any budget' || (budget === 'Under KES 7,000' ? item.rent < 7000 : budget === 'KES 7,000–10,000' ? item.rent >= 7000 && item.rent <= 10000 : item.rent > 10000)));
  const filteredLost = lost.filter((item) => (lostTab === 'All items' || item.status === lostTab) && `${item.name} ${item.location} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const filteredChats = chatList.filter((chat) => chat.name.toLowerCase().includes(chatSearch.toLowerCase()));
  const titleMap: Record<string, string> = { '/explore': 'Explore KyU', '/community': 'Community', '/opportunities': 'Opportunities', '/accommodation': 'Accommodation', '/events': 'Events & activities', '/lost-found': 'Lost & Found', '/academics': 'Academic Communities', '/messages': 'Messages', '/saved': 'Saved Posts', '/profile': 'Your profile', '/settings': 'Settings & privacy', '/admin': 'Admin dashboard' };

  const openModal = () => { setFormError(''); setModalOpen(true); };
  const resetModal = () => {
    setModalOpen(false);
    setFormTitle('');
    setFormRooms('1');
    setFormTime('');
    setFormExternal('');
    setFormCategory('');
    setFormPlace('');
    setFormDetail('');
    setFormDate('');
    setFormPrice('');
    setFormContact('');
    setFormError('');
  };

  const submitListing = async (photo?: string) => {
    if (!formTitle.trim() || !formPlace.trim() || !formDetail.trim()) {
      setFormError('Please complete the title, location and description.');
      return;
    }

    if (pathname === '/events') {
      const newEvent: EventItem = {
        title: formTitle.trim(),
        category: formCategory || 'Community Events',
        date: formDate || 'Date to be confirmed',
        time: formTime || 'Time to be confirmed',
        location: formPlace.trim(),
        host: formContact || profile.name,
        image: photo,
        description: formDetail.trim(),
        registration: formExternal,
        contact: formContact,
      };
      setEventList((items) => [newEvent, ...items]);
      createEventApi({
        title: formTitle.trim(),
        category: formCategory || 'Community Events',
        date: formDate || 'Nov 12, 2026',
        time: formTime || '10:00 am',
        location: formPlace.trim(),
        host: formContact || profile.name,
        description: formDetail.trim(),
        image: photo || undefined,
        registration: formExternal || undefined,
        contact: formContact || undefined,
      }).catch(() => {});
    } else if (pathname === '/opportunities') {
      const newOpp: Opportunity = {
        title: formTitle.trim(),
        org: formContact || profile.name,
        type: formCategory || 'Internships',
        location: formPlace.trim(),
        deadline: formDate || 'Deadline to be confirmed',
        summary: formDetail.trim(),
        url: formExternal || undefined,
      };
      setOpps((items) => [newOpp, ...items]);
      createOpportunityApi({
        title: formTitle.trim(),
        org: formContact || profile.name,
        type: formCategory || 'Internships',
        location: formPlace.trim(),
        deadline: formDate || 'Nov 30, 2026',
        summary: formDetail.trim(),
        url: formExternal || undefined,
      }).catch(() => {});
    } else if (pathname === '/accommodation') {
      const newStay: Stay = {
        name: formTitle.trim(),
        type: formCategory || 'Hostel',
        location: formPlace.trim(),
        rent: Number(formPrice) || 0,
        rooms: Number(formRooms) || 1,
        features: formDetail.split(',').map((x) => x.trim()).filter(Boolean),
        image: photo || '/assets/student-life.jpg',
        contact: formContact || undefined,
      };
      setStays((items) => [newStay, ...items]);
      createAccommodationApi({
        name: formTitle.trim(),
        type: formCategory || 'Hostel',
        location: formPlace.trim(),
        rent: Number(formPrice) || 5000,
        rooms: Number(formRooms) || 1,
        features: formDetail.split(',').map((x) => x.trim()).filter(Boolean),
        image: photo || undefined,
        contact: formContact || undefined,
      }).catch(() => {});
    } else {
      const newLost: LostItem = {
        name: formTitle.trim(),
        status: formCategory === 'Found' ? 'Found' : 'Lost',
        location: formPlace.trim(),
        date: formDate || 'Today',
        description: formDetail.trim(),
        initials: profile.initials,
        image: photo,
        contact: formContact || undefined,
      };
      setLost((items) => [newLost, ...items]);
      createLostFoundApi({
        name: formTitle.trim(),
        status: formCategory === 'Found' ? 'Found' : 'Lost',
        location: formPlace.trim(),
        date: formDate || 'Today',
        description: formDetail.trim(),
        image: photo || undefined,
        contact: formContact || undefined,
      }).catch(() => {});
    }

    toast(`Your ${pathname === '/lost-found' ? 'item' : pathname.slice(1).replace('-', ' ')} listing was added.`);
    resetModal();
  };

  const toggleArray = (id: string, values: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, label: string) => {
    const exists = values.includes(id);
    setter(exists ? values.filter((x) => x !== id) : [...values, id]);
    if (!exists) toast(label);
  };

  const handleToggleEventAttend = async (eventTitle: string) => {
    toggleArray(eventTitle, interested, setInterested, 'You’re interested in this event.');
    try {
      await toggleEventAttendApi(eventTitle);
    } catch {
      // Handled
    }
  };

  const handleToggleEventSave = async (eventTitle: string) => {
    toggleArray(eventTitle, savedEvents, setSavedEvents, 'Event saved.');
    try {
      await toggleEventSaveApi(eventTitle);
    } catch {
      // Handled
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !chatAttachment) return;
    const chat = chatList[activeChat];
    if (!chat) return;

    const line = messageText.trim() || `Shared an image: ${chatAttachment}`;
    setChatList((items) => items.map((item) => item.name === chat.name ? { ...item, preview: line, time: 'Now', messages: [...item.messages, line] } : item));
    setMessageText('');
    setChatAttachment('');

    if (chat.id) {
      try {
        await sendMessageApi(chat.id, { body: line });
      } catch {
        // Preserved
      }
    }
  };

  const toggleJoin = async (name: string) => {
    const already = joined.includes(name);
    setJoined((items) => already ? items.filter((item) => item !== name) : [...items, name]);
    toast(already ? `You left ${name}.` : `You joined ${name}.`);
    try {
      await toggleJoinCommunityApi(name);
    } catch {
      // Preserved
    }
  };

  const toggleSetting = async (key: string) => {
    const nextVal = !savedSettings[key];
    setSavedSettings((settings) => ({ ...settings, [key]: nextVal }));
    try {
      await updateSettingsApi({ [key]: nextVal });
    } catch {
      // Preserved
    }
  };

  const updateAdmin = async (key: string, value: string) => {
    setAdminStatus((current) => ({ ...current, [key]: value }));
    toast(`Moderation status set to “${value}”.`);
    try {
      await updateModerationStatusApi(key, value);
    } catch {
      // Handled
    }
  };

  const goToCreate = () => openModal();
  const listingModal = (
    <ListingModal
      pathname={pathname}
      open={modalOpen}
      title={formTitle}
      category={formCategory}
      place={formPlace}
      detail={formDetail}
      date={formDate}
      time={formTime}
      rooms={formRooms}
      price={formPrice}
      contact={formContact}
      externalLink={formExternal}
      error={formError}
      onTitle={setFormTitle}
      onCategory={setFormCategory}
      onPlace={setFormPlace}
      onDetail={setFormDetail}
      onDate={setFormDate}
      onTime={setFormTime}
      onRooms={setFormRooms}
      onPrice={setFormPrice}
      onContact={setFormContact}
      onExternalLink={setFormExternal}
      onError={setFormError}
      onClose={resetModal}
      onSubmit={submitListing}
    />
  );

  // EXPLORE PAGE
  if (pathname === '/explore') {
    return (
      <div className="page-content section-page explore-page">
        <div className="explore-hero">
          <div className="page-kicker"><span className="kicker-icon kicker-explore"><Search size={16} /></span><span>FIND YOUR NEXT CONNECTION</span></div>
          <h1>Good things start <em>here.</em></h1>
          <p>Discover people, conversations, local services and opportunities around KyU.</p>
          <div className="explore-search">
            <Search size={19} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search across the KyU community..." />
            <Button variant="secondary" onClick={() => toast(query ? `Searching KyU Community for “${query}”.` : 'Enter a topic to start exploring.')}>Search</Button>
          </div>
        </div>
        <SectionHeading title={query ? `Explore results for “${query}”` : 'Explore by interest'} />
        {query.trim() ? (
          <div className="explore-results">
            {discoveryMatches.length ? (
              discoveryMatches.map((result, index) => (
                <Link className="explore-result-row" key={`${result.kind}-${result.title}-${index}`} to={result.path}>
                  <span className="explore-result-kind">{result.kind}</span>
                  <span><strong>{result.title}</strong><small>{result.detail}</small></span>
                  <ArrowUpRight size={15} />
                </Link>
              ))
            ) : (
              <EmptyState title="No community results yet" detail="Try another phrase, person or location." />
            )}
          </div>
        ) : (
          <div className="discovery-grid">
            {[
              { name: 'People & community', icon: UsersRound, path: '/community', color: 'blue', text: 'Meet people and find your circles' },
              { name: 'Local businesses', icon: Building2, path: '/marketplace', color: 'teal', text: 'Find community-owned services' },
              { name: 'Issues & ideas', icon: ShieldAlert, path: '/issues', color: 'amber', text: 'Follow local issues and solutions' },
              { name: 'Stories & learning', icon: BookOpen, path: '/blogs', color: 'purple', text: 'Ideas from the KyU community' },
              { name: 'Career opportunities', icon: BriefcaseBusiness, path: '/opportunities', color: 'green', text: 'Explore your next opportunity' },
              { name: 'Campus events', icon: CalendarDays, path: '/events', color: 'rose', text: 'Find out what is coming up' },
            ].map(({ name, icon: Icon, path, color, text }) => (
              <Link className="discovery-card" key={path} to={path}>
                <span className={`discovery-icon icon-${color}`}><Icon size={19} /></span>
                <span><strong>{name}</strong><small>{text}</small></span>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        )}
        <div className="right-card explore-community-callout">
          <SparkleIcon />
          <div>
            <b>There’s room for everyone.</b>
            <p>Connect with academic groups, campus voices and neighbours around Kirinyaga University.</p>
          </div>
          <Link to="/community">Meet your community <ArrowRight size={14} /></Link>
        </div>
      </div>
    );
  }

  // COMMUNITIES / ACADEMICS
  if (pathname === '/community' || pathname === '/academics') {
    return (
      <div className="page-content section-page communities-page">
        <div className="feature-hero compact-hero">
          <div className="page-kicker"><span className="kicker-icon kicker-academic"><GraduationCap size={16} /></span><span>{pathname === '/academics' ? 'LEARN TOGETHER' : 'BETTER TOGETHER'}</span></div>
          <h1>{pathname === '/academics' ? <>Find your <em>learning circle.</em></> : <>A community for <em>every voice.</em></>}</h1>
          <p>Shared interests make campus feel closer. Find your people and join in.</p>
          <div className="inline-search">
            <Search size={15} />
            <input value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} placeholder="Find a community..." />
            <span>{filteredGroups.length} groups</span>
          </div>
        </div>

        <SectionHeading title={pathname === '/academics' ? 'Academic communities' : 'Popular communities'} action={<span className="results-label">A place to ask, share and grow</span>} />
        <div className="community-grid">
          {filteredGroups.map((group) => {
            const Icon = group.icon;
            const isJoined = joined.includes(group.name);
            return (
              <article className="community-card" key={group.name}>
                <div className="community-card-top">
                  <span className="community-icon"><Icon size={19} /></span>
                  <button className="icon-button" aria-label={`Community actions for ${group.name}`} onClick={() => toast(`${group.name}: feed, members and discussion spaces.`)}>
                    <MoreHorizontal size={17} />
                  </button>
                </div>
                <small className="community-card-category">{group.category}</small>
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                {(group.website || group.facebook || group.instagram || group.github || group.youtube) && (
                  <div className="community-live-links">
                    {group.website && (
                      <a href={group.website} target="_blank" rel="noopener noreferrer" className="community-link-pill website" title={`Visit ${group.name} website`}>
                        <Globe size={12} />
                        <span>Website</span>
                        <ExternalLink size={10} className="pill-ext" />
                      </a>
                    )}
                    {group.facebook && (
                      <a href={group.facebook} target="_blank" rel="noopener noreferrer" className="community-link-pill facebook" title={`Visit ${group.name} on Facebook`}>
                        <svg className="social-svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                        <ExternalLink size={10} className="pill-ext" />
                      </a>
                    )}
                    {group.instagram && (
                      <a href={group.instagram} target="_blank" rel="noopener noreferrer" className="community-link-pill instagram" title={`Visit ${group.name} on Instagram`}>
                        <svg className="social-svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span>Instagram</span>
                        <ExternalLink size={10} className="pill-ext" />
                      </a>
                    )}
                    {group.github && (
                      <a href={group.github} target="_blank" rel="noopener noreferrer" className="community-link-pill github" title={`Visit ${group.name} on GitHub`}>
                        <svg className="social-svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                        <ExternalLink size={10} className="pill-ext" />
                      </a>
                    )}
                    {group.youtube && (
                      <a href={group.youtube} target="_blank" rel="noopener noreferrer" className="community-link-pill youtube" title={`Visit ${group.name} on YouTube`}>
                        <svg className="social-svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>YouTube</span>
                        <ExternalLink size={10} className="pill-ext" />
                      </a>
                    )}
                  </div>
                )}
                <div className="community-card-foot">
                  <span><UsersRound size={14} /> {group.members} members</span>
                  <button className={`join-link${isJoined ? ' joined' : ''}`} onClick={() => toggleJoin(group.name)}>
                    {isJoined ? <><Check size={14} /> Joined</> : <>Join <ArrowRight size={14} /></>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="knowledge-note">
          <ShieldCheck size={16} />
          <span>Academic communities are open spaces for respectful learning, mentorship and resource-sharing.</span>
        </div>
      </div>
    );
  }

  // OPPORTUNITIES
  if (pathname === '/opportunities') {
    return (
      <div className="page-content section-page list-feature-page">
        <div className="feature-hero opportunities-hero">
          <div className="page-kicker"><span className="kicker-icon kicker-opportunity"><BriefcaseBusiness size={16} /></span><span>YOUR NEXT CHAPTER</span></div>
          <div className="feature-hero-row">
            <div>
              <h1>Opportunity is <em>closer.</em></h1>
              <p>Find internships, scholarships, training and work for your next step.</p>
            </div>
            <Button onClick={goToCreate}><Plus size={16} /> Share an opportunity</Button>
          </div>
          <div className="opportunity-summary">
            <span><BriefcaseBusiness size={15} /><b>{opps.length}</b> opportunities</span>
            <span><Badge tone="green">Community reviewed</Badge></span>
            <span>Updated regularly by the KyU community</span>
          </div>
        </div>
        <div className="listing-controls">
          <div className="inline-search">
            <Search size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles or organizations..." />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter opportunity category">
            {['All', ...new Set(opps.map((x) => x.type))].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <SectionHeading title="Explore opportunities" action={<span className="results-label">{filteredOpps.length} open listings</span>} />
        {filteredOpps.map((item) => (
          <article className="opportunity-card" key={item.title}>
            <span className="opportunity-type-icon"><BriefcaseBusiness size={18} /></span>
            <div className="opportunity-card-main">
              <div className="opportunity-type-row">
                <Badge tone="blue">{item.type}</Badge>
                {item.verified && <span className="verified-label"><ShieldCheck size={12} /> Reviewed</span>}
              </div>
              <h3>{item.title}</h3>
              <div className="opportunity-org">
                <b>{item.org}</b><span>·</span><MapPin size={13} /> {item.location}
              </div>
              <p>{item.summary}</p>
              <div className="opportunity-footer">
                <span><Clock3 size={14} /> Apply by <b>{item.deadline}</b></span>
                <button onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : toast(`Application details for ${item.title}: check the official organization listing before sharing personal information.`)}>
                  View details <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!filteredOpps.length && <EmptyState title="No opportunities match" detail="Try a different category or search term." />}
        {listingModal}
      </div>
    );
  }

  // ACCOMMODATION
  if (pathname === '/accommodation') {
    return (
      <div className="page-content section-page stays-page">
        <div className="stay-hero">
          <div className="page-kicker"><span className="kicker-icon kicker-stay"><Home size={16} /></span><span>YOUR PLACE NEAR KYU</span></div>
          <h1>Find a place to <em>feel at home.</em></h1>
          <p>Explore shared spaces and accommodation around Kerugoya and campus.</p>
          <div className="stay-filter-bar">
            <label>
              <MapPin size={16} />
              <select value={place} onChange={(e) => setPlace(e.target.value)}>
                {['All locations', ...new Set(stays.map((x) => x.location))].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label>
              <SlidersHorizontal size={16} />
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                {['Any budget', 'Under KES 7,000', 'KES 7,000–10,000', 'Over KES 10,000'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label>
              <Home size={15} />
              <select value={stayType} onChange={(e) => setStayType(e.target.value)}>
                {['All types', ...new Set(stays.map((item) => item.type))].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label>
              <Check size={15} />
              <select value={stayFacility} onChange={(e) => setStayFacility(e.target.value)}>
                {['All facilities', ...new Set(stays.flatMap((item) => item.features))].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <Button variant="secondary" onClick={goToCreate}><Plus size={15} /> List a place</Button>
          </div>
        </div>
        <div className="stay-results-heading">
          <SectionHeading title="Places near campus" action={<span className="results-label">{filteredStays.length} available</span>} />
          <span>Contact the owner to confirm current availability.</span>
        </div>
        <div className="stay-grid">
          {filteredStays.map((stay) => (
            <article className="stay-card" key={stay.name}>
              <div className="stay-image">
                <img src={stay.image} alt="Student accommodation near campus" />
                <Badge tone="green">Available</Badge>
              </div>
              <div className="stay-card-body">
                <Badge tone="neutral">{stay.type}</Badge>
                <h3>{stay.name}</h3>
                <p><MapPin size={14} /> {stay.location}</p>
                <div className="stay-features">
                  {stay.features.map((x) => <span key={x}><Check size={12} /> {x}</span>)}
                </div>
                <div className="stay-card-bottom">
                  <span>
                    <b>KES {stay.rent.toLocaleString('en-KE')}</b>
                    <small> / month · {stay.rooms} rooms available</small>
                  </span>
                  <Button variant="secondary" onClick={() => stay.contact ? window.location.assign(`tel:${stay.contact}`) : toast(`Contact the listing owner for ${stay.name}; confirm availability and viewing details.`)}>
                    Ask about room <ArrowUpRight size={13} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {listingModal}
      </div>
    );
  }

  // EVENTS
  if (pathname === '/events') {
    return (
      <div className="page-content section-page events-page">
        <div className="events-hero">
          <div>
            <div className="page-kicker"><span className="kicker-icon kicker-event"><CalendarDays size={16} /></span><span>MAKE TIME FOR WHAT MATTERS</span></div>
            <h1>There’s always <em>something on.</em></h1>
            <p>Meet, learn, play and take part in the wider community.</p>
          </div>
          <Button onClick={goToCreate}><Plus size={15} /> Create event</Button>
        </div>
        <div className="event-tools">
          <div className="inline-search">
            <Search size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." />
          </div>
          <div className="event-view-toggle">
            <button className={eventView === 'List' ? 'view-active' : ''} onClick={() => setEventView('List')}>
              <ClipboardList size={15} /> List
            </button>
            <button className={eventView === 'Calendar' ? 'view-active' : ''} onClick={() => setEventView('Calendar')}>
              <Calendar size={15} /> Calendar
            </button>
          </div>
        </div>
        <div className="event-category-row">
          {['All', 'Academic Events', 'Student Activities', 'Workshops', 'Sports', 'Entertainment', 'Career Events', 'Business Events', 'Community Events'].map((x) => (
            <button key={x} onClick={() => setFilter(x)} className={filter === x ? 'category-pill-active' : ''}>
              {x}
            </button>
          ))}
        </div>
        {eventView === 'Calendar' && (
          <div className="calendar-strip">
            {['SUN 08', 'MON 09', 'TUE 10', 'WED 11', 'THU 12', 'FRI 13', 'SAT 14'].map((date, i) => (
              <button
                className={i === 0 || i === 2 || i === 6 ? 'calendar-has-event' : ''}
                key={date}
                onClick={() => toast(i === 0 || i === 2 || i === 6 ? `${filteredEvents.filter((event) => event.date.includes(i === 0 ? '08' : i === 2 ? '10' : '14')).length || 1} community event(s) around ${date.slice(-2)} Nov.` : `No community events listed for ${date.slice(-2)} Nov.`)}
              >
                <span>{date.split(' ')[0]}</span>
                <b>{date.split(' ')[1]}</b>
                <i />
              </button>
            ))}
          </div>
        )}
        <SectionHeading title="Coming up in our community" action={<span className="results-label">November 2026</span>} />
        {filteredEvents.map((event) => {
          const isInterested = interested.includes(event.title);
          const isSaved = savedEvents.includes(event.title);
          return (
            <article className="event-card" key={event.title}>
              <div className="event-date-block">
                <span>NOV</span>
                <b>{event.date.split(' ')[1]?.replace(',', '') || '—'}</b>
                <small>{event.time}</small>
              </div>
              {event.image && <img className="event-card-image" src={event.image} alt="" />}
              <div className="event-card-main">
                <Badge tone="teal">{event.category}</Badge>
                <h3>{event.title}</h3>
                <p>{event.host}{event.description ? ` · ${event.description}` : ''}</p>
                <div className="event-card-meta">
                  <span><MapPin size={13} /> {event.location}</span>
                  <span><Clock size={13} /> {event.time}</span>
                </div>
              </div>
              <div className="event-card-actions">
                <button className={isSaved ? 'action-saved' : ''} onClick={() => handleToggleEventSave(event.title)}>
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <Button variant={isInterested ? 'secondary' : 'primary'} onClick={() => handleToggleEventAttend(event.title)}>
                  {isInterested ? <><Check size={14} /> Interested</> : 'I’m interested'}
                </Button>
                {event.registration?.startsWith('http') && (
                  <a className="button button-ghost" href={event.registration} target="_blank" rel="noreferrer">
                    Register <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
        {!filteredEvents.length && <EmptyState title="No events found" detail="Try another category or add an event to the community calendar." />}
        {listingModal}
      </div>
    );
  }

  // LOST & FOUND
  if (pathname === '/lost-found') {
    return (
      <div className="page-content section-page lost-page">
        <div className="lost-hero">
          <div>
            <div className="page-kicker"><span className="kicker-icon kicker-lost"><Search size={16} /></span><span>HELP IT FIND ITS WAY</span></div>
            <h1>Lost something? <em>Found something?</em></h1>
            <p>A little community help can make someone’s day.</p>
          </div>
          <Button onClick={goToCreate}><Plus size={15} /> Post an item</Button>
        </div>
        <div className="lost-guidance">
          <ShieldCheck size={16} />
          <span>Keep sensitive details private. Never post a full ID or bank card number; ask the owner to verify identifying details privately.</span>
        </div>
        <div className="lost-controls">
          <div className="inline-search">
            <Search size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items or locations..." />
          </div>
          <div className="event-view-toggle">
            {['All items', 'Lost', 'Found'].map((x) => (
              <button key={x} className={lostTab === x ? 'view-active' : ''} onClick={() => setLostTab(x)}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="lost-grid">
          {filteredLost.map((item) => (
            <article className="lost-card" key={item.name}>
              <div className={`lost-status lost-${item.status.toLowerCase()}`}>
                {item.status === 'Found' ? <CheckCircle2 size={14} /> : <Search size={14} />}{item.status}
              </div>
              <div className="lost-item-symbol">
                {item.image ? <img src={item.image} alt={`Photo of ${item.name}`} /> : item.status === 'Found' ? <CheckCircle2 size={24} /> : <Search size={24} />}
              </div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="lost-location">
                <MapPin size={14} /> {item.location}<span>·</span>{item.date}
              </div>
              <div className="lost-card-bottom">
                <Avatar name={item.initials} initials={item.initials} size="sm" />
                <span>Posted by a KyU community member</span>
                <button onClick={() => item.contact ? window.location.assign(`tel:${item.contact}`) : toast('Send a message to arrange a safe item handover.')}>
                  Contact <ArrowUpRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!filteredLost.length && <EmptyState title="No matching items" detail="Try a different search or add a lost/found post." />}
        {listingModal}
      </div>
    );
  }

  // MESSAGES
  if (pathname === '/messages') {
    return (
      <div className="page-content section-page messages-page">
        <div className="messages-heading">
          <div>
            <div className="page-kicker"><span className="kicker-icon kicker-message"><MessageCircle size={16} /></span><span>YOUR PRIVATE CONVERSATIONS</span></div>
            <h1>Messages</h1>
            <p>Connect directly with your community.</p>
          </div>
          <button className="icon-button" onClick={() => toast('Choose someone from your community directory to start a conversation.')} aria-label="New message">
            <Plus size={19} />
          </button>
        </div>
        <div className="messenger">
          <section className="conversation-column">
            <div className="conversation-search">
              <Search size={15} />
              <input value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search messages" />
            </div>
            <div className="conversation-list">
              {filteredChats.map((chat, index) => (
                <button
                  key={chat.name}
                  className={`conversation-item${activeChat === index ? ' conversation-active' : ''}`}
                  onClick={() => setActiveChat(index)}
                >
                  <div className="avatar-online-wrap">
                    <Avatar name={chat.name} initials={chat.initials} color={chat.color || '#e7edf7'} />
                    <span className={`online-indicator${chat.online ? ' online' : ''}`} />
                  </div>
                  <span className="conversation-copy">
                    <span><b>{chat.name}</b><small>{chat.time}</small></span>
                    <span><small>{chat.preview}</small>{chat.unread > 0 && <i>{chat.unread}</i>}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="message-privacy-note"><LockKeyhole size={13} /> End-to-end encrypted messaging</div>
          </section>
          <section className="chat-column">
            {chatList[activeChat] ? (
              <>
                <div className="chat-header">
                  <div className="avatar-online-wrap">
                    <Avatar name={chatList[activeChat].name} initials={chatList[activeChat].initials} color={chatList[activeChat].color || '#e7edf7'} />
                    <span className={`online-indicator${chatList[activeChat].online ? ' online' : ''}`} />
                  </div>
                  <div>
                    <b>{chatList[activeChat].name}</b>
                    <small>{chatList[activeChat].online ? 'Online now' : 'Last seen recently'}</small>
                  </div>
                  <div className="chat-header-actions">
                    <button onClick={() => toast('Conversation options')} aria-label="Conversation options"><MoreHorizontal size={18} /></button>
                    <button onClick={() => toast('Report submitted for moderator review.')} aria-label="Report conversation"><Flag size={15} /></button>
                  </div>
                </div>
                <div className="chat-messages">
                  <div className="chat-day-divider"><span>TODAY</span></div>
                  {chatList[activeChat].messages.map((text, index) => (
                    <div className={`chat-bubble-row${index % 2 === 1 ? ' chat-mine' : ''}`} key={`${text}-${index}`}>
                      {index % 2 === 0 && <Avatar name={chatList[activeChat].name} initials={chatList[activeChat].initials} color={chatList[activeChat].color || '#e7edf7'} size="sm" />}
                      <div className="chat-bubble">
                        {text}
                        <small>{index === chatList[activeChat].messages.length - 1 ? 'Now' : '9:4' + (index % 10)}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chat-compose">
                  <label className="chat-attach" title="Attach image">
                    <ImagePlus size={17} />
                    <input type="file" accept="image/*" hidden onChange={(e) => setChatAttachment(e.target.files?.[0]?.name || '')} />
                  </label>
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={chatAttachment || 'Write a message...'}
                  />
                  <button onClick={sendMessage} aria-label="Send message"><Send size={16} /></button>
                </div>
                <small className="chat-safety-note">Never share passwords or sensitive personal information in messages.</small>
              </>
            ) : (
              <EmptyState title="Choose a conversation" detail="Your messages will appear here." />
            )}
          </section>
        </div>
      </div>
    );
  }

  // SAVED POSTS
  if (pathname === '/saved') {
    return (
      <div className="page-content section-page saved-page">
        <div className="page-kicker"><span className="kicker-icon kicker-saved"><Bookmark size={15} /></span><span>YOUR COLLECTION</span></div>
        <h1>Saved <em>posts</em></h1>
        <p>Keep useful ideas close for later.</p>
        <SectionHeading title="Your saved feed" action={<span className="results-label">{visiblePosts.length} posts</span>} />
        {visiblePosts.length ? (
          <div className="saved-list">
            {visiblePosts.map((post) => (
              <article className="saved-post-card" key={post.id}>
                <Avatar name={post.author.name} initials={post.author.initials} color={post.author.color} />
                <div>
                  <div className="saved-post-meta">
                    <b>{post.author.name}</b>
                    <span>·</span>
                    <span>{post.createdAt}</span>
                    <Badge tone="blue">{post.category}</Badge>
                  </div>
                  <p>{post.body}</p>
                  <Link to="/">Open in community feed <ArrowUpRight size={13} /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing saved yet" detail="Bookmark a post, opportunity or event and it will be easy to find here." action={<Link className="button button-secondary" to="/">Explore the feed</Link>} />
        )}
      </div>
    );
  }

  // PROFILE
  if (pathname === '/profile') {
    return (
      <div className="page-content section-page profile-page">
        <div className="profile-cover">
          <img src="/assets/kyu-community.jpg" alt="KyU community" />
          <span className="profile-cover-decoration">KyU Community</span>
        </div>
        <div className="profile-info-row">
          <Avatar name={profile.name} initials={profile.initials} color={profile.color} size="lg" verified={profile.verified} image={profile.image} />
          <div className="profile-main-info">
            <div className="profile-name-line">
              <h1>{profile.name}</h1>
              <Badge tone={profile.verified ? 'teal' : 'amber'}>
                {profile.verified ? 'Verified university account' : 'Verification pending'}
              </Badge>
            </div>
            <p>{profile.role} · {profile.department}</p>
            <span><MapPin size={14} /> {profile.location} <span>·</span> Joined October 2026</span>
          </div>
          <Button variant="secondary" onClick={() => window.location.assign('/profile-setup')}>
            <Settings size={15} /> Edit profile
          </Button>
        </div>
        <div className="profile-stats-row">
          <div><b>12</b><span>Posts</span></div>
          <div><b>3</b><span>Articles</span></div>
          <div><b>284</b><span>Followers</span></div>
          <div><b>190</b><span>Following</span></div>
        </div>
        <div className="profile-about-card">
          <div>
            <h2>About</h2>
            <p>Curious about technology, community-led problem solving and ideas that make everyday life a little better. Happy to connect with people building good things around KyU.</p>
            <div className="profile-interest-tags">
              <Badge tone="blue">Technology</Badge>
              <Badge tone="teal">Community</Badge>
              <Badge tone="neutral">Entrepreneurship</Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={() => toast('Your public profile is visible to the KyU community.')}>
            Profile visibility <Eye size={14} />
          </Button>
        </div>
        <SectionHeading title="Recent posts" action={<span className="results-label">From your community feed</span>} />
        <div className="saved-list">
          {posts.filter((post) => post.author.id === 'me').slice(0, 3).map((post) => (
            <article className="saved-post-card" key={post.id}>
              <Avatar name={profile.name} initials={profile.initials} color={profile.color} />
              <div>
                <div className="saved-post-meta">
                  <b>{profile.name}</b>
                  <Badge tone="blue">{post.category}</Badge>
                </div>
                <p>{post.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  // SETTINGS
  if (pathname === '/settings') {
    return (
      <div className="page-content section-page settings-page">
        <div className="page-kicker"><span className="kicker-icon kicker-setting"><Settings size={16} /></span><span>MAKE KyU Community YOURS</span></div>
        <h1>Settings & <em>privacy.</em></h1>
        <p>Choose how you show up and what updates you hear about.</p>
        <div className="settings-layout">
          <nav className="settings-nav">
            {[
              ['Profile', UserRound],
              ['Privacy', LockKeyhole],
              ['Notifications', Bell],
              ['Messaging', MessageCircle],
              ['Accessibility', Eye],
              ['Community guidelines', ShieldCheck],
              ['Account security', ShieldAlert],
            ].map(([label, Icon]) => {
              const I = Icon as typeof Settings;
              return (
                <button key={label as string} className={label === 'Privacy' ? 'settings-nav-active' : ''} onClick={() => toast(`${label} preferences are active.`)}>
                  <I size={15} />{label as string}<ArrowRight size={13} />
                </button>
              );
            })}
          </nav>
          <div className="settings-content">
            <div className="settings-section">
              <div>
                <h2>Privacy & visibility</h2>
                <p>Control the information people can see.</p>
              </div>
              <SettingRow title="Public community profile" detail="Let KyU Community members view your profile and posts." active={savedSettings.publicProfile} onToggle={() => toggleSetting('publicProfile')} />
              <SettingRow title="Show your course and school" detail="Display your university details on your profile." active={savedSettings.publicProfile} onToggle={() => toggleSetting('publicProfile')} />
              <SettingRow title="Allow direct messages" detail="Receive messages from other community members." active={savedSettings.messagesFromCommunity} onToggle={() => toggleSetting('messagesFromCommunity')} />
            </div>
            <div className="settings-section">
              <div>
                <h2>Notification preferences</h2>
                <p>Choose which community updates matter to you.</p>
              </div>
              <SettingRow title="Issue status updates" detail="Follow important updates on community reports." active={savedSettings.issueUpdates} onToggle={() => toggleSetting('issueUpdates')} />
              <SettingRow title="Events and opportunities" detail="Get notices about new campus activities." active={savedSettings.eventNotices} onToggle={() => toggleSetting('eventNotices')} />
              <SettingRow title="Weekly community digest" detail="A helpful summary of what’s happening around KyU." active={savedSettings.weeklyDigest} onToggle={() => toggleSetting('weeklyDigest')} />
            </div>
            <div className="settings-section">
              <div>
                <h2>Accessibility</h2>
                <p>Make the interface more comfortable.</p>
              </div>
              <SettingRow title="Reduce motion" detail="Use fewer motion and transition effects." active={savedSettings.reducedMotion} onToggle={() => toggleSetting('reducedMotion')} />
              <button className="settings-action-row" onClick={() => toast('Community guidelines: be respectful, protect privacy and report harmful content.')}>
                Read community guidelines <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="settings-danger">
              <div>
                <h3>Account management</h3>
                <p>Delete your profile and saved preferences.</p>
              </div>
              <button onClick={() => window.confirm('Delete your profile and saved preferences?') && toast('Profile data cleared.')}>
                Delete account data <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN
  if (pathname === '/admin') {
    const displayStats = adminStats.length ? adminStats : [
      { label: 'Registered users', value: '4,286' },
      { label: 'Active this week', value: '1,204' },
      { label: 'Community posts', value: String(posts.length + 284) },
      { label: 'Open issue reports', value: '18' },
      { label: 'Resolved issues', value: '42' },
      { label: 'Business listings', value: '52' },
      { label: 'Published stories', value: '31' },
      { label: 'Upcoming events', value: String(eventList.length) },
    ];

    const displayQueue = adminQueue.length ? adminQueue.map((item) => [
      item.target_type ? `${item.target_type}: ${item.reason}` : item.name || 'Content flagged',
      item.target_type || 'Content report',
      'Pending review',
    ]) : [
      ['Community concern: water access', 'Issue report', 'Submitted 24 min ago'],
      ['New blog: Finding your first study group', 'Blog submission', 'Submitted 1 hr ago'],
      ['Business: Fresh Roots Produce', 'Business listing', 'Submitted 3 hrs ago'],
      ['Post reported for review', 'Community post', 'Submitted 4 hrs ago'],
    ];

    return (
      <div className="page-content section-page admin-page">
        <div className="admin-prototype-alert">
          <ShieldAlert size={16} />
          <span><b>Platform Operations</b> · Live moderator view connected to KyU Connect backend.</span>
        </div>
        <div className="admin-title-row">
          <div>
            <div className="page-kicker"><span className="kicker-icon kicker-admin"><ShieldCheck size={16} /></span><span>PLATFORM OPERATIONS</span></div>
            <h1>Community <em>overview.</em></h1>
            <p>Monitor wellbeing, trust and activity across KyU Community.</p>
          </div>
          <Badge tone="blue">Admin preview</Badge>
        </div>
        <div className="admin-stats-grid">
          {displayStats.map(({ label, value }) => (
            <div className="admin-stat-card" key={label}>
              <span><CheckCircle2 size={16} /></span>
              <b>{value}</b>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <div className="admin-content-grid">
          <section className="right-card admin-queue">
            <SectionHeading title="Content review queue" action={<Badge tone="amber">Pending</Badge>} />
            {displayQueue.map(([name, kind, time]) => (
              <div className="moderation-row" key={name}>
                <span>
                  <b>{name}</b>
                  <small>{kind} · {time}</small>
                </span>
                <select value={adminStatus[name] || 'Pending'} onChange={(e) => updateAdmin(name, e.target.value)}>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Flagged</option>
                  <option>Rejected</option>
                  <option>Removed</option>
                </select>
              </div>
            ))}
          </section>
          <section className="right-card audit-card">
            <SectionHeading title="Recent moderation" />
            <div className="audit-item"><span className="audit-dot audit-green" /><div><b>Resolved: pathway lighting report</b><small>Moderator team · Today, 9:06 am</small></div></div>
            <div className="audit-item"><span className="audit-dot audit-blue" /><div><b>Verified: new university profile</b><small>Moderator team · Yesterday, 3:12 pm</small></div></div>
            <div className="audit-item"><span className="audit-dot audit-amber" /><div><b>Flagged: duplicate accommodation listing</b><small>Moderator team · Oct 31, 11:28 am</small></div></div>
            <button className="right-card-link" onClick={() => toast('Moderation audit log synchronized.')}>View moderation history <ArrowRight size={13} /></button>
          </section>
        </div>
        <div className="admin-links">
          {['User accounts', 'Posts & comments', 'Issue reports', 'Business listings', 'Blog submissions', 'Opportunities', 'Events', 'User reports', 'Verification requests'].map((item) => (
            <button key={item} onClick={() => toast(`${item}: moderation tools connected.`)}>{item}<ArrowUpRight size={13} /></button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1>{titleMap[pathname] || 'KyU Community'}</h1>
      <p>Find the latest from your university community.</p>
    </div>
  );
}

function SettingRow({ title, detail, active, onToggle }: { title: string; detail: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="setting-row">
      <div>
        <b>{title}</b>
        <p>{detail}</p>
      </div>
      <button className={`setting-switch${active ? ' switch-on' : ''}`} role="switch" aria-checked={active} onClick={onToggle}>
        <span />
      </button>
    </div>
  );
}

function SparkleIcon() {
  return <span className="explore-sparkle"><Star size={17} /></span>;
}
