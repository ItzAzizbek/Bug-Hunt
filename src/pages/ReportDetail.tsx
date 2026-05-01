import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import {
  ArrowLeft,
  Loader2,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-blue-50 text-blue-700' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-50 text-red-700' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Ожидает', color: 'bg-blue-50 text-blue-700', icon: Clock },
  reviewed: { label: 'На проверке', color: 'bg-purple-50 text-purple-700', icon: Eye },
  accepted: { label: 'Принят', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Отклонен', color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authChecking, setAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'reports', id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setReport({ id: snap.id, ...snap.data() });
      } else {
        navigate('/dashboard');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id, navigate]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !report) return;
    setUpdating(true);
    try {
      // Payout logic if accepted
      if (newStatus === 'accepted' && report.status !== 'accepted') {
        const progSnap = await getDoc(doc(db, 'programs', report.programId));
        if (progSnap.exists()) {
          const progData = progSnap.data();
          const reward = progData.rewards?.[report.severity] || 0;

          const hunterRef = doc(db, 'users', report.hunterId);
          const hunterSnap = await getDoc(hunterRef);
          if (hunterSnap.exists()) {
            const hunterData = hunterSnap.data();
            const stats = hunterData.stats || {};
            const currentEarned = stats.earned || 0;
            const currentFound = stats.vulnerabilitiesFound || 0;

            await updateDoc(hunterRef, {
              'stats.earned': currentEarned + Number(reward),
              'stats.vulnerabilitiesFound': currentFound + 1,
            });
          }

          const companyRef = doc(db, 'users', report.companyId);
          const companySnap = await getDoc(companyRef);
          if (companySnap.exists()) {
            const companyData = companySnap.data();
            const stats = companyData.stats || {};
            const currentPaid = stats.paid || 0;

            await updateDoc(companyRef, {
              'stats.paid': currentPaid + Number(reward),
            });
          }
        }
      }

      await updateDoc(doc(db, 'reports', id), {
        status: newStatus,
      });
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  const isHunter = userData?.role === 'hunter';
  const isCompany = userData?.role === 'company';
  const isOwner = isCompany && report.companyId === userId;
  const isAuthor = isHunter && report.hunterId === userId;

  if (!isOwner && !isAuthor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">У вас нет доступа к этому отчету.</p>
      </div>
    );
  }

  const statusMeta = STATUS_LABELS[report.status] || STATUS_LABELS.pending;
  const StatusIcon = statusMeta.icon;

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
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Bug Hunt" className="w-12 h-12" />
            <span className="font-bold text-slate-900 tracking-tight">Bug Hunt</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6">
        {/* Header card */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${SEVERITY_LABELS[report.severity].color}`}>
                  {SEVERITY_LABELS[report.severity].label}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${statusMeta.color}`}>
                  <StatusIcon className="w-3 h-3" /> {statusMeta.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Программа: {report.programTitle} • От {report.hunterName}
              </p>
            </div>

            {isOwner && report.status !== 'accepted' && report.status !== 'rejected' && (
              <div className="flex flex-wrap gap-2">
                {report.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus('reviewed')}
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all disabled:opacity-70"
                  >
                    <Eye className="w-4 h-4" /> На проверку
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-70"
                >
                  <CheckCircle2 className="w-4 h-4" /> Принять
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-70"
                >
                  <XCircle className="w-4 h-4" /> Отклонить
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Content sections */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Описание</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{report.description}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Шаги для воспроизведения</h2>
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-x-auto whitespace-pre-wrap">
              {report.steps}
            </pre>
          </div>
        </section>

        {report.impact && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Влияние (Impact)</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{report.impact}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
