import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, User as UserIcon, Plus } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface RememberedAccount {
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  lastLogin: number;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>([]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('remembered_accounts');
    if (saved) {
      const parsed = JSON.parse(saved) as RememberedAccount[];
      setRememberedAccounts(parsed.sort((a, b) => b.lastLogin - a.lastLogin));
      // If there are accounts, hide form by default
      if (parsed.length > 0) {
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    } else {
      setShowForm(true);
    }
  }, []);

  const saveAccount = async (userEmail: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        const account: RememberedAccount = {
          email: userEmail,
          displayName: data.role === 'company' ? data.companyName : (data.username || data.firstName || userEmail),
          photoURL: data.photoURL || '',
          role: data.role,
          lastLogin: Date.now(),
        };

        const current = JSON.parse(localStorage.getItem('remembered_accounts') || '[]');
        const filtered = current.filter((a: RememberedAccount) => a.email !== userEmail);
        const updated = [account, ...filtered].slice(0, 5); // Keep last 5
        localStorage.setItem('remembered_accounts', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error saving account:', err);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Update lastLogin in Firestore
      await updateDoc(doc(db, 'users', userCred.user.uid), {
        lastLogin: new Date().toISOString(),
      });

      if (remember) {
        await saveAccount(email);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Некорректный Email адрес.');
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Неверный Email или пароль.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Слишком много попыток входа. Попробуйте позже.');
      } else {
        setError(err.message || 'Произошла ошибка при входе. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (acc: RememberedAccount) => {
    setEmail(acc.email);
    setPassword(''); // Still need password for real auth, but we pre-fill email
    setShowForm(true);
    // Focus password field after a short delay to allow transition
    setTimeout(() => {
      document.getElementById('password')?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-primary-200 selection:text-primary-900 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-full lg:max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src="/icon.svg" alt="Bug Hunt" className="w-[3.75rem] h-[3.75rem]" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Bug Hunt</span>
          </Link>

          <h2 className="mt-8 text-3xl font-extrabold text-slate-900">
            {rememberedAccounts.length > 0 && !showForm ? 'Выберите аккаунт' : 'Войти в аккаунт'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Нет аккаунта?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Зарегистрироваться
            </Link>
          </p>

          <div className="mt-8">
            {!showForm && rememberedAccounts.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {rememberedAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleAccountClick(acc)}
                      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-500 hover:bg-primary-50/30 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors overflow-hidden">
                        {acc.photoURL ? (
                          <img src={acc.photoURL} alt={acc.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{acc.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                        {acc.role === 'hunter' ? 'Хантер' : 'Компания'}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowForm(true);
                    setEmail('');
                    setPassword('');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" /> Добавить другой аккаунт
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email адрес
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Пароль
                    </label>
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      Забыли пароль?
                    </a>
                  </div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-primary-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                      Запомнить меня
                    </label>
                  </div>

                  {rememberedAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                    >
                      Назад к аккаунтам
                    </button>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Загрузка...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> На главную
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-1/2 bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">С возвращением, охотник</h3>
          <p className="text-slate-300 text-lg max-w-xl">
            Войдите, чтобы продолжить поиск уязвимостей и защищать цифровое будущее Узбекистана.
          </p>
        </div>
      </div>
    </div>
  );
}

