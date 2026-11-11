import { useState } from 'react';
import { go, Modal, Toasts, useRoute , href} from './components/ui';
import { useStore } from './lib/store';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Closet from './pages/Closet';
import AddItems from './pages/AddItems';
import ItemDetail from './pages/ItemDetail';
import Studio from './pages/Studio';
import Stylist from './pages/Stylist';
import Looks from './pages/Looks';
import CalendarPage from './pages/Calendar';
import InsightsPage from './pages/Insights';
import ProfilePage from './pages/Profile';
import Settings from './pages/Settings';

const NAV = [
  { path: '', label: 'Today', icon: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z' },
  { path: 'closet', label: 'My Closet', icon: 'M5 4h14v16H5zM12 4v16M9 11v2M15 11v2' },
  { path: 'add', label: 'Add Items', icon: 'M12 5v14M5 12h14' },
  { path: 'stylist', label: 'Stylist', icon: 'M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z' },
  { path: 'studio', label: 'Outfit Studio', icon: 'M4 6h7v7H4zM13 6h7v4h-7zM13 12h7v8h-7zM4 15h7v5H4z' },
  { path: 'looks', label: 'Saved Looks', icon: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' },
  { path: 'calendar', label: 'Calendar', icon: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
  { path: 'insights', label: 'Insights', icon: 'M5 20V10M12 20V4M19 20v-7' },
  { path: 'profile', label: 'Style Profile', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' },
  { path: 'data', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
];

export function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

export function Brand({ small }: { small?: boolean }) {
  return (
    <a href={href('')} className="inline-flex items-baseline gap-2" aria-label="StyleDNA CLOSET home">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-ink translate-y-[-1px]" aria-hidden />
      <span className={`font-semibold tracking-[0.18em] ${small ? 'text-xs' : 'text-sm'}`}>STYLE DNA</span>
      <span className={`font-serif italic ${small ? 'text-sm' : 'text-base'} text-olive`}>Closet</span>
    </a>
  );
}

function Page({ route }: { route: string[] }) {
  const [p, id] = route;
  switch (p ?? '') {
    case '': return <Home />;
    case 'closet': return <Closet />;
    case 'add': return <AddItems />;
    case 'item': return <ItemDetail id={id} />;
    case 'studio': return <Studio id={id} />;
    case 'stylist': return <Stylist />;
    case 'looks': return <Looks />;
    case 'calendar': return <CalendarPage />;
    case 'insights': return <InsightsPage />;
    case 'profile': return <ProfilePage />;
    case 'data': case 'settings': return <Settings />;
    default: return (
      <div className="py-24 text-center">
        <p className="font-serif text-4xl">Page not found</p>
        <button className="mt-6 underline" onClick={() => go('')}>Back to today</button>
      </div>
    );
  }
}

export default function App() {
  const s = useStore();
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  if (!s.workspace) return <><Landing /><Toasts /></>;
  if (!s.ready) return <div className="min-h-screen grid place-items-center text-mute">Opening your closet…</div>;
  const current = route[0] ?? '';
  const active = (p: string) => (p === '' ? current === '' : current === p || (p === 'studio' && current === 'studio'));
  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-lime px-3 py-2 rounded z-50">Skip to content</a>
      {/* desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-line px-6 py-8 sticky top-0 h-screen">
        <Brand />
        <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.path} href={href(n.path)} aria-current={active(n.path) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 h-10 text-sm transition ${active(n.path) ? 'bg-ink text-cream' : 'hover:bg-ink/5'}`}>
              <Icon d={n.icon} className="h-[18px] w-[18px]" />{n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto text-xs text-mute leading-relaxed">
          {s.workspace === 'demo' ? <p><b className="text-ink">Demo closet.</b> Fictional sample items.</p> : <p>Saved on this device only.</p>}
          <button onClick={() => s.enter(s.workspace === 'demo' ? 'mine' : 'demo')} className="mt-2 underline underline-offset-2">
            Switch to {s.workspace === 'demo' ? 'my closet' : 'demo closet'}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-line px-4 h-14 flex items-center justify-between">
          <Brand small />
          {s.workspace === 'demo' && <span className="text-[10px] font-bold tracking-[0.14em] bg-lime px-2.5 py-1 rounded-full">DEMO</span>}
        </div>
        {s.workspace === 'demo' && (
          <div className="bg-ink text-cream text-xs sm:text-sm px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span><b className="text-lime">Demo closet</b> — fictional sample items. Changes stay in this browser.</span>
            <button className="underline underline-offset-2" onClick={() => s.enter('mine')}>Start my own closet →</button>
          </div>
        )}
        {s.error && <div className="bg-danger text-white text-sm px-4 py-3 text-center" role="alert">{s.error}</div>}
        <main id="main" className="px-4 sm:px-8 lg:px-12 pt-8 pb-32 lg:pb-16 max-w-6xl mx-auto">
          <Page route={route} />
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Main">
        <div className="grid grid-cols-5 h-16 items-center">
          {[NAV[0], NAV[1], NAV[2], NAV[3]].map((n, i) => (
            <a key={n.path} href={href(n.path)} aria-current={active(n.path) ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 text-[10px] ${i === 2 ? '' : active(n.path) ? 'text-ink' : 'text-mute'}`}>
              {i === 2 ? <span className="h-12 w-12 -mt-6 rounded-full bg-ink text-lime grid place-items-center shadow-card"><Icon d={n.icon} className="h-6 w-6" /></span> : <Icon d={n.icon} />}
              <span className={i === 2 ? 'text-ink' : ''}>{i === 2 ? 'Add' : n.label.replace('My ', '')}</span>
            </a>
          ))}
          <button onClick={() => setMenu(true)} className="flex flex-col items-center gap-1 text-[10px] text-mute" aria-haspopup="dialog">
            <Icon d="M4 7h16M4 12h16M4 17h16" /><span>More</span>
          </button>
        </div>
      </nav>
      <Modal open={menu} onClose={() => setMenu(false)} title="Menu">
        <div className="grid grid-cols-2 gap-2">
          {NAV.slice(4).map((n) => (
            <a key={n.path} href={href(n.path)} onClick={() => setMenu(false)} className="flex items-center gap-3 rounded-2xl bg-paper border border-line px-4 h-14 text-sm">
              <Icon d={n.icon} />{n.label}
            </a>
          ))}
        </div>
        <button onClick={() => { setMenu(false); void s.enter(s.workspace === 'demo' ? 'mine' : 'demo'); }} className="mt-4 w-full text-sm underline">
          Switch to {s.workspace === 'demo' ? 'my closet' : 'demo closet'}
        </button>
      </Modal>
      <Toasts />
    </div>
  );
}
