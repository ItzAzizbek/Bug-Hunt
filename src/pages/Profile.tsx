import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Mail,
  User as UserIcon,
  Building2,
  Calendar,
  Bug,
  DollarSign,
  Trophy,
  Shield,
  Save,
  Check,
} from 'lucide-react';

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ ...data, email: user.email, uid: user.uid });
            setFirstName(data.firstName || '');
            setUsername(data.username || '');
            setCompanyName(data.companyName || '');
            setPhotoURL(data.photoURL || '');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid) return;
    setSaving(true);
    setError(null);
    try {
      const updates =
        userData.role === 'hunter'
          ? { firstName, username, photoURL }
          : { companyName, photoURL };
      await updateDoc(doc(db, 'users', userData.uid), updates);
      setUserData((prev: any) => ({ ...prev, ...updates }));
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setPhotoURL(newAvatar);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  const isHunter = userData?.role === 'hunter';
  const displayName = isHunter
    ? userData?.firstName || userData?.username || 'Хантер'
    : userData?.companyName || 'Компания';
  const initials = (displayName as string)
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const createdAt = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в дашборд
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="Bug Hunt" className="w-12 h-12" />
            <span className="font-bold text-slate-900 tracking-tight">Bug Hunt</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Профиль</h1>

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initials || <UserIcon className="w-8 h-8" />
                )}
              </div>
              <button
                onClick={generateAvatar}
                className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-200 transition-all opacity-0 group-hover:opacity-100"
                title="Сгенерировать аватар"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                </div>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{displayName}</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {userData?.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isHunter
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {isHunter ? <Bug className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                  {isHunter ? 'Хантер' : 'Компания'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Calendar className="w-3.5 h-3.5" /> С нами с {createdAt}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>

        {/* Stats (hunter only) */}
        {isHunter && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bug className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Уязвимостей</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {userData?.stats?.vulnerabilitiesFound || 0}
                </h3>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Заработано (UZS)</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {userData?.stats?.earned || 0}
                </h3>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Рейтинг</p>
                <h3 className="text-lg font-bold text-slate-900">Новичок</h3>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Личная информация</h3>
            <p className="text-sm text-slate-500 mt-1">
              Обновите данные своего профиля.
            </p>
          </div>
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-slate-700">
                URL фото профиля
              </label>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="photoURL"
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateAvatar}
                  className="px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Случайный
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">
                Используйте прямую ссылку на изображение или нажмите «Случайный» для генерации аватара через DiceBear.
              </p>
            </div>

            {isHunter ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                    Имя
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                      placeholder="Азиз"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Никнейм
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-lg font-medium select-none">@</span>
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                      placeholder="bughunter99"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                  Название компании
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    placeholder='ООО "Супер Тех"'
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl sm:text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium min-h-[1.25rem]">
                {savedAt && (
                  <>
                    <Check className="w-4 h-4" /> Изменения сохранены
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Сохранить
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security placeholder */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 mt-8 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Безопасность</h3>
            <p className="text-sm text-slate-500 mt-1">
              Управление паролем и двухфакторной аутентификацией будет доступно в ближайшем обновлении.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
