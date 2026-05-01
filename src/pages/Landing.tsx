import { useState } from 'react';
import { Shield, Zap, ChevronRight, Menu, X, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary-200 selection:text-primary-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/icon.svg" alt="Bug Hunt" className="w-[3.75rem] h-[3.75rem]" />
              <span className="font-bold text-xl tracking-tight text-slate-900">Bug Hunt</span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Преимущества</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Как это работает</a>
              <a href="#hunters" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Хантерам</a>
              <a href="#companies" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Компании</a>
              <Link to="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 transition-all shadow-sm shadow-primary-600/20 active:scale-95 flex items-center gap-2">
                Начать работу <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">Преимущества</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">Как это работает</a>
            <a href="#hunters" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">Хантерам</a>
            <a href="#companies" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 rounded-md">Компании</a>
            <div className="pt-2">
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex justify-center items-center gap-2">
                Начать работу <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-primary-600 font-semibold tracking-wide uppercase text-sm mb-6">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse"></span>
                Платформа Bug Bounty №1 в Узбекистане
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                Обеспечьте безопасность <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">вашего бизнеса</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Объединяем лучшие таланты Узбекистана в сфере кибербезопасности для защиты ваших цифровых активов. Находите уязвимости раньше, чем это сделают злоумышленники.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Начать работу <ChevronRight className="w-5 h-5" />
                </Link>
                <a href="#companies" className="w-full sm:w-auto px-8 py-4 text-slate-600 font-semibold text-lg hover:text-primary-600 transition-all hover:bg-slate-50 rounded-xl flex items-center justify-center">
                  Связаться с отделом продаж
                </a>
              </div>
              
              <div className="mt-16 flex flex-wrap justify-center gap-12 md:gap-24 text-slate-500">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-slate-900">500+</span>
                  <span className="text-sm font-medium">Активных хантеров</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-slate-900">10k+</span>
                  <span className="text-sm font-medium">Найденных багов</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-slate-900">UZS</span>
                  <span className="text-sm font-medium">Локальные выплаты</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Почему выбирают Bug Hunt?</h2>
              <p className="text-lg text-slate-600">Современная платформа, созданная с учетом особенностей локального рынка для максимальной эффективности.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Надежная защита</h3>
                <p className="text-slate-600 leading-relaxed">
                  Мы проверяем каждого специалиста. Конфиденциальность ваших данных — наш главный приоритет.
                </p>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Быстрые выплаты</h3>
                <p className="text-slate-600 leading-relaxed">
                  Мгновенные переводы на карты Uzcard и Humo. Никаких сложных международных транзакций.
                </p>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Локальная поддержка</h3>
                <p className="text-slate-600 leading-relaxed">
                  Наша команда говорит на узбекском и русском языках. Мы всегда на связи и готовы помочь.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Простой процесс. Мощный результат.</h2>
              <p className="text-lg text-slate-400">Начните получать отчеты об уязвимостях всего за несколько шагов.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
              <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-slate-800 via-primary-500/50 to-slate-800"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 bg-slate-900 px-4">
                  <span className="text-6xl font-black text-slate-800">01</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Запустите программу</h3>
                <p className="text-slate-400">Определите scope (область тестирования) и установите размер вознаграждений за найденные баги.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 bg-slate-900 px-4">
                  <span className="text-6xl font-black text-primary-500">02</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Получайте отчеты</h3>
                <p className="text-slate-400">Хантеры начинают тестирование. Вы получаете детальные отчеты об уязвимостях через нашу платформу.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 bg-slate-900 px-4">
                  <span className="text-6xl font-black text-slate-800">03</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Исправляйте и платите</h3>
                <p className="text-slate-400">Проверяйте отчеты, исправляйте уязвимости и выплачивайте вознаграждения через нашу систему.</p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link to="/signup" className="inline-flex px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg items-center justify-center gap-2 mx-auto">
                Начать работу <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Hunters Section */}
        <section id="hunters" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Для белых хакеров
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Присоединяйтесь к крупнейшему сообществу специалистов по кибербезопасности в Узбекистане. Находите уязвимости в ведущих компаниях страны, получайте достойные вознаграждения легально и безопасно, повышайте свой рейтинг и прокачивайте навыки.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                    <span className="font-medium">Легальная работа по договору</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                    <span className="font-medium">Выплаты на Uzcard/Humo без скрытых комиссий</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                    <span className="font-medium">Закрытые приватные программы</span>
                  </li>
                </ul>
                <Link to="/signup" className="inline-flex px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg items-center justify-center gap-2">
                  Зарегистрироваться <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-100 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Hunter" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">Aziza</h4>
                      <p className="text-sm text-primary-600 font-bold uppercase tracking-wider">Топ-1 рейтинга</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Найдено уязвимостей</span>
                        <span className="font-black text-slate-900 text-xl">42</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Заработано (UZS)</span>
                        <span className="font-black text-emerald-600 text-xl">85M+</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="companies" className="py-24 bg-primary-600 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
              <path d="M0,100 L100,0 L100,100 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Готовы повысить уровень безопасности?</h2>
            <p className="text-xl text-primary-100 mb-10">
              Присоединяйтесь к ведущим компаниям Узбекистана, которые уже доверили свою безопасность сообществу Bug Hunt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a href="/signup" className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Связаться с нами <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/signup" className="px-8 py-4 text-primary-100 rounded-xl font-bold text-lg hover:text-white hover:bg-primary-700 transition-all hover:-translate-y-1 flex justify-center items-center">
                Стать хантером
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/icon.svg" alt="Bug Hunt" className="w-[3.375rem] h-[3.375rem]" />
                <span className="font-bold text-xl text-white tracking-tight">Bug Hunt</span>
              </Link>
              <p className="text-sm mb-4">
                Платформа Bug Bounty, созданная специально для рынка Узбекистана.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Для компаний</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Для хантеров</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Ценообразование</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Ресурсы</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Блог</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Документация</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Правила платформы</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:hello@bughunt.uz" className="hover:text-primary-400 transition-colors">hello@bughunt.uz</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Telegram Support</a></li>
                <li>г. Ташкент, Узбекистан</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Bug Hunt. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Условия использования</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Политика конфиденциальности</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
