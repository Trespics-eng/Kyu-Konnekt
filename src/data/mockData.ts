export type Category = 'Campus Life' | 'Academics' | 'Community Issues' | 'Business' | 'Opportunities' | 'Events' | 'Blogs';
export type User = { id: string; name: string; role: string; department?: string; verified?: boolean; initials: string; color: string; location?: string };
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

export const me: User = { id: 'me', name: 'Wanjiku Mwangi', role: 'Student · Computer Science', department: 'School of Pure and Applied Sciences', verified: true, initials: 'WM', color: '#d6eee8', location: 'Kerugoya, Kenya' };
export const users: User[] = [
  me,
  { id: 'james', name: 'James Muriithi', role: 'Lecturer · Agriculture', department: 'School of Agriculture', verified: true, initials: 'JM', color: '#f3dfca' },
  { id: 'faith', name: 'Faith Njeri', role: 'Student · Business & Economics', verified: true, initials: 'FN', color: '#eadcf3' },
  { id: 'brian', name: 'Brian Gitau', role: 'Student entrepreneur', verified: true, initials: 'BG', color: '#e1e8f7' },
  { id: 'mary', name: 'Mary Wambui', role: 'Community member', initials: 'MW', color: '#f4e4d5', location: 'Kerugoya' },
  { id: 'ian', name: 'Ian Kamau', role: 'Student · Education', verified: true, initials: 'IK', color: '#d9ecef' },
];

export const initialPosts: Post[] = [
  { id: 'p1', author: users[2], createdAt: '12 min ago', category: 'Campus Life', type: 'Discussion', body: 'The campus has such a different energy when everyone brings their ideas to the table. Who’s joining the student innovation meetup this Friday? We’re sharing small projects and big plans.', image: '/assets/kyu-community.jpg', likes: 48, comments: [{ id: 'c1', author: 'Brian Gitau', initials: 'BG', text: 'I’ll be there! Bringing a prototype to share.', time: '8 min ago' }, { id: 'c2', author: 'Ian Kamau', initials: 'IK', text: 'Where will it be held?', time: '5 min ago' }] },
  { id: 'p2', author: users[1], createdAt: '38 min ago', category: 'Academics', type: 'Announcement', body: 'A reminder for Agriculture students: the field practical briefing has moved to 2:30 pm tomorrow at the main lecture theatre. Please come with your lab books and a hat for the field session.', likes: 31, comments: [{ id: 'c3', author: 'Faith Njeri', initials: 'FN', text: 'Thank you for the update, Sir.', time: '20 min ago' }] },
  { id: 'p3', author: users[3], createdAt: '1 hr ago', category: 'Business', type: 'Photo', body: 'Meet a few of the makers and small businesses around campus. We’re building a student-owned directory so it’s easier to find good food, printing and creative services nearby. Share a business we should feature!', image: '/assets/kenyan-enterprise.jpg', likes: 76, comments: [] },
  { id: 'p4', author: users[4], createdAt: '2 hrs ago', category: 'Community Issues', type: 'Question', body: 'Has anyone else noticed the water pressure dropping around Kerugoya town this week? If you’ve been affected, add your area and the time below so we can understand the pattern.', likes: 22, comments: [{ id: 'c4', author: 'Wanjiku Mwangi', initials: 'WM', text: 'Low pressure near the stage since yesterday evening.', time: '34 min ago' }] },
];

export const initialIssues: Issue[] = [
  { id: 'i1', title: 'Street lighting needed along the campus–town footpath', category: 'Electricity Problems', location: 'Kerugoya campus road', description: 'Several lights are out on the footpath students use in the evening. More lighting would make the route safer for everyone walking back to town.', status: 'Forwarded to Relevant Authority', date: 'Today · 9:12 am', support: 64, comments: 18, reporter: 'Faith Njeri', image: '/assets/student-life.jpg' },
  { id: 'i2', title: 'Potholes affecting matatu access near the market', category: 'Poor Roads', location: 'Kerugoya market approach', description: 'The road surface has worsened after the rain and vehicles are struggling to pass. Please review the affected stretch.', status: 'Under Review', date: 'Yesterday', support: 39, comments: 11, reporter: 'Mary Wambui' },
  { id: 'i3', title: 'Low water pressure around the student residences', category: 'Water Shortages', location: 'Campus residences', description: 'Residents report reduced supply in the mornings. A shared timeline could help the relevant team investigate.', status: 'In Progress', date: '2 days ago', support: 87, comments: 26, reporter: 'Ian Kamau' },
];

