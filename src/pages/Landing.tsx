import { Button } from '../components/ui';
import { Brand } from '../App';
import { useStore } from '../lib/store';
import { buildDemo } from '../lib/demo';
import { useEffect, useState } from 'react';

function DemoStrip() {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const d = buildDemo(); const picks = ['demo-img-coat', 'demo-img-stripe', 'demo-img-jeans', 'demo-img-boots', 'demo-img-dress', 'demo-img-tote'];
    const u = picks.map((p) => URL.createObjectURL(d.images.find((i) => i.id === p)!.blob)); setUrls(u);
    return () => u.forEach((x) => URL.revokeObjectURL(x));
  }, []);
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-hidden>
      {urls.map((u, i) => (
        <div key={u} className={`rounded-2xl bg-paper shadow-card aspect-[4/5] grid place-items-center fade-in ${i % 2 ? 'translate-y-6' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
          <img src={u} alt="" className="w-3/4 h-3/4 object-contain" />
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  const { enter } = useStore();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 sm:px-10 h-16 flex items-center justify-between border-b border-line">
        <Brand />
        <button onClick={() => enter('demo')} className="text-sm underline underline-offset-4">Try the demo</button>
      </header>
      <main className="flex-1 grid lg:grid-cols-2 gap-12 items-center px-5 sm:px-10 py-12 lg:py-20 max-w-7xl mx-auto w-full">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-olive">StyleDNA Closet · V2</p>
          <h1 className="font-serif text-5xl sm:text-7xl leading-[0.98] mt-4">Your wardrobe,<br /><em className="text-olive">intelligently</em> organized.</h1>
          <p className="text-lg text-mute mt-6 max-w-lg">Photograph what you own. Get outfits built only from your real clothes — with a clear reason for every suggestion.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => enter('mine')} className="h-12 px-7">Start my closet</Button>
            <Button variant="secondary" onClick={() => enter('demo')} className="h-12 px-7">Explore the demo closet</Button>
          </div>
          <ul className="mt-10 grid sm:grid-cols-3 gap-5 text-sm">
            {[
              ['Snap & sort', 'Colors, pattern and background cleanup happen right on your phone.'],
              ['Style what you own', 'Outfit ideas from your closet only — accept, tweak or skip.'],
              ['Learns from you', 'Thumbs up or down, and what you actually wear, shape what comes next.'],
            ].map(([h, b]) => (
              <li key={h}><p className="font-serif text-xl">{h}</p><p className="text-mute mt-1">{b}</p></li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-mute max-w-lg">This version saves your closet in this browser on this device — no account needed, nothing uploaded. The demo uses fictional sample items. The StyleDNA quiz is optional.</p>
        </section>
        <section className="relative"><DemoStrip /></section>
      </main>
    </div>
  );
}
