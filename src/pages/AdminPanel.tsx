import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import {
  ArrowLeft,
  Loader2,
  Users,
  Building2,
  Bug,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

interface Stats {
  totalHunters: number;
  totalCompanies: number;
  totalEarnings: number;
  dauHunters: number;
  dauCompanies: number;
  wauHunters: number;
  wauCompanies: number;
  mauHunters: number;
  mauCompanies: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
      if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      fetchStats();
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users = snap.docs.map(d => d.data());
      
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      const s: Stats = {
        totalHunters: 0,
        totalCompanies: 0,
        totalEarnings: 0,
        dauHunters: 0,
        dauCompanies: 0,
        wauHunters: 0,
        wauCompanies: 0,
        mauHunters: 0,
        mauCompanies: 0,
      };

      users.forEach(u => {
        const role = u.role;
        const lastLogin = u.lastLogin ? new Date(u.lastLogin).getTime() : 0;
        const diff = now - lastLogin;

        if (role === 'hunter') {
          s.totalHunters++;
          s.totalEarnings += (u.stats?.earned || 0);
          if (diff <= oneDay) s.dauHunters++;
          if (diff <= oneWeek) s.wauHunters++;
          if (diff <= oneMonth) s.mauHunters++;
        } else if (role === 'company') {
          s.totalCompanies++;
          if (diff <= oneDay) s.dauCompanies++;
          if (diff <= oneWeek) s.wauCompanies++;
          if (diff <= oneMonth) s.mauCompanies++;
        }
      });

      setStats(s);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Доступ запрещен</h1>
        <p className="text-slate-500 text-center max-w-xs mb-8">
          У вас нет прав администратора для просмотра этой страницы.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Вернуться в дашборд
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary-600" />
              <h1 className="text-lg font-bold text-slate-900">Панель администратора</h1>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Live Stats
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Всего хантеров"
            value={stats?.totalHunters || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Всего компаний"
            value={stats?.totalCompanies || 0}
            icon={Building2}
            color="purple"
          />
          <StatCard
            title="Выплачено хантерам"
            value={`${(stats?.totalEarnings || 0).toLocaleString('ru-RU')} UZS`}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Активность (24ч)"
            value={(stats?.dauHunters || 0) + (stats?.dauCompanies || 0)}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hunters Activity */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bug className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">Активность хантеров</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <ActivityRow label="DAU (Daily Active Users)" value={stats?.dauHunters || 0} total={stats?.totalHunters || 1} color="bg-blue-600" />
              <ActivityRow label="WAU (Weekly Active Users)" value={stats?.wauHunters || 0} total={stats?.totalHunters || 1} color="bg-blue-500" />
              <ActivityRow label="MAU (Monthly Active Users)" value={stats?.mauHunters || 0} total={stats?.totalHunters || 1} color="bg-blue-400" />
            </div>
          </section>

          {/* Companies Activity */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Активность компаний</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <ActivityRow label="DAU (Daily Active Users)" value={stats?.dauCompanies || 0} total={stats?.totalCompanies || 1} color="bg-purple-600" />
              <ActivityRow label="WAU (Weekly Active Users)" value={stats?.wauCompanies || 0} total={stats?.totalCompanies || 1} color="bg-purple-500" />
              <ActivityRow label="MAU (Monthly Active Users)" value={stats?.mauCompanies || 0} total={stats?.totalCompanies || 1} color="bg-purple-400" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

function ActivityRow({ label, value, total, color }: any) {
  const percentage = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value} <span className="text-slate-400 font-normal">({percentage}%)</span></span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
