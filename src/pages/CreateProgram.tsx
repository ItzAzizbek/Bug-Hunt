import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  ArrowLeft,
  Loader2,
  Shield,
  FileText,
  Target,
  DollarSign,
  Save,
} from 'lucide-react';

type Severity = 'low' | 'medium' | 'high' | 'critical';

const SEVERITIES: { id: Severity; label: string; placeholder: string }[] = [
  { id: 'low', label: 'Low', placeholder: '500 000' },
  { id: 'medium', label: 'Medium', placeholder: '1 500 000' },
  { id: 'high', label: 'High', placeholder: '5 000 000' },
  { id: 'critical', label: 'Critical', placeholder: '15 000 000' },
];

export default function CreateProgram() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');
  const [outOfScope, setOutOfScope] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [rewards, setRewards] = useState<Record<Severity, string>>({
    low: '',
    medium: '',
    high: '',
    critical: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) {
          navigate('/dashboard');
          return;
        }
        const data = snap.data();
        if (data.role !== 'company') {
          navigate('/dashboard');
          return;
        }
        setUserData({ ...data, uid: user.uid });
      } catch (err) {
        console.error('Auth check failed:', err);
        navigate('/dashboard');
      } finally {
        setAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid) return;

    if (!title.trim() || !description.trim() || !scope.trim()) {
      setError('Заполните название, описание и область действия программы.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const parsedRewards: Record<Severity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
      (Object.keys(rewards) as Severity[]).forEach((k) => {
        const n = parseInt(rewards[k].replace(/\s+/g, ''), 10);
        parsedRewards[k] = Number.isFinite(n) && n > 0 ? n : 0;
      });

      await addDoc(collection(db, 'programs'), {
        ownerId: userData.uid,
        ownerName: userData.companyName || '',
        title: title.trim(),
        description: description.trim(),
        scope: scope
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        outOfScope: outOfScope
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        rewards: parsedRewards,
        status,
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Create program error:', err);
      setError(err.message || 'Не удалось создать программу. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Создать программу</h1>
          <p className="text-sm text-slate-500 mt-1">
            Опишите вашу программу bug bounty: что входит в область, какие награды и правила.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Basics */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Основное</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Название программы
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder='Например: "Bug Bounty для платформы Acme"'
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  placeholder="Расскажите хантерам о вашем продукте, целях программы и приоритетных угрозах."
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">Статус</span>
                <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                  {(['draft', 'active'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        status === s
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {s === 'draft' ? 'Черновик' : 'Активна'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Только активные программы видны хантерам.
                </p>
              </div>
            </div>
          </section>

          {/* Scope */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <Target className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Область действия</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="scope" className="block text-sm font-medium text-slate-700">
                  В области (по одному элементу на строку)
                </label>
                <textarea
                  id="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  required
                  rows={4}
                  placeholder={'*.example.uz\napi.example.uz\nMobile app: com.example.app'}
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors font-mono"
                />
              </div>

              <div>
                <label htmlFor="outOfScope" className="block text-sm font-medium text-slate-700">
                  Вне области (по одному на строку, опционально)
                </label>
                <textarea
                  id="outOfScope"
                  value={outOfScope}
                  onChange={(e) => setOutOfScope(e.target.value)}
                  rows={3}
                  placeholder={'blog.example.uz\nLegacy customer portal'}
                  className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors font-mono"
                />
              </div>
            </div>
          </section>

          {/* Rewards */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Вознаграждения (UZS)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SEVERITIES.map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label htmlFor={`reward-${id}`} className="block text-sm font-medium text-slate-700">
                    {label}
                  </label>
                  <input
                    id={`reward-${id}`}
                    type="text"
                    inputMode="numeric"
                    value={rewards[id]}
                    onChange={(e) =>
                      setRewards((prev) => ({ ...prev, [id]: e.target.value.replace(/[^\d\s]/g, '') }))
                    }
                    placeholder={placeholder}
                    className="mt-1 block w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Создание...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Создать программу
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Программу можно отредактировать после создания.
          </p>
        </form>
      </main>
    </div>
  );
}