export const businesses: Business[] = [
  { id: 'b1', name: 'Maua Bites', category: 'Food & Restaurants', location: 'Kerugoya town', description: 'Fresh chapati rolls, samosas and homestyle lunch. Order ahead for campus pickup.', price: 'From KES 120', image: '/assets/kenyan-enterprise.jpg', initials: 'MB', verified: true, student: true, phone: '+254 711 248 390' },
  { id: 'b2', name: 'PrintLab Campus', category: 'Printing & Cyber', location: 'Near main gate', description: 'Affordable printing, binding, scanning and design support for your next submission.', price: 'From KES 5 / page', image: '/assets/campus-study.jpg', initials: 'PC', verified: true, student: true, phone: '+254 720 439 218' },
  { id: 'b3', name: 'Wanjiku Portraits', category: 'Photography', location: 'Kerugoya', description: 'Graduation, portrait and event photography with quick digital delivery.', price: 'Packages from KES 2,000', image: '/assets/student-life.jpg', initials: 'WP', student: true, phone: '+254 701 560 022' },
  { id: 'b4', name: 'Green Basket Farm', category: 'Food & Restaurants', location: 'Kutus road', description: 'Seasonal vegetables and fresh produce from a local family farm.', price: 'From KES 80', image: '/assets/kyu-community.jpg', initials: 'GB', verified: true, phone: '+254 722 340 117' },
];

export const articles: Article[] = [
  { id: 'a1', title: 'Starting small: the student businesses changing campus life', excerpt: 'From a weekend idea to a growing customer list, KyU founders share what helped them take the first step.', category: 'Entrepreneurship', author: 'Faith Njeri', date: 'Oct 28, 2026', read: '5 min read', image: '/assets/kenyan-enterprise.jpg', body: 'Some of the most useful ideas begin by noticing a small problem close to home. Around campus, students are building businesses that meet everyday needs: a meal between lectures, a clear set of printed notes, or a photograph to remember graduation.\n\nThe first lesson is to talk to the people you hope to serve. The next is to test a simple version of the idea, listen carefully and improve it. A supportive community helps founders find their first customers and learn from one another.' },
  { id: 'a2', title: 'Finding your people in the first semester', excerpt: 'A practical guide to making campus feel a little smaller, one community at a time.', category: 'Campus Life', author: 'Ian Kamau', date: 'Oct 25, 2026', read: '4 min read', image: '/assets/campus-study.jpg', body: 'Your first semester comes with new places, people and routines. Start by choosing one community that interests you, whether it is a study group, a sports team or a student society.\n\nAsk one question after class, invite someone to share notes, and give yourself time to find a rhythm that works.' },
  { id: 'a3', title: 'Research can start with the questions we hear every day', excerpt: 'Lecturer James Muriithi on turning community concerns into useful, local research.', category: 'Education', author: 'James Muriithi', date: 'Oct 22, 2026', read: '6 min read', image: '/assets/kyu-community.jpg', body: 'Good research begins with listening. Local questions can lead to practical work when students and mentors document what they observe, compare it with evidence and share results in an accessible way.\n\nCollaboration between academic communities and residents can make that work more useful to the people it affects.' },
];

export const opportunities: Opportunity[] = [
  { title: 'Graduate Software Engineering Intern', org: 'Safaricom PLC', type: 'Internship', location: 'Nairobi / Hybrid', deadline: 'Nov 18, 2026', verified: true, summary: 'Join a product team for a 12-week internship. Applicants should be pursuing a computing degree and have a project portfolio.' },
  { title: 'Kirinyaga County Agricultural Attachment', org: 'County Department of Agriculture', type: 'Industrial Attachment', location: 'Kirinyaga County', deadline: 'Nov 22, 2026', verified: true, summary: 'Attachment placements for students in agriculture, agribusiness and environmental science.' },
  { title: 'Equity Leaders Programme Scholarship', org: 'Equity Group Foundation', type: 'Scholarship', location: 'Kenya', deadline: 'Dec 02, 2026', summary: 'Scholarship and mentorship opportunity for eligible continuing students. Review the official requirements before applying.' },
  { title: 'Community Digital Skills Volunteer', org: 'Kerugoya Youth Hub', type: 'Volunteer Opportunities', location: 'Kerugoya', deadline: 'Nov 14, 2026', summary: 'Help local learners build confidence using essential digital tools during weekly sessions.' },
];

