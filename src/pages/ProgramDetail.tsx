import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Loader2,
  Shield,
  Target,
  DollarSign,
  Users,
  Check,
  LogOut,
  AlertTriangle,
  FileText,
} from 'lucide-react';

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-blue-50 text-blue-700' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-50 text-red-700' },
};

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authChecking, setAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const [program, setProgram] = useState<any>(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth + user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
          setUserId(user.uid);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Subscribe to program
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'programs', id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          setProgram(null);
        } else {
          setProgram({ id: snap.id, ...snap.data() });
          setNotFound(false);
        }
        setProgramLoading(false);
      },
      (err) => {
        console.error('Program subscription error:', err);
        setProgramLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  const isHunter = userData?.role === 'hunter';
  const isOwner = !!program && !!userId && program.ownerId === userId;
  const participantIds: string[] = program?.participantIds || [];
  const isParticipant = !!userId && participantIds.includes(userId);

  const handleJoin = async () => {
    if (!program?.id || !userId) return;
    setActing(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'programs', program.id), {
        participantIds: arrayUnion(userId),
      });
    } catch (err: any) {
      console.error('Join error:', err);
      setError(err.message || 'Не удалось присоединиться к программе.');
    } finally {
      setActing(false);
    }
  };

  const handleLeave = async () => {
    if (!program?.id || !userId) return;
    setActing(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'programs', program.id), {
        participantIds: arrayRemove(userId),
      });
    } catch (err: any) {
      console.error('Leave error:', err);
      setError(err.message || 'Не удалось покинуть программу.');
    } finally {
      setActing(false);
    }
  };

  if (authChecking || programLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Назад в дашборд
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Программа не найдена</h1>
          <p className="text-slate-500 mt-1">Возможно, она была удалена или у вас нет доступа.</p>
        </main>
      </div>
    );
  }

  const rewards = program.rewards || {};
  const maxReward = Math.max(
    rewards.low || 0,
    rewards.medium || 0,
    rewards.high || 0,
    rewards.critical || 0
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Назад в дашборд
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="Bug Hunt" className="w-12 h-12" />
            <span className="font-bold text-slate-900 tracking-tight">Bug Hunt</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Header card */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    program.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {program.status === 'active' ? 'Активна' : 'Черновик'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{program.title}</h1>
              {program.ownerName && (
                <p className="text-sm text-slate-500 mt-1">{program.ownerName}</p>
              )}
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
              {isOwner ? (
                <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl">
                  <Shield className="w-4 h-4" /> Вы владелец
                </span>
              ) : isHunter && program.status === 'active' ? (
                isParticipant ? (
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                        <Check className="w-4 h-4" /> Вы участвуете
                      </span>
                      <Link
                        to={`/programs/${program.id}/report`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-md shadow-primary-600/20"
                      >
                        <FileText className="w-4 h-4" /> Отправить отчет
                      </Link>
                      <button
                        type="button"
                        onClick={handleLeave}
                        disabled={acting}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-60"
                      >
                        {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Покинуть программу
                      </button>
                    </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={acting}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-70"
                  >
                    {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Участвовать
                  </button>
                )
              ) : isHunter && program.status !== 'active' ? (
                <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl">
                  Программа неактивна
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-400" />
              {participantIds.length} {participantIds.length === 1 ? 'участник' : 'участников'}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Target className="w-4 h-4 text-slate-400" />
              {(program.scope?.length || 0)} в области
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400" />
              до {maxReward.toLocaleString('ru-RU')} UZS
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-3">Описание</h2>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{program.description}</p>
        </section>

        {/* Scope */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Область действия</h2>
          </div>
          {program.scope?.length ? (
            <ul className="space-y-2">
              {program.scope.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-mono text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Область не указана.</p>
          )}

          {program.outOfScope?.length ? (
            <>
              <h3 className="text-sm font-bold text-slate-900 mt-6 mb-3">Вне области</h3>
              <ul className="space-y-2">
                {program.outOfScope.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-mono text-slate-500">
                    <span className="text-red-400 mt-0.5">✕</span>
                    {s}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        {/* Rewards */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Вознаграждения (UZS)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['low', 'medium', 'high', 'critical'] as const).map((sev) => {
              const value = rewards[sev] || 0;
              const meta = SEVERITY_LABELS[sev];
              return (
                <div key={sev} className="border border-slate-100 rounded-xl p-4">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${meta.color}`}>
                    {meta.label}
                  </span>
                  <p className="text-lg font-bold text-slate-900">
                    {value > 0 ? value.toLocaleString('ru-RU') : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
