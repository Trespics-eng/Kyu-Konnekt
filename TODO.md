# KyU Konnekt — Delivery Outcomes

Items remain open until their behavior is implemented in the project.

## [ ] Responsive application shell, navigation, discovery, and brand

- Build a modern, professional, responsive digital community for students, lecturers, university staff, business owners and residents around Kirinyaga University, Kenya, around “Connecting People. Sharing Ideas. Solving Problems.” Keep basic use free: no subscriptions, premium memberships, payment requirements or paid advertising.
- Use React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, reusable components and React hooks. Use realistic mock data initially, organize for later REST API or Supabase/Firebase integration, and persist appropriate prototype-created content in localStorage.
- Create an accessible top navbar with KyU Konnekt branding, global search and suggestions, notification icon/unread count, messages, avatar, and profile/settings/logout dropdown. Include left navigation for Home, Explore, Community, Report an Issue, Marketplace, Blogs & Stories, Opportunities, Accommodation, Events, Lost & Found, Academic Communities, Messages and Saved Posts, with a prominent Create Post button. The right rail includes trending discussions, topics, upcoming events, featured businesses, announcements and suggested people.
- Desktop uses a three-column dashboard; tablet adapts the sidebars; mobile hides desktop sidebars, uses a compact header and bottom navigation. All forms, cards, modals, images and navigation adapt to smaller screens.
- Use the clean premium visual direction and palette: navy `#17365D`, royal blue `#2563EB`, teal `#14B8A6`, background `#F8FAFC`, white surfaces, charcoal `#1E293B`, secondary grey `#64748B`; subtle shadows, rounded cards, clean borders, generous spacing, restrained smooth transitions and Inter or similar. Avoid copying other platforms, excessive gradients, clutter or oversized components. Use realistic campus, student entrepreneurship and community imagery.
- Use accessible labels, keyboard-friendly controls, sufficient contrast, focus indicators, useful loading and empty states, success/error feedback, form validation, responsive mobile navigation and confirmation dialogs. All visible interactive elements must work; where backend functionality is required, simulate it interactively and structure code for future integration.

## [ ] Authentication, profiles, privacy and settings

- Provide signup, login, forgot-password and profile-setup screens. Signup collects full name, email, password, category (Student, Lecturer, University Staff, Business Owner, Community Member or Organisation), and optional profile photo. University members can indicate school, department, course or year of study where applicable. Show verification status for university-related accounts.
- Profile pages show photo, name, category, biography, school/department where applicable, interests, location, joined date, followers/following, published posts, published articles and business listings where applicable. Allow editing profiles, following/unfollowing people and controlling profile visibility.
- Settings includes edit profile, change password, account privacy, notification preferences, messaging preferences, blocked users, account security, accessibility preferences, community guidelines, terms of service, privacy policy and delete account.
- Simulated authentication and admin controls are frontend prototype behavior only; do not imply client-side role checks or localStorage provide production account security.

## [ ] Home feed and post interactions

- Display the post composer with “What’s happening in the KyU community?” and allow text, image, video, question, announcement and discussion posts.
- Each post displays author photo/name, category or verification badge, timestamp, category, content, attached media, reactions, comment count, share, bookmark and more-actions menu. Users can like, comment, reply, share, save/bookmark and report posts; comments expand on selection.
- Feed filters: All Posts, Latest, Popular, Campus Life, Academics, Community Issues, Business, Opportunities, Events and Blogs. Seed realistic content from Kenyan students, lecturers and community members. Newly created content and suitable interaction state persists after refresh.

## [x] Community Issues reporting and follow-up

- Dedicated Community Issues page, with categories Insecurity and Robbery, Electricity Problems, Water Shortages, Poor Roads, Garbage and Sanitation, Harassment and Discrimination, Internet Connectivity, Accommodation Problems, Transport Challenges, University Facilities and Other Community Concerns.
- Report form collects title, category, detailed description, location, photos/supporting documents, date/time observed, and public or confidential reporting choice, with a submit action. Confidential reports are never exposed in public feeds/lists. Protect sensitive reports and private user information.
- Issue cards show title, category, location, description preview, supporting photos, reporter information only where appropriate, report date, people supporting, comment count and status. Statuses are Submitted, Under Review, Forwarded to Relevant Authority, In Progress, Resolved and Closed.
- Allow users to support an issue, comment, follow updates, share and view issue history. Filter by category, location and status. Include map/list view toggle; a prototype location-oriented map presentation may stand in for live geospatial integration.
- Clearly distinguish ordinary complaints from emergencies and advise users to contact appropriate emergency services directly when immediate danger exists.

## [ ] Marketplace and business directory

