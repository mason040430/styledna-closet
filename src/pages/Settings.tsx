import { useState } from 'react';
import { Button, Confirm, PageHead } from '../components/ui';
import { useStore } from '../lib/store';

export default function Settings() {
  const s = useStore();
  const [confirm, setConfirm] = useState(false);
  const download = async () => {
    const blob = await s.exportData();
    const filename = `styledna-closet-${s.workspace}-${new Date().toISOString().slice(0, 10)}.json`;
    // Inside the Claude artifact viewer, downloads go through its "downloads" capability.
    const host = (window as unknown as { claude?: { use?: (n: string) => Promise<{ save?: (f: { filename: string; data: string }) => Promise<unknown> } | null> } }).claude;
    if (host?.use) {
      try {
        const d = await host.use('downloads');
        if (d?.save) { await d.save({ filename, data: await blob.text() }); return; }
      } catch { s.toast('The download was cancelled or blocked.', 'error'); return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const card = 'rounded-3xl bg-paper border border-line p-6';
  return (
    <>
      <PageHead eyebrow="Settings" title="Your data" />
      <div className="grid lg:grid-cols-2 gap-6">
        <section className={card}>
          <h2 className="font-serif text-xl">Where your closet is saved</h2>
          <p className="text-sm text-mute mt-2">
            {s.workspace === 'demo'
              ? 'You’re in the demo closet. Its items are fictional samples. Your changes stay in this browser only.'
              : 'Your closet is saved in this browser on this device (IndexedDB). It is not uploaded anywhere and there is no account yet, so it does not sync to other devices. Clearing your browser data deletes it — export a backup regularly.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={download}>Export backup (.json)</Button>
            <Button variant="secondary" onClick={() => s.enter(s.workspace === 'demo' ? 'mine' : 'demo')}>Switch to {s.workspace === 'demo' ? 'my closet' : 'demo closet'}</Button>
          </div>
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl">{s.workspace === 'demo' ? 'Reset demo' : 'Start over'}</h2>
          <p className="text-sm text-mute mt-2">{s.workspace === 'demo' ? 'Restore the original fictional sample closet.' : 'Permanently delete every piece, photo, look and plan in your closet on this device.'}</p>
          <Button variant={s.workspace === 'demo' ? 'secondary' : 'danger'} className="mt-5" onClick={() => setConfirm(true)}>{s.workspace === 'demo' ? 'Reset demo closet' : 'Delete my closet data'}</Button>
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl">How suggestions work</h2>
          <ul className="text-sm text-mute mt-2 space-y-1.5">
            <li>· Photo suggestions (colors, pattern, background cleanup) run on your device. Nothing is sent to an AI service.</li>
            <li>· Outfit ideas use only pieces in your closet and follow simple, explainable rules: color balance, pattern balance, season, occasion, your preferences and your feedback.</li>
            <li>· Thumbs up/down and looks you mark as worn change future suggestions.</li>
          </ul>
        </section>
        <section className={card}>
          <h2 className="font-serif text-xl">Leave the app</h2>
          <p className="text-sm text-mute mt-2">Return to the welcome screen. Your data stays saved.</p>
          <Button variant="secondary" className="mt-5" onClick={() => { s.exit(); window.location.hash = ''; }}>Back to welcome screen</Button>
        </section>
      </div>
      <p className="mt-8 text-xs text-mute">StyleDNA CLOSET V2 · Part of the StyleDNA project.</p>
      <Confirm open={confirm} onClose={() => setConfirm(false)} title={s.workspace === 'demo' ? 'Reset the demo?' : 'Delete everything?'}
        body={s.workspace === 'demo' ? 'Your changes to the demo closet will be replaced with the original samples.' : 'This deletes all pieces, photos, looks and plans saved on this device. Export a backup first if you might want them.'}
        confirm={s.workspace === 'demo' ? 'Reset demo' : 'Delete everything'}
        onConfirm={async () => { if (s.workspace === 'demo') await s.resetDemo(); else { await s.clearWorkspace(); s.toast('Closet cleared.'); } }} />
    </>
  );
}
