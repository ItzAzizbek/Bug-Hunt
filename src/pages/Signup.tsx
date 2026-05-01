import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Signup() {
  const [isHunter, setIsHunter] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setError('Необходимо согласиться с условиями использования');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Prepare user data for Firestore
      const userData = isHunter ? {
        role: 'hunter',
        firstName,
        username,
        email: user.email,
        createdAt: new Date().toISOString(),
        stats: {
          vulnerabilitiesFound: 0,
          earned: 0
        }
      } : {
        role: 'company',
        companyName,
        email: user.email,
        createdAt: new Date().toISOString()
      };

      // Save additional details in Firestore under 'users' collection
      await setDoc(doc(db, 'users', user.uid), userData);

      // Redirect after successful signup (e.g. to a dashboard)
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Signup error:", err);
      // Basic Firebase Error translation
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот Email уже зарегистрирован.');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль слишком слабый. Минимум 6 символов.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Некорректный Email адрес.');
      } else {
        setError(err.message || 'Произошла ошибка при регистрации. Проверьте данные и попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-primary-200 selection:text-primary-900 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-full lg:max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src="/icon.svg" alt="Bug Hunt" className="w-[3.75rem] h-[3.75rem]" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Bug Hunt</span>
          </Link>

          <h2 className="mt-8 text-3xl font-extrabold text-slate-900">Создайте аккаунт</h2>
          <p className="mt-2 text-sm text-slate-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Войти
            </Link>
          </p>

          <div className="mt-8">
            <div className="flex p-1 bg-slate-200/50 rounded-xl mb-8 relative">
              <div 
                className="absolute inset-y-1 left-1 bg-white shadow-sm rounded-lg transition-transform duration-300 ease-in-out" 
                style={{ 
                  width: 'calc(50% - 4px)', 
                  transform: isHunter ? 'translateX(0)' : 'translateX(100%)' 
                }}
              />
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${
                  isHunter ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setIsHunter(true)}
              >
                Хантер
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${
                  !isHunter ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setIsHunter(false)}
              >
                Компания
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              {isHunter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                      Имя
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
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
                        name="username"
                        type="text"
                        required
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
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Пароль
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Я согласен с{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Условиями использования
                  </a>{' '}
                  и{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Политикой конфиденциальности
                  </a>
                </label>
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
                    "Зарегистрироваться"
                  )}
                </button>
              </div>
            </form>

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
          <h3 className="text-3xl font-bold mb-4">Безопасность начинается здесь</h3>
          <p className="text-slate-300 text-lg max-w-xl">
            Платформа объединяет лучших специалистов по кибербезопасности и ведущие компании для защиты цифрового будущего Узбекистана.
          </p>
        </div>
      </div>
    </div>
  );
}
