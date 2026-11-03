import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, UsersRound } from 'lucide-react';
import { readImagePreview, readStore } from '../lib/storage';
import { loginApi, registerApi, forgotPasswordApi, updateMeApi } from '../lib/api';
import type { MemberProfile } from '../data/mockData';
import { defaultProfile } from '../data/mockData';
import { Avatar, BrandMark, Button } from '../components/ui';
import './AuthPage.css';

const categories = ['Student', 'Lecturer', 'University Staff', 'Business Owner', 'Community Member', 'Organisation'];

export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signup = pathname === '/signup';
  const forgot = pathname === '/forgot-password';
  const setup = pathname === '/profile-setup';
  const storedProfile = readStore<MemberProfile>('profile', defaultProfile);

  const [name, setName] = useState(() => setup ? storedProfile.name : '');
  const [email, setEmail] = useState(() => setup ? storedProfile.email || '' : '');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState(() => setup ? storedProfile.category || storedProfile.role.split(' · ')[0] : 'Student');
  const [school, setSchool] = useState(() => setup ? storedProfile.school || storedProfile.department || '' : '');
  const [course, setCourse] = useState(() => setup ? storedProfile.course || '' : '');
  const [year, setYear] = useState(() => setup ? storedProfile.year || '' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(() => setup ? storedProfile.image || '' : '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const title = forgot ? 'Reset your password' : setup ? 'Set up your profile' : signup ? 'Make your place' : 'Welcome back';
  const subtitle = forgot ? 'We’ll send a reset link to the email you use for KyU Community.' : setup ? 'Add a few details so your community can get to know you.' : signup ? 'Connect with the people and ideas around KyU.' : 'Your community is just a sign-in away.';

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (forgot) {
        await forgotPasswordApi(email.trim());
        setSuccess('If an account matches this address, password reset instructions have been sent.');
        setLoading(false);
        return;
      }

      if (signup && !name.trim()) {
        setError('Add your full name to continue.');
        setLoading(false);
        return;
      }

      if (!forgot && !setup && password.length < 8) {
        setError('Use a password with at least 8 characters.');
        setLoading(false);
        return;
      }

      if (signup) {
        const res = await registerApi({
          email: email.trim(),
          password,
          name: name.trim(),
          category,
          school: school.trim() || undefined,
          department: school.trim() || undefined,
          course: course.trim() || undefined,
          year: year || undefined,
          avatar_url: image || undefined,
        });

        if (res.data?.session?.access_token) {
          localStorage.setItem('kyu:auth_token', res.data.session.access_token);
        }
        if (res.data?.profile) {
          localStorage.setItem('kyu:profile', JSON.stringify(res.data.profile));
        }

        setSuccess('Account created! Welcome to KyU Community.');
        setTimeout(() => navigate('/'), 600);
      } else if (setup) {
        if (!name.trim()) {
          setError('Add your full name to continue.');
          setLoading(false);
          return;
        }

        const res = await updateMeApi({
          name: name.trim(),
          category,
          school: school.trim() || undefined,
          department: school.trim() || undefined,
          course: course.trim() || undefined,
          year: year || undefined,
          avatar_url: image || undefined,
        });

        if (res.data) {
          localStorage.setItem('kyu:profile', JSON.stringify(res.data));
        }

        setSuccess('Profile updated successfully.');
        setTimeout(() => navigate('/'), 600);
      } else {
        // Login
        const res = await loginApi({ email: email.trim(), password });
        if (res.data?.session?.access_token) {
          localStorage.setItem('kyu:auth_token', res.data.session.access_token);
        }
        if (res.data?.profile) {
          localStorage.setItem('kyu:profile', JSON.stringify(res.data.profile));
        }

        setSuccess('Signed in successfully.');
        setTimeout(() => navigate('/'), 600);
      }
    } catch (err: any) {
      // Fallback for offline or local preview if backend is unreachable
      if (err.message && !err.message.includes('Could not reach')) {
        setError(err.message);
      } else {
        // Fallback to local session if server is offline
        const fullName = name.trim() || storedProfile.name;
        const updated: MemberProfile = {
          ...storedProfile,
          id: 'me',
          name: fullName,
          initials: fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
          role: `${category}${course.trim() ? ` · ${course.trim()}` : ''}`,
          category,
          department: school.trim() || storedProfile.department,
          school: school.trim() || storedProfile.school,
          course: course.trim() || storedProfile.course,
          year: year || storedProfile.year,
          email: email.trim() || storedProfile.email,
          image: image || storedProfile.image,
        };
        localStorage.setItem('kyu:profile', JSON.stringify(updated));
        setSuccess('Local session established. Welcome to KyU Community.');
        setTimeout(() => navigate('/'), 600);
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (file?: File) => {
    if (!file) return;
    try {
      setImage(await readImagePreview(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read image.');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link className="brand-lockup auth-brand-lockup" to="/">
            <BrandMark />
            <span className="brand-copy">
              <strong>KyU Community</strong>
              <small>Connecting People. Sharing Ideas. Solving Problems.</small>
            </span>
          </Link>
          <div className="auth-brand-message">
            <BadgeLine />
            <h1>A place where <em>community</em> comes first.</h1>
            <p>Share ideas, find your people and help solve the things that matter around KyU.</p>
            <div className="auth-community-proof">
              <span className="auth-avatar-stack">
                <Avatar name="Faith" initials="FN" color="#eadcf3" size="sm" />
                <Avatar name="James" initials="JM" color="#f3dfca" size="sm" />
                <Avatar name="Brian" initials="BG" color="#d9e6f4" size="sm" />
              </span>
              <span><b>One community, many voices.</b><small>Students · Lecturers · Neighbours</small></span>
            </div>
          </div>
          <img className="auth-panel-image" src="/assets/kyu-community.jpg" alt="Members of a university community sharing ideas" />
        </div>
        <span className="auth-panel-footer">Kirinyaga University & the community around it</span>
      </section>

      <section className="auth-form-panel">
        <Link to="/" className="auth-back-link"><ArrowLeft size={15} /> Back to KyU Community</Link>
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <span className="auth-step-label">{forgot ? 'ACCOUNT RECOVERY' : setup ? 'PROFILE SETUP' : signup ? 'JOIN THE COMMUNITY' : 'MEMBER SIGN IN'}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {(signup || setup) && (
              <>
                <label className="form-field">
                  <span>Full name <i>*</i></span>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wanjiku Mwangi" />
                </label>
                <label className="form-field">
                  <span>Community role <i>*</i></span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </label>
                {['Student', 'Lecturer', 'University Staff'].includes(category) && (
                  <>
                    <label className="form-field">
                      <span>School or department</span>
                      <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Pure and Applied Sciences" />
                    </label>
                    <div className="form-grid">
                      <label className="form-field">
                        <span>Course (optional)</span>
                        <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Computer Science" />
                      </label>
                      <label className="form-field">
                        <span>Year of study</span>
                        <select value={year} onChange={(e) => setYear(e.target.value)}>
                          <option value="">Select year</option>
                          {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+'].map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </label>
                    </div>
                  </>
                )}
                <label className="form-field">
                  <span>Profile photo (optional)</span>
                  <label className="auth-photo-picker">
                    {image ? <Avatar name={name || 'You'} initials={name.split(' ').map((x) => x[0]).join('')} size="sm" image={image} /> : <span className="photo-picker-plus">+</span>}
                    <span>{image ? 'Photo added' : 'Choose a photo'}</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => void pickImage(e.target.files?.[0])} />
                  </label>
                </label>
              </>
            )}

            <label className="form-field">
              <span>Email address <i>*</i></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </label>

            {!forgot && !setup && (
              <label className="form-field">
                <span>Password <i>*</i></span>
                <div className="password-field">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={signup ? 'new-password' : 'current-password'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}

            {!signup && !forgot && !setup && (
              <div className="auth-form-options">
                <label><input type="checkbox" /> <span>Remember me</span></label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p className="auth-success"><Check size={15} /> {success}</p>}

            <Button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : forgot ? 'Send reset instructions' : setup ? 'Save profile' : signup ? 'Create free account' : 'Log in'} <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth-switch">
            {signup ? <>Already part of KyU Community? <Link to="/login">Log in</Link></> : forgot ? <>Remembered your password? <Link to="/login">Back to login</Link></> : setup ? <>You can update these details later in <Link to="/settings">settings</Link>.</> : <>New to KyU Community? <Link to="/signup">Create a free account</Link></>}
          </div>
        </div>
      </section>
    </main>
  );
}

function BadgeLine() {
  return <span className="auth-community-label"><UsersRound size={14} /> YOUR CAMPUS. YOUR COMMUNITY.</span>;
}
