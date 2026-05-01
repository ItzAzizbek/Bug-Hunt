import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  ArrowLeft,
  Loader2,
  Shield,
  FileText,
  AlertTriangle,
  Send,
} from 'lucide-react';

type Severity = 'low' | 'medium' | 'high' | 'critical';

const SEVERITIES: { id: Severity; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: 'bg-blue-50 text-blue-700' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  { id: 'high', label: 'High', color: 'bg-orange-50 text-orange-700' },
  { id: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700' },
];

export default function SubmitReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authChecking, setAuthChecking] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [impact, setImpact] = useState('');
  const [severity, setSeverity] = useState<Severity>('low');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userSnap.exists() || userSnap.data().role !== 'hunter') {
          navigate('/dashboard');
          return;
        }
        setUserData({ ...userSnap.data(), uid: user.uid });

        if (id) {
          const progSnap = await getDoc(doc(db, 'programs', id));
          if (progSnap.exists()) {
            const progData = progSnap.data();
            // Check if hunter is a participant
            if (!progData.participantIds?.includes(user.uid)) {
              navigate(`/programs/${id}`);
              return;
            }
            setProgram({ id: progSnap.id, ...progData });
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Initial load failed:', err);
        navigate('/dashboard');
      } finally {
        setAuthChecking(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.uid || !program?.id) return;

    if (!title.trim() || !description.trim() || !steps.trim()) {
      setError('Заполните все обязательные поля.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'reports'), {
        programId: program.id,
        programTitle: program.title,
        hunterId: userData.uid,
        hunterName: userData.username || userData.firstName || 'Hunter',
        companyId: program.ownerId,
        title: title.trim(),
        description: description.trim(),
        steps: steps.trim(),
        impact: impact.trim(),
        severity,
        status: 'pending', // pending, reviewed, accepted, rejected
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Submit report error:', err);
      setError(err.message || 'Не удалось отправить отчет. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking || loading) {
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
            to={`/programs/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к программе
          </Link>
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Bug Hunt" className="w-12 h-12" />
            <span className="font-bold text-slate-900 tracking-tight">Bug Hunt</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Отправить отчет</h1>
          <p className="text-sm text-slate-500 mt-1">
            Программа: <span className="font-semibold text-slate-700">{program?.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Детали уязвимости</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Название отчета
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder='Например: "Stored XSS в профиле пользователя"'
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-700 mb-2">Критичность</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all border ${
                        severity === sev.id
                          ? `${sev.color} border-current ring-1 ring-current`
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
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
                  rows={4}
                  placeholder="Кратко опишите найденную уязвимость и её тип."
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-slate-700">
                  Шаги для воспроизведения
                </label>
                <textarea
                  id="steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  required
                  rows={6}
                  placeholder="Подробно опишите каждый шаг, чтобы компания могла подтвердить баг."
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors font-mono"
                />
              </div>

              <div>
                <label htmlFor="impact" className="block text-sm font-medium text-slate-700">
                  Влияние (Impact)
                </label>
                <textarea
                  id="impact"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={3}
                  placeholder="Опишите, к чему может привести эксплуатация этой уязвимости."
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/programs/${id}`}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Отправить отчет
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> 
            Отправляя отчет, вы подтверждаете, что действовали в рамках правил программы.
          </p>
        </form>
      </main>
    </div>
  );
}