export const events: EventItem[] = [
  { title: 'KyU Innovation & Enterprise Day', category: 'Business Events', date: 'Nov 08, 2026', time: '10:00 am', location: 'Main campus grounds', host: 'KyU Entrepreneurship Club', image: '/assets/kyu-community.jpg' },
  { title: 'Research Methods: Open Seminar', category: 'Academic Events', date: 'Nov 10, 2026', time: '2:00 pm', location: 'Science block, Room 3', host: 'School of Pure and Applied Sciences', image: '/assets/campus-study.jpg' },
  { title: 'Community Clean-up Morning', category: 'Community Events', date: 'Nov 14, 2026', time: '8:30 am', location: 'Kerugoya town centre', host: 'KyU Green Society', image: '/assets/student-life.jpg' },
];

export const stays: Stay[] = [
  { name: 'Greenview Student Hostels', type: 'Hostel', location: 'Near main gate', rent: 6500, rooms: 5, features: ['Wi-Fi', 'Water tank', 'Study area'], image: '/assets/campus-study.jpg' },
  { name: 'Kutus Road Bedsitters', type: 'Bedsitter', location: 'Kutus Road', rent: 8500, rooms: 2, features: ['Secure parking', 'Water', 'Own bathroom'], image: '/assets/student-life.jpg' },
  { name: 'Kerugoya Centre Shared House', type: 'Shared house', location: 'Kerugoya town', rent: 5000, rooms: 3, features: ['Furnished', 'Near matatu stage'], image: '/assets/kyu-community.jpg' },
];

export const lostItems: LostItem[] = [
  { name: 'Blue water bottle', status: 'Found', location: 'Library entrance', date: 'Today', description: 'Found after the afternoon lecture. Owner can describe a sticker on the lid.', initials: 'FN' },
  { name: 'Black laptop sleeve', status: 'Lost', location: 'Science block', date: 'Yesterday', description: 'Last seen in a study room. Please message if you picked it up.', initials: 'BG' },
  { name: 'Key bunch with green tag', status: 'Found', location: 'Main cafeteria', date: 'Oct 30', description: 'A small set of keys. Contact the owner to confirm identifying details.', initials: 'WM' },
];

export const communityGroups = [
  { name: 'Computer Science', members: '1,248', category: 'Study group', description: 'Projects, peer learning and career conversations for computing students.', icon: 'Code2' },
  { name: 'Business & Economics', members: '984', category: 'Academic community', description: 'Explore local enterprise, markets, accounting and economics together.', icon: 'BriefcaseBusiness' },
  { name: 'Agriculture & Food Systems', members: '763', category: 'Academic community', description: 'Connect farm practice with research and a changing climate.', icon: 'Sprout' },
  { name: 'Research Circle', members: '512', category: 'Knowledge sharing', description: 'Methods, opportunities and constructive peer feedback.', icon: 'FlaskConical' },
  { name: 'Entrepreneurship Hub', members: '1,032', category: 'Peer network', description: 'Build, test and support student-owned ventures.', icon: 'Lightbulb' },
  { name: 'Education & Mentorship', members: '687', category: 'Academic community', description: 'Teaching practice, study support and peer mentorship.', icon: 'GraduationCap' },
];

export const conversations = [
  { name: 'Faith Njeri', initials: 'FN', color: '#eadcf3', preview: 'I’ll share the notes from today.', time: '9:42 am', unread: 2, online: true, messages: ['Hi Wanjiku! Are you going to the innovation meetup?', 'Yes, I think so. Do you know the venue?', 'I’ll share the notes from today.'] },
  { name: 'James Muriithi', initials: 'JM', color: '#f3dfca', preview: 'Thank you for the question.', time: 'Yesterday', unread: 0, online: false, messages: ['Good afternoon, I had a question about the practical.', 'Thank you for the question.'] },
  { name: 'Brian Gitau', initials: 'BG', color: '#e1e8f7', preview: 'The prototype is nearly ready!', time: 'Mon', unread: 0, online: true, messages: ['Hey! How is the printing directory coming along?', 'The prototype is nearly ready!'] },
];