- Free business listings for Food and Restaurants, Clothing and Fashion, Beauty and Cosmetics, Electronics, Photography, Graphic Design, Technology Services, Printing and Cyber Services, Hair and Beauty Services, Transport, Accommodation, Freelancing and Other Services.
- Business creation collects business name, logo, description, category, location, contact details, WhatsApp contact, operating hours, products/services, product photos and prices.
- Responsive grid cards show image, name, category, location, short description, price where applicable, verification where applicable and a working View Business action. Provide category filters, search, sorting and featured listings.
- Individual business views expose products, contact to business owners and share. Include a Student Entrepreneurs section. Use local examples and KES. No paid advertising or premium listings.

## [ ] Blogs & Stories

- Editorial section categories: Campus Life, Education, Technology, Entrepreneurship, Personal Experiences, Opinion, Lifestyle, Community, Career Development and Inspiration.
- Writing editor includes title, cover upload, category, tags, rich-text-like editing, preview, save as draft and publish. Discovery cards show cover, title, introduction, author details, publication date, reading time and category.
- Individual article reading pages include reading progress, author profile, comments, likes, sharing and related articles.

## [ ] Opportunities and jobs

- Categories: Internships, Industrial Attachment, Part-time Jobs, Full-time Jobs, Scholarships, Competitions, Volunteer Opportunities, Training Programmes and Entrepreneurship Opportunities.
- Each listing contains title, organisation, description, location, requirements, application deadline, application instructions and external link where applicable. Authorized users and organisations can submit listings. Provide search, category filters and deadline indicators. Label as verified only after appropriate review.

## [ ] Accommodation discovery

- Landlords, hostels and agents can advertise with property name, location, monthly rent, available rooms, accommodation type, facilities, photographs, contact information and availability status.
- Provide filters for price, location, accommodation type and facilities, plus individual accommodation detail views.

## [ ] Events and activities

- Categories: Academic Events, Student Activities, Workshops, Sports, Entertainment, Career Events, Business Events and Community Events.
- Event details include title, image, description, organiser, date, time, venue, registration details and contact information. Allow users to save, indicate attendance interest and share. Provide calendar and list views.

## [ ] Academic Communities

- Include Computer Science, Business and Economics, Agriculture, Education, Engineering, Research and Entrepreneurship communities. Support course discussions, questions and answers, study groups, academic resources, research discussions, lecturer announcements, peer mentorship and resource sharing.
- Users can join and leave communities. Each community has its own feed, members list and discussion categories.

## [ ] Lost & Found

- Users can list lost or found belongings with item name, lost/found status, description, photograph, approximate location, date and contact method. Include search and filters. Do not expose sensitive information such as full identification numbers.

## [ ] Messaging and notifications

- Messaging interface has a conversation list, photos, online status, last-message preview, timestamps, unread indicators, conversation search and a chat view. Support text messaging, image attachments, message notifications, and blocking/reporting controls. Use two-column layout on desktop and responsive single-column layout on mobile.
- Notification center covers likes, comments, replies, new followers, direct messages, issue status updates, marketplace enquiries, event announcements, opportunity updates and important community announcements. Allow users to mark read and clear notifications.

## [ ] Search, exploration, moderation and profile destinations

- Global search supports people, posts, businesses, products/services, blogs, community issues, opportunities, events, accommodation and academic communities. Display categorized results, useful filters and empty states.
- Admin/moderator dashboard contains registered-user, active-user, total-post, reported-issue, resolved-issue, business-listing, published-article, upcoming-event and reported-content metrics. Include management surfaces for user accounts, posts/comments, issue reports, business listings, blog submissions, opportunities, events, user reports and verification requests; allow review, approve, reject, remove or flag actions and show moderation history/audit information. Dashboard is intended for authorized administrators; prototype must clearly label that access is simulated and not secure enforcement.
- Provide operational screens for Explore, Community, Saved Posts, profile, settings and all requested feature destinations. Search, links, buttons, menus, forms, uploads/previews, filtering, comments, joins, saved items and relevant submission/interest actions must produce meaningful behavior rather than dead controls.

## [x] Preview, routing manifest, app identity and maintainable structure

- Serve the complete route declaration in `public/manus-routes.json` at `/manus-routes.json`, synchronized with actual routes and including appropriate dynamic route patterns without invented entity IDs.
- Set Vite development server to listen on `0.0.0.0` at configured port `3000` for managed Preview. Include a production Vite build. Keep persistence and mock data behind typed modules that can later be replaced by an API; do not hardcode secrets or claim the browser simulation provides secure authentication/privacy enforcement.
- Set a quoted actual HTTPS `logoUrl` literal in root `app.config.ts` before checkpointing, while preserving any existing fields.
