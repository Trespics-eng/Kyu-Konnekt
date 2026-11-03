import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BadgeCheck, Clock3, MapPin, MessageCircle, Plus, Search, Share2, ShoppingBag, SlidersHorizontal, Tag, UsersRound } from 'lucide-react';
import type { Business } from '../data/mockData';
import type { SharedContext } from '../components/AppShell';
import { readImagePreview, useLocalStorageState } from '../lib/storage';
import { Badge, Button, EmptyState, Modal, SectionHeading } from '../components/ui';
import {
  getBusinessesApi,
  getBusinessByIdApi,
  createBusinessApi,
  toggleSaveBusinessApi,
} from '../lib/api';
import './MarketplacePage.css';

const categories = ['All categories', 'Food & Restaurants', 'Clothing & Fashion', 'Beauty & Cosmetics', 'Electronics', 'Photography', 'Graphic Design', 'Technology Services', 'Printing & Cyber', 'Hair & Beauty Services', 'Transport', 'Accommodation', 'Freelancing', 'Other Services'];

export default function MarketplacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useOutletContext<SharedContext>();
  const [items, setItems] = useState<Business[]>([]);
  const [category, setCategory] = useState('All categories');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Recommended');
  const [studentsOnly, setStudentsOnly] = useState(false);
  const [savedBusinesses, setSavedBusinesses] = useLocalStorageState<string[]>('saved-businesses', []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [products, setProducts] = useState('');
  const [businessCategory, setBusinessCategory] = useState(categories[1]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [hours, setHours] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<Business | null>(null);

  // Fetch businesses list from backend
  useEffect(() => {
    let ignore = false;
    getBusinessesApi({
      category: category === 'All categories' ? undefined : category,
      studentOnly: studentsOnly || undefined,
      sort: sort === 'Name A–Z' ? 'Name A–Z' : undefined,
      search: search || undefined,
    }).then((res) => {
      if (!ignore && res.data && Array.isArray(res.data)) {
        setItems(res.data);
      }
    }).catch(() => {});

    return () => { ignore = true; };
  }, [category, studentsOnly, sort, search, setItems]);

  // Fetch single business detail if on route /business/:id
  useEffect(() => {
    if (!id) {
      setSelectedDetail(null);
      return;
    }
    let ignore = false;
    getBusinessByIdApi(id).then((res) => {
      if (!ignore && res.data) {
        setSelectedDetail(res.data);
      }
    }).catch(() => {});

    return () => { ignore = true; };
  }, [id]);

  const selected = selectedDetail || items.find((item) => item.id === id);

  const filtered = useMemo(() => {
    const found = items.filter((item) =>
      (category === 'All categories' || item.category === category) &&
      (!studentsOnly || item.student) &&
      `${item.name} ${item.category} ${item.location} ${item.description}`.toLowerCase().includes(search.toLowerCase())
    );
    return sort === 'Name A–Z' ? [...found].sort((a, b) => a.name.localeCompare(b.name)) : found;
  }, [items, category, studentsOnly, search, sort]);

  const chooseImage = async (file?: File) => {
    if (!file) return;
    try {
      setImage(await readImagePreview(file));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read image.');
    }
  };

  const resetForm = () => {
    setOpen(false);
    setName('');
    setProducts('');
    setLocation('');
    setDescription('');
    setPhone('');
    setPrice('');
    setWhatsapp('');
    setHours('');
    setImage('');
    setError('');
  };

  const submit = async () => {
    if (!name.trim() || !location.trim() || !description.trim() || !phone.trim()) {
      setError('Add a name, location, description and contact number.');
      return;
    }

    const listing: Business = {
      id: `b-${Date.now()}`,
      name: name.trim(),
      category: businessCategory,
      location: location.trim(),
      description: description.trim(),
      price: price || 'Contact for pricing',
      image: image || '/assets/kenyan-enterprise.jpg',
      initials: name.trim().split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase(),
      student: true,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      hours: hours.trim(),
      products: products.split(',').map((item) => item.trim()).filter(Boolean),
    };

    setItems((current) => [listing, ...current]);
    toast('Your business listing was added to the free directory.');
    resetForm();

    try {
      await createBusinessApi({
        name: name.trim(),
        category: businessCategory,
        location: location.trim(),
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        price: price || 'Contact for pricing',
        hours: hours.trim() || undefined,
        image: image || undefined,
        products: products.split(',').map((item) => item.trim()).filter(Boolean),
        student: true,
      });
    } catch {
      // Handled locally
    }
  };

  const toggleSave = async (business: Business) => {
    const already = savedBusinesses.includes(business.id);
    setSavedBusinesses((current) => already ? current.filter((x) => x !== business.id) : [...current, business.id]);
    toast(already ? 'Business removed from saved list.' : `${business.name} saved to your directory list.`);

    try {
      await toggleSaveBusinessApi(business.id);
    } catch {
      // Handled locally
    }
  };

  const share = async (business: Business) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/business/${business.id}`);
      toast('Business link copied.');
    } catch {
      toast(`${business.name} listing is ready to share.`);
    }
  };

  if (id && selected) {
    return (
      <div className="page-content section-page business-detail-page">
        <button className="back-link" onClick={() => navigate('/marketplace')}>
          <ArrowLeft size={16} /> Back to Marketplace
        </button>
        <div className="business-detail-hero">
          <img src={selected.image} alt={selected.name} />
          <div className="business-detail-copy">
            <div className="page-kicker"><ShoppingBag size={15} /> KYU MARKETPLACE</div>
            <h1>{selected.name}</h1>
            <div className="business-detail-meta">
              <Badge tone="blue">{selected.category}</Badge>
              {selected.verified && <span className="verified-label"><BadgeCheck size={13} /> Verified listing</span>}
              {selected.student && <Badge tone="teal">Student-owned</Badge>}
            </div>
            <p>{selected.description}</p>
            <div className="business-facts">
              <span><MapPin size={15} /> {selected.location}</span>
              <span><Tag size={15} /> {selected.price}</span>
            </div>
            <div className="business-contact-actions">
              <a className="button button-primary" href={`tel:${selected.phone}`}><MessageCircle size={16} /> Contact owner</a>
              <a className="button button-secondary" href={`https://wa.me/${(selected.whatsapp || selected.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
              <button className="button button-ghost" onClick={() => void share(selected)}><Share2 size={16} /> Share</button>
            </div>
            <small className="prototype-note">Contact actions open your device’s phone or messaging app.</small>
          </div>
        </div>
        <div className="detail-columns">
          <section className="right-card">
            <h2>Products & services</h2>
            <p>{selected.description}</p>
            <div className="product-placeholder">
              <ShoppingBag size={19} />
              <span>{selected.products?.length ? selected.products.join(' · ') : 'Contact the business for current availability and prices.'}</span>
            </div>
          </section>
          <section className="right-card">
            <h2>About this business</h2>
            <p>Supporting community-owned businesses helps local ideas grow. Listing details are shared by the business owner.</p>
            <div className="hours-line"><Clock3 size={15} /> {selected.hours || 'Contact to confirm operating hours'}</div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content section-page marketplace-page">
      <div className="marketplace-hero">
        <div>
          <div className="page-kicker"><span className="kicker-icon kicker-market"><ShoppingBag size={16} /></span><span>THE KYU DIRECTORY</span></div>
          <h1>Good things grow <em>locally.</em></h1>
          <p>Find the people, services and ideas powering our community.</p>
          <div className="market-stat-row">
            <span><UsersRound size={15} /> <b>{items.length + 48}</b> local businesses</span>
            <span className="stat-dot">·</span>
            <span><BadgeCheck size={15} /> Free to list, always</span>
          </div>
        </div>
        <div className="market-hero-art">
          <img src="/assets/kenyan-enterprise.jpg" alt="Local entrepreneur in a Kenyan small business" />
          <span className="market-art-sticker"><span>Made<br />near KyU</span><SparklesDot /></span>
        </div>
      </div>

      <div className="market-section-heading">
        <SectionHeading title="Find your next favourite" action={<Button variant="secondary" onClick={() => setOpen(true)}><Plus size={16} /> Add your business</Button>} />
        <p>Discover trusted services from campus to Kerugoya town.</p>
      </div>

      <div className="student-feature">
        <div className="student-feature-icon"><UsersRound size={18} /></div>
        <div>
          <span className="student-feature-eyebrow">COMMUNITY SPOTLIGHT</span>
          <strong>Student Entrepreneurs</strong>
          <p>Support ideas growing right here on campus.</p>
        </div>
        <button className={`spotlight-toggle${studentsOnly ? ' spotlit' : ''}`} onClick={() => setStudentsOnly(!studentsOnly)}>
          {studentsOnly ? 'Showing student businesses' : 'Explore student businesses'} <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="market-controls">
        <div className="market-search">
          <Search size={16} />
          <input placeholder="Search shops, services, or a place..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <span>{filtered.length} found</span>
        </div>
        <div className="market-filter-row">
          <div className="category-pills">
            {categories.slice(0, 6).map((item) => (
              <button key={item} className={category === item ? 'category-pill-active' : ''} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
            <select aria-label="More categories" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All categories">More categories</option>
              {categories.slice(6).map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <label className="sort-control">
            <SlidersHorizontal size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Recommended</option>
              <option>Name A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length ? (
        <div className="business-grid">
          {filtered.map((business, index) => (
            <article className="business-card" key={business.id}>
              <div className="business-image-wrap">
                <button className="business-image-open" aria-label={`View ${business.name}`} onClick={() => navigate(`/business/${business.id}`)}>
                  <img src={business.image} alt={business.name} />
                  <span className={`business-image-tag${index === 0 ? ' tag-featured' : ''}`}>
                    {index === 0 ? 'COMMUNITY PICK' : business.student ? 'STUDENT-OWNED' : business.category.toUpperCase()}
                  </span>
                </button>
                <button
                  className={`business-save${savedBusinesses.includes(business.id) ? ' business-saved' : ''}`}
                  aria-label={savedBusinesses.includes(business.id) ? 'Remove saved business' : 'Save business'}
                  onClick={() => toggleSave(business)}
                >
                  <ShoppingBag size={15} />
                </button>
              </div>
              <div className="business-card-body">
                <div className="business-card-title">
                  <div>
                    <h3>{business.name}</h3>
                    {business.verified && <BadgeCheck size={14} className="verified-icon" />}
                  </div>
                  {business.student && <span className="student-mini">Student</span>}
                </div>
                <div className="business-card-category">{business.category}<span>·</span><MapPin size={12} /> {business.location}</div>
                <p>{business.description}</p>
                <div className="business-card-foot">
                  <b>{business.price}</b>
                  <Button variant="secondary" onClick={() => navigate(`/business/${business.id}`)}>View business <ArrowUpRight size={14} /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No businesses found" detail="Adjust the filters or add a business to the KyU directory." action={<Button onClick={() => setOpen(true)}><Plus size={15} /> Add a business</Button>} />
      )}

      <div className="market-join-banner">
        <div className="join-banner-icon"><ShoppingBag size={20} /></div>
        <div>
          <strong>Your idea belongs here.</strong>
          <p>Share your business with students and neighbours—free, with no paid placements.</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)}>Create a free listing <ArrowUpRight size={15} /></Button>
      </div>

      {open && (
        <Modal title="Add your business" subtitle="Create a free listing for the KyU community." onClose={resetForm} wide>
          <div className="form-grid">
            <label className="form-field">
              <span>Business name <i>*</i></span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maua Bites" />
            </label>
            <label className="form-field">
              <span>Category <i>*</i></span>
              <select value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)}>
                {categories.slice(1).map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Location <i>*</i></span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Near main gate, Kerugoya..." />
            </label>
            <label className="form-field">
              <span>Contact phone <i>*</i></span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7..." />
            </label>
            <label className="form-field">
              <span>WhatsApp (optional)</span>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+254 7..." />
            </label>
            <label className="form-field">
              <span>Starting price</span>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. From KES 250" />
            </label>
            <label className="form-field span-two">
              <span>Business description <i>*</i></span>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you offer?" />
            </label>
            <label className="form-field">
              <span>Operating hours</span>
              <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Weekdays, 8 am–6 pm" />
            </label>
            <label className="form-field">
              <span>Products & services</span>
              <input value={products} onChange={(e) => setProducts(e.target.value)} placeholder="Separate items with commas" />
            </label>
            <label className="form-field span-two">
              <span>Business photo / logo</span>
              <label className="file-drop">
                <Plus size={15} /> Choose an image
                <input type="file" accept="image/*" onChange={(e) => void chooseImage(e.target.files?.[0])} hidden />
              </label>
              {image && <img className="form-image-preview" src={image} alt="Business preview" />}
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <span className="muted-small">All community business listings are free.</span>
            <Button onClick={submit}>Publish free listing <ArrowUpRight size={15} /></Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SparklesDot() {
  return <span className="sparkles-dot">✳</span>;
}
