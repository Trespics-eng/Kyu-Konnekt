import { ArrowUpRight, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { readImagePreview } from '../lib/storage';
import { Modal, Button } from './ui';
import './ListingModal.css';

type Props = {
  pathname: string; open: boolean; title: string; category: string; place: string; detail: string; date: string; time: string; rooms: string; price: string; contact: string; externalLink: string; error: string;
  onTitle: (value: string) => void; onCategory: (value: string) => void; onPlace: (value: string) => void; onDetail: (value: string) => void; onDate: (value: string) => void; onTime: (value: string) => void; onRooms: (value: string) => void; onPrice: (value: string) => void; onContact: (value: string) => void; onExternalLink: (value: string) => void; onError: (value: string) => void; onClose: () => void; onSubmit: (image?: string) => void;
};

export default function ListingModal(props: Props) {
  const [image, setImage] = useState('');
  const isEvent = props.pathname === '/events';
  const isOpportunity = props.pathname === '/opportunities';
  const isStay = props.pathname === '/accommodation';
  const isLost = props.pathname === '/lost-found';
  useEffect(() => { if (!props.open) setImage(''); }, [props.open]);
  if (!props.open) return null;
  const heading = isEvent ? 'Create a community event' : isOpportunity ? 'Share an opportunity' : isStay ? 'List accommodation' : 'Post a lost or found item';
  const subtitle = isEvent ? 'Add the details people need to take part.' : isOpportunity ? 'Help the KyU community find their next step.' : isStay ? 'Share a place near campus with the community.' : 'Help a belonging find its way back to its owner.';
  const categories = isEvent ? ['Academic Events', 'Student Activities', 'Workshops', 'Sports', 'Entertainment', 'Career Events', 'Business Events', 'Community Events'] : isOpportunity ? ['Internships', 'Industrial Attachment', 'Part-time Jobs', 'Full-time Jobs', 'Scholarships', 'Competitions', 'Volunteer Opportunities', 'Training Programmes', 'Entrepreneurship Opportunities'] : isStay ? ['Hostel', 'Bedsitter', 'Shared house', 'Apartment', 'Other'] : ['Lost', 'Found'];
  const choosePhoto = async (file?: File) => { if (!file) return; try { setImage(await readImagePreview(file)); props.onError(''); } catch (error) { props.onError(error instanceof Error ? error.message : 'Could not read this photo.'); } };
  return <Modal title={heading} subtitle={subtitle} onClose={props.onClose} wide>
    <div className="form-grid">
      <label className="form-field span-two"><span>{isEvent ? 'Event title' : isOpportunity ? 'Opportunity title' : isStay ? 'Property name' : 'Item name'} <i>*</i></span><input value={props.title} onChange={(event) => { props.onTitle(event.target.value); props.onError(''); }} placeholder={isEvent ? 'e.g. Community innovation day' : isOpportunity ? 'e.g. Graduate software internship' : isStay ? 'e.g. Greenview Student Hostels' : 'Describe the item briefly'} /></label>
      <label className="form-field"><span>{isLost ? 'Status' : 'Category'}</span><select value={props.category || categories[0]} onChange={(event) => props.onCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="form-field"><span>{isStay ? 'Property location' : isLost ? 'Approximate location' : 'Location / venue'} <i>*</i></span><input value={props.place} onChange={(event) => { props.onPlace(event.target.value); props.onError(''); }} placeholder="Campus, Kerugoya or a nearby landmark" /></label>
      {isOpportunity && <><label className="form-field"><span>Organisation</span><input value={props.contact} onChange={(event) => props.onContact(event.target.value)} placeholder="Hiring organisation" /></label><label className="form-field"><span>Application link (optional)</span><input type="url" value={props.externalLink} onChange={(event) => props.onExternalLink(event.target.value)} placeholder="https://..." /></label></>}
      {isEvent && <><label className="form-field"><span>Organiser</span><input value={props.contact} onChange={(event) => props.onContact(event.target.value)} placeholder="Event organiser" /></label><label className="form-field"><span>Registration / contact link</span><input value={props.externalLink} onChange={(event) => props.onExternalLink(event.target.value)} placeholder="Link, email or phone" /></label></>}
      {isStay && <><label className="form-field"><span>Monthly rent (KES)</span><input type="number" min="0" value={props.price} onChange={(event) => props.onPrice(event.target.value)} placeholder="e.g. 6500" /></label><label className="form-field"><span>Available rooms</span><input type="number" min="1" value={props.rooms} onChange={(event) => props.onRooms(event.target.value)} placeholder="1" /></label><label className="form-field"><span>Contact information</span><input value={props.contact} onChange={(event) => props.onContact(event.target.value)} placeholder="Phone or WhatsApp" /></label></>}
      {(isEvent || isOpportunity || isLost) && <label className="form-field"><span>{isEvent ? 'Event date' : isOpportunity ? 'Application deadline' : 'Date observed'}</span><input type="date" value={props.date} onChange={(event) => props.onDate(event.target.value)} /></label>}
      {isEvent && <label className="form-field"><span>Event time</span><input type="time" value={props.time} onChange={(event) => props.onTime(event.target.value)} /></label>}
      <label className="form-field span-two"><span>{isOpportunity ? 'Description, requirements and application instructions' : isStay ? 'Facilities and details' : isLost ? 'Description' : 'Event description'} <i>*</i></span><textarea rows={4} value={props.detail} onChange={(event) => { props.onDetail(event.target.value); props.onError(''); }} placeholder={isStay ? 'List facilities, rooms available and viewing information.' : isLost ? 'Share a brief description. Keep unique identifying details private.' : isOpportunity ? 'Describe the role, requirements and how to apply.' : 'Share what people should know.'} /></label>
      {(isEvent || isStay || isLost) && <label className="form-field span-two"><span>{isEvent ? 'Event photo (optional)' : isStay ? 'Property photo (optional)' : 'Item photo (optional)'}</span><label className="file-drop"><Plus size={15} /> Choose a photo (up to 2 MB)<input type="file" accept="image/*" hidden onChange={(event) => void choosePhoto(event.target.files?.[0])} />{image && <span className="file-added">Photo attached</span>}</label>{image && <img className="form-image-preview" src={image} alt="Listing photo preview" />}</label>}
    </div>
    {props.error && <p className="form-error">{props.error}</p>}
    <div className="modal-actions"><span className="muted-small">Prototype listing · please verify important details independently.</span><Button variant="secondary" onClick={props.onClose}><X size={14} /> Cancel</Button><Button onClick={() => props.onSubmit(image || undefined)}>{isLost ? 'Post item' : isEvent ? 'Publish event' : isOpportunity ? 'Submit opportunity' : 'Publish listing'} <ArrowUpRight size={14} /></Button></div>
  </Modal>;
}
