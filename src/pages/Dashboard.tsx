import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard,
  Bug,
  Shield,
  Activity,
  Menu,
  X,
  Loader2,
  Trophy,
  DollarSign,
  Bell,
  User,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'programs' | 'reports'>('dashboard');
  const [programs, setPrograms] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setUserId(user.uid);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/signup');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Subscribe to programs (own programs for companies, active programs for hunters)
  useEffect(() => {
    if (!userData || !userId) return;
    const isHunter = userData.role === 'hunter';
    const programsRef = collection(db, 'programs');
    // NOTE: orderBy removed to avoid requiring a composite index; we sort client-side.
    const q = isHunter
      ? query(programsRef, where('status', '==', 'active'))
      : query(programsRef, where('ownerId', '==', userId));

    setProgramsLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        items.sort((a, b) => {
          const av = a.createdAt?.toMillis?.() ?? 0;
          const bv = b.createdAt?.toMillis?.() ?? 0;
          return bv - av;
        });
        console.log('[programs] role=', userData.role, 'count=', items.length, items);
        setPrograms(items);
        setProgramsLoading(false);
      },
      (err) => {
        console.error('Programs subscription error:', err);
        setProgramsLoading(false);
      }
    );
    return () => unsub();
  }, [userData, userId]);

  // Subscribe to reports
  useEffect(() => {
    if (!userData || !userId) return;
    const isHunter = userData.role === 'hunter';
    const reportsRef = collection(db, 'reports');
    const q = isHunter
      ? query(reportsRef, where('hunterId', '==', userId))
      : query(reportsRef, where('companyId', '==', userId));

    setReportsLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        items.sort((a, b) => {
          const av = a.createdAt?.toMillis?.() ?? 0;
          const bv = b.createdAt?.toMillis?.() ?? 0;
          return bv - av;
        });
        setReports(items);
        setReportsLoading(false);
      },
      (err) => {
        console.error('Reports subscription error:', err);
        setReportsLoading(false);
      }
    );
    return () => unsub();
  }, [userData, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  const isHunter = userData?.role === 'hunter';
  const displayName = isHunter ? userData?.firstName || userData?.username : userData?.companyName;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="Bug Hunt" className="w-[3.75rem] h-[3.75rem]" />
            <span className="font-bold text-xl tracking-tight">Bug Hunt</span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {(() => {
            const tabs: { id: 'dashboard' | 'programs' | 'reports'; label: string; icon: typeof LayoutDashboard }[] = [
              { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
              { id: 'programs', label: isHunter ? 'Программы' : 'Мои программы', icon: Shield },
              { id: 'reports', label: 'Отчеты', icon: Activity },
            ];
            return tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                      ? 'bg-primary-600/10 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-5 h-5" /> {label}
                </button>
              );
            });
          })()}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
            <User className="w-5 h-5" /> Профиль
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-8">
                  Добро пожаловать, {displayName}!
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Bug className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {isHunter ? 'Найдено уязвимостей' : 'Всего отчетов'}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {isHunter ? (userData?.stats?.vulnerabilitiesFound || 0) : reports.length}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {isHunter ? 'Заработано (UZS)' : 'Активные программы'}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {isHunter ? (userData?.stats?.earned || 0).toLocaleString('ru-RU') : programs.filter((p) => p.status === 'active').length}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      {isHunter ? <Trophy className="w-6 h-6 text-purple-600" /> : <Shield className="w-6 h-6 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {isHunter ? 'Рейтинг на платформе' : 'Выплачено (UZS)'}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {isHunter ? 'Новичок' : (userData?.stats?.paid || 0).toLocaleString('ru-RU')}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Последняя активность</h3>
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Все события</button>
                  </div>
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">Пока здесь пусто</h4>
                    <p className="text-slate-500 text-sm">
                      {isHunter
                        ? 'Присоединяйтесь к программам и отправляйте отчеты, чтобы они появились здесь.'
                        : 'Создайте свою первую программу bug bounty, чтобы начать получать отчеты.'}
                    </p>
                    {isHunter ? (
                      <button
                        onClick={() => setActiveTab('programs')}
                        className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        Найти программу
                      </button>
                    ) : (
                      <Link
                        to="/programs/new"
                        className="inline-block mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        Создать программу
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'programs' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {isHunter ? 'Программы' : 'Мои программы'}
                  </h1>
                  {!isHunter && (
                    <Link
                      to="/programs/new"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
                    >
                      <Shield className="w-4 h-4" /> Создать программу
                    </Link>
                  )}
                </div>
                <p className="text-slate-500 mb-8">
                  {isHunter
                    ? 'Просматривайте активные программы bug bounty и присоединяйтесь к ним.'
                    : 'Управляйте своими программами bug bounty.'}
                </p>

                {programsLoading ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : programs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">Программ пока нет</h4>
                    <p className="text-slate-500 text-sm">
                      {isHunter
                        ? 'Доступные программы появятся здесь, как только компании их опубликуют.'
                        : 'Создайте свою первую программу, чтобы начать получать отчеты.'}
                    </p>
                    {!isHunter && (
                      <Link
                        to="/programs/new"
                        className="inline-block mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        Создать программу
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map((p) => {
                      const maxReward = Math.max(
                        p.rewards?.low || 0,
                        p.rewards?.medium || 0,
                        p.rewards?.high || 0,
                        p.rewards?.critical || 0
                      );
                      return (
                        <Link
                          key={p.id}
                          to={`/programs/${p.id}`}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                              <Shield className="w-5 h-5 text-primary-600" />
                            </div>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                              {p.status === 'active' ? 'Активна' : 'Черновик'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{p.title}</h3>
                          {isHunter && p.ownerName && (
                            <p className="text-xs text-slate-500 mb-2">{p.ownerName}</p>
                          )}
                          <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              {(p.scope?.length || 0)} в области
                            </span>
                            <span className="font-semibold text-slate-900">
                              до {maxReward.toLocaleString('ru-RU')} UZS
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Отчеты</h1>
                <p className="text-slate-500 mb-8">
                  {isHunter
                    ? 'Ваши отправленные отчеты об уязвимостях.'
                    : 'Отчеты, отправленные хантерами по вашим программам.'}
                </p>
                {reportsLoading ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-medium mb-1">Отчетов пока нет</h4>
                    <p className="text-slate-500 text-sm">
                      {isHunter
                        ? 'Отправьте свой первый отчет, чтобы он появился здесь.'
                        : 'Когда хантеры начнут отправлять отчеты, они появятся здесь.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((r) => (
                      <Link
                        key={r.id}
                        to={`/reports/${r.id}`}
                        className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                r.severity === 'critical' ? 'bg-red-50 text-red-600' :
                                r.severity === 'high' ? 'bg-orange-50 text-orange-600' :
                                r.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {r.severity}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                r.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                                r.status === 'rejected' ? 'bg-slate-100 text-slate-600' :
                                r.status === 'reviewed' ? 'bg-purple-50 text-purple-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {r.status === 'pending' ? 'Ожидает' : 
                                 r.status === 'reviewed' ? 'На проверке' :
                                 r.status === 'accepted' ? 'Принят' : 'Отклонен'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {r.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              Программа: {r.programTitle} • {isHunter ? `Отправлено: ${r.createdAt?.toDate().toLocaleDateString()}` : `От: ${r.hunterName}`}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-slate-400">
                            <ChevronRight className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
