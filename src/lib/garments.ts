/**
 * Editorial flat-lay garment illustrations for the fictional demo closet.
 * Each piece = silhouette + volume gradient + clipped fold shading + construction details
 * (seams, stitching, buttons, ribbing, fabric texture) + soft floor shadow.
 */
export type Shape = 'tee' | 'shirt' | 'knit' | 'hoodie' | 'jacket' | 'coat' | 'blazer' | 'jeans' | 'trousers' | 'skirt' | 'dress' | 'boots' | 'sneakers' | 'loafers' | 'tote' | 'crossbody' | 'scarf' | 'cap' | 'belt';

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c: number) => clamp(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  return `#${[f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

interface Parts { extent?: [number, number, number, number]; body: string; folds?: string[]; highlights?: string[]; seams?: string[]; details?: string; texture?: 'knit' | 'twill' | 'canvas' | 'leather' | 'none' }

const P: Record<Shape, (c: { base: string; dark: string; light: string; line: string; acc: string }) => Parts> = {
  tee: (c) => ({
    body: 'M84 34 Q120 52 156 34 L198 52 Q206 58 210 72 L222 104 Q206 114 186 116 L178 98 L180 214 Q120 222 60 214 L62 98 L54 116 Q34 114 18 104 L30 72 Q34 58 42 52 Z',
    folds: ['M70 120 Q92 160 76 206 L64 206 Z', 'M150 128 Q168 170 160 210 L172 210 Q176 160 160 120 Z', 'M44 64 Q50 86 40 108 L28 104 Z'],
    highlights: ['M100 70 Q120 120 104 200 L118 200 Q132 120 112 70 Z'],
    seams: ['M84 34 Q120 52 156 34', 'M86 40 Q120 60 154 40', 'M62 98 L54 116', 'M178 98 L186 116', 'M62 206 Q120 214 180 206'],
    texture: 'none',
  }),
  shirt: (c) => ({
    body: 'M88 30 L104 22 L120 34 L136 22 L152 30 L196 46 Q208 54 212 70 L232 176 L206 184 L182 92 L184 218 Q120 226 56 218 L58 92 L34 184 L8 176 L28 70 Q32 54 44 46 Z',
    folds: ['M60 110 Q84 160 66 212 L58 212 Z', 'M160 104 Q178 160 170 214 L182 214 Q186 150 168 104 Z', 'M196 90 L222 170 L210 174 Z'],
    highlights: ['M128 50 L134 214 L142 214 L136 50 Z'],
    seams: ['M120 34 L120 220', 'M126 34 L126 220', 'M58 92 L34 184', 'M182 92 L206 184', 'M20 160 L36 164', 'M220 164 L204 160', 'M138 70 L162 70 L162 98 L138 98 Z'],
    details: `<path d="M104 22 L120 34 L112 52 L94 36 Z M136 22 L120 34 L128 52 L146 36 Z" fill="${c.light}" stroke="${c.line}" stroke-width="1.2"/>` +
      [56, 84, 112, 140, 168, 196].map((y) => `<circle cx="123" cy="${y}" r="2.6" fill="${c.light}" stroke="${c.line}" stroke-width="1"/>`).join(''),
    texture: 'none',
  }),
  knit: (c) => ({
    body: 'M86 30 Q120 46 154 30 L196 46 Q210 54 214 72 L230 180 Q232 196 218 198 L202 198 L184 98 L186 212 Q120 222 54 212 L56 98 L38 198 L22 198 Q8 196 10 180 L26 72 Q30 54 44 46 Z',
    folds: ['M64 110 Q86 160 70 206 L60 206 Z', 'M156 112 Q176 160 168 208 L180 208 Q184 150 166 112 Z'],
    highlights: ['M104 60 Q124 130 108 204 L122 204 Q138 130 116 60 Z'],
    seams: ['M86 30 Q120 46 154 30', 'M88 38 Q120 56 152 38', 'M56 196 Q120 206 186 196', 'M24 184 L40 184', 'M200 184 L216 184'],
    details: `<g stroke="${c.line}" stroke-width="1" opacity=".5" fill="none">${[100, 112, 124, 136].map((x) => `<path d="M${x} 64 q-6 12 0 24 q6 12 0 24 q-6 12 0 24 q6 12 0 24 q-6 12 0 24"/>`).join('')}</g>`,
    texture: 'knit',
  }),
  hoodie: (c) => ({
    body: 'M92 40 Q88 8 120 6 Q152 8 148 40 L196 54 Q210 62 214 78 L230 182 Q232 196 218 198 L202 198 L184 104 L186 214 Q120 224 54 214 L56 104 L38 198 L22 198 Q8 196 10 182 L26 78 Q30 62 44 54 Z',
    folds: ['M64 116 Q86 164 70 208 L60 208 Z', 'M158 118 Q178 164 168 210 L180 210 Q184 156 166 118 Z'],
    highlights: ['M104 20 Q120 14 136 20 L130 34 Q120 30 110 34 Z'],
    seams: ['M56 196 Q120 206 186 196', 'M24 184 L40 184', 'M200 184 L216 184', 'M80 150 L160 150 L170 190 L70 190 Z'],
    details: `<path d="M100 40 Q120 60 140 40 Q136 22 120 22 Q104 22 100 40 Z" fill="${c.dark}" opacity=".55"/><path d="M112 54 L110 92 M128 54 L130 92" stroke="${c.light}" stroke-width="2.2" stroke-linecap="round"/>`,
    texture: 'knit',
  }),
  jacket: (c) => ({
    body: 'M86 26 L104 18 L120 40 L136 18 L154 26 L198 42 Q210 50 214 66 L232 184 L204 190 L184 100 L186 210 Q120 218 54 210 L56 100 L36 190 L8 184 L26 66 Q30 50 42 42 Z',
    folds: ['M62 110 Q82 156 68 204 L58 204 Z', 'M160 108 Q178 156 170 206 L182 206 Q186 150 168 108 Z'],
    highlights: ['M126 46 L130 208 L136 208 L132 46 Z'],
    seams: ['M120 40 L120 212', 'M56 100 L36 190', 'M184 100 L204 190', 'M66 112 L108 112 L108 146 L66 146 Z', 'M132 112 L174 112 L174 146 L132 146 Z', 'M56 186 Q120 194 186 186'],
    details: `<path d="M104 18 L120 40 L108 66 L88 34 Z M136 18 L120 40 L132 66 L152 34 Z" fill="${c.dark}" stroke="${c.line}" stroke-width="1"/>` +
      `<path d="M66 112 L108 112 L104 124 L70 124 Z M132 112 L174 112 L170 124 L136 124 Z" fill="${c.dark}" opacity=".6"/>` +
      [74, 104, 134, 164].map((y) => `<circle cx="124" cy="${y}" r="3" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`).join(''),
    texture: 'canvas',
  }),
  coat: (c) => ({
    body: 'M88 18 L106 10 L120 48 L134 10 L152 18 L194 32 Q206 40 210 56 L226 200 L200 206 L182 108 L186 238 Q120 246 54 238 L58 108 L40 206 L14 200 L30 56 Q34 40 46 32 Z',
    folds: ['M62 120 Q84 180 70 234 L60 234 Z', 'M158 120 Q178 180 172 236 L184 236 Q186 170 168 120 Z', 'M110 150 Q118 200 112 238 L120 238 Q126 196 118 150 Z'],
    highlights: ['M140 60 Q150 140 146 236 L154 236 Q158 140 148 60 Z'],
    seams: ['M120 48 L114 240', 'M58 108 L40 206', 'M182 108 L200 206', 'M66 158 L98 158', 'M146 158 L178 158', 'M30 186 L46 190', 'M210 186 L194 190'],
    details: `<path d="M106 10 L120 48 L100 92 L80 30 Z M134 10 L120 48 L140 92 L160 30 Z" fill="${c.light}" opacity=".55" stroke="${c.line}" stroke-width="1"/>` +
      [104, 140, 176].map((y) => `<circle cx="104" cy="${y}" r="3.4" fill="${c.dark}"/><circle cx="136" cy="${y}" r="3.4" fill="${c.dark}"/>`).join(''),
    texture: 'twill',
  }),
  blazer: (c) => ({
    body: 'M90 24 L106 16 L120 92 L134 16 L150 24 L194 38 Q206 46 210 62 L226 186 L200 192 L182 104 L184 212 Q120 220 56 212 L58 104 L40 192 L14 186 L30 62 Q34 46 46 38 Z',
    folds: ['M62 116 Q82 164 68 208 L58 208 Z', 'M160 116 Q178 164 170 210 L182 210 Q184 156 168 116 Z'],
    highlights: ['M96 40 L116 96 L110 98 Z'],
    seams: ['M120 92 L120 214', 'M58 104 L40 192', 'M182 104 L200 192', 'M70 160 L100 160', 'M140 160 L170 160', 'M146 70 L166 66'],
    details: `<path d="M106 16 L120 92 L100 70 L86 44 L96 36 Z M134 16 L120 92 L140 70 L154 44 L144 36 Z" fill="${c.light}" opacity=".35" stroke="${c.line}" stroke-width="1.2"/>` +
      `<circle cx="124" cy="132" r="3.4" fill="${c.dark}" stroke="${c.light}" stroke-width=".8"/><circle cx="124" cy="160" r="3.4" fill="${c.dark}" stroke="${c.light}" stroke-width=".8"/>`,
    texture: 'twill',
  }),
  jeans: (c) => ({
    body: 'M72 18 L168 18 L172 40 L184 232 L136 236 L122 96 L118 96 L104 236 L56 232 L68 40 Z',
    folds: ['M80 120 Q90 170 78 228 L70 228 Z', 'M146 110 Q160 170 156 232 L166 232 Q170 160 156 110 Z', 'M120 62 L122 96 L118 96 Z'],
    highlights: ['M96 60 Q104 140 92 230 L100 230 Q112 140 104 60 Z', 'M150 60 Q156 140 150 230 L156 230 Q162 140 156 60 Z'],
    seams: ['M70 32 L170 32', 'M120 32 L120 96', 'M76 40 Q86 60 106 58', 'M164 40 Q154 60 134 58', 'M60 222 L102 224', 'M180 222 L138 224'],
    details: `<circle cx="124" cy="26" r="3" fill="#c9a24a" stroke="${c.line}" stroke-width=".8"/>` + [86, 108, 132, 154].map((x) => `<rect x="${x}" y="16" width="5" height="18" rx="1" fill="${c.dark}"/>`).join(''),
    texture: 'twill',
  }),
  trousers: (c) => ({
    body: 'M76 18 L164 18 L168 36 L184 234 L136 236 L122 90 L118 90 L104 236 L56 234 L72 36 Z',
    folds: ['M84 110 Q92 170 82 230 L74 230 Z', 'M150 104 Q160 170 158 232 L168 232 Q172 160 158 104 Z'],
    highlights: ['M98 40 L92 232 L98 232 L104 40 Z', 'M142 40 L148 232 L154 232 L148 40 Z'],
    seams: ['M74 30 L166 30', 'M120 30 L120 90', 'M100 34 L96 46', 'M140 34 L144 46'],
    details: `<path d="M100 40 L94 232" stroke="${c.light}" stroke-width="1.4" opacity=".7"/><path d="M140 40 L146 232" stroke="${c.light}" stroke-width="1.4" opacity=".7"/>`,
    texture: 'twill',
  }),
  skirt: (c) => ({
    body: 'M84 34 L156 34 L160 52 Q186 130 198 206 Q120 222 42 206 Q54 130 80 52 Z',
    folds: ['M96 60 Q86 130 70 210 L82 212 Q96 130 102 60 Z', 'M138 60 Q150 130 166 210 L178 208 Q160 130 144 60 Z'],
    highlights: ['M116 60 L114 214 L124 214 L122 60 Z'],
    seams: ['M82 48 L158 48', 'M46 198 Q120 212 194 198'],
    details: `<rect x="82" y="30" width="76" height="18" rx="2" fill="${c.dark}" opacity=".35"/><circle cx="148" cy="39" r="2.6" fill="${c.light}"/>`,
    texture: 'twill',
  }),
  dress: (c) => ({
    body: 'M94 18 L104 16 Q120 40 136 16 L146 18 L152 74 Q156 92 150 104 L194 226 Q120 240 46 226 L90 104 Q84 92 88 74 Z',
    folds: ['M100 116 Q86 170 68 226 L82 228 Q98 170 108 116 Z', 'M138 116 Q154 170 174 226 L186 224 Q164 170 146 116 Z', 'M116 130 L112 232 L120 232 Z'],
    highlights: ['M124 112 Q130 170 128 232 L136 232 Q138 170 130 112 Z'],
    seams: ['M90 100 Q120 110 150 100', 'M50 222 Q120 236 190 222'],
    details: `<path d="M104 16 L98 4 M136 16 L142 4" stroke="${c.dark}" stroke-width="2" stroke-linecap="round"/>`,
    texture: 'none',
  }),
  boots: (c) => ({
    body: 'M66 30 Q66 22 74 22 L116 22 Q122 22 122 30 L124 142 Q126 156 140 162 L188 178 Q204 184 206 200 L206 212 L62 212 L60 196 Q60 120 66 30 Z',
    folds: ['M74 40 Q80 90 72 150 L66 150 Q68 90 70 40 Z', 'M104 120 Q112 150 132 164 L120 168 Q104 150 98 120 Z'],
    highlights: ['M96 30 L100 140 L106 140 L104 30 Z', 'M150 170 Q180 178 198 192 L194 196 Q176 184 148 176 Z'],
    seams: ['M66 36 L122 36', 'M62 204 L206 204'],
    details: `<rect x="60" y="204" width="146" height="10" rx="3" fill="${c.dark}"/><rect x="62" y="196" width="34" height="18" rx="2" fill="${c.dark}"/>` +
      `<path d="M120 50 L122 128" stroke="${c.light}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
    texture: 'leather',
  }),
  sneakers: (c) => ({
    extent: [26, 106, 218, 188],
    body: 'M28 168 Q30 134 58 124 Q78 116 98 110 L128 112 Q140 124 158 130 L194 140 Q214 146 216 166 L216 182 L28 182 Z',
    folds: ['M60 140 Q90 150 120 136 L118 144 Q90 158 58 148 Z'],
    highlights: ['M70 124 Q96 114 124 118 L120 124 Q96 120 72 130 Z'],
    seams: ['M28 168 L216 168', 'M98 110 Q110 150 158 130'],
    details: `<rect x="26" y="168" width="192" height="18" rx="6" fill="#f2f0ea" stroke="${c.line}" stroke-width="1.2"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M${106 + i * 9} ${118 + i * 3} l14 -6" stroke="${c.line}" stroke-width="2" stroke-linecap="round"/>`).join('') +
      `<path d="M150 146 Q176 140 196 152" stroke="${c.dark}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`,
    texture: 'leather',
  }),
  loafers: (c) => ({
    extent: [20, 122, 216, 194],
    body: 'M22 178 Q22 156 46 150 Q80 144 104 132 Q118 124 136 126 L184 130 Q206 132 212 152 L214 178 Z',
    folds: ['M40 162 Q80 156 110 146 L112 152 Q80 162 42 170 Z'],
    highlights: ['M54 154 Q84 146 104 136 L106 140 Q84 152 56 158 Z'],
    seams: ['M24 172 L214 172', 'M70 150 Q100 132 126 132'],
    details: `<path d="M120 128 Q164 142 208 136" fill="none" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M92 138 L132 132 L134 144 L96 152 Z" fill="${c.dark}" stroke="${c.line}" stroke-width="1"/><rect x="104" y="138" width="16" height="5" rx="2" fill="${c.base}"/>` +
      `<rect x="20" y="176" width="196" height="9" rx="3" fill="${c.dark}"/><rect x="184" y="176" width="32" height="16" rx="2" fill="${c.dark}"/>`,
    texture: 'leather',
  }),
  tote: (c) => ({
    body: 'M50 92 L190 92 L204 218 Q120 228 36 218 Z',
    folds: ['M60 100 L52 212 L44 212 Z', 'M176 100 L192 212 L198 212 Z'],
    highlights: ['M100 100 L96 216 L104 216 L108 100 Z'],
    seams: ['M50 104 L190 104', 'M40 206 Q120 216 200 206'],
    details: `<path d="M80 92 Q80 32 120 32 Q160 32 160 92" fill="none" stroke="${c.dark}" stroke-width="9" stroke-linecap="round"/><path d="M80 92 Q80 32 120 32 Q160 32 160 92" fill="none" stroke="${c.line}" stroke-width="1" stroke-dasharray="3 3"/>`,
    texture: 'canvas',
    extent: [36, 28, 204, 228],
  }),
  crossbody: (c) => ({
    body: 'M58 122 Q58 110 70 110 L170 110 Q182 110 182 122 L184 198 Q184 210 172 210 L68 210 Q56 210 56 198 Z',
    folds: ['M62 180 Q120 196 178 180 L180 198 Q120 210 60 198 Z'],
    highlights: ['M70 116 L170 116 L168 122 L72 122 Z'],
    seams: ['M64 118 L176 118', 'M62 202 L178 202'],
    extent: [56, 24, 184, 212],
    details: `<path d="M64 114 L120 26 L176 114" fill="none" stroke="${c.dark}" stroke-width="5"/><path d="M58 112 Q120 176 182 112" fill="${c.dark}" opacity=".45"/><rect x="112" y="140" width="16" height="10" rx="2" fill="#c9a24a"/>`,
    texture: 'leather',
  }),
  scarf: (c) => ({
    extent: [64, 18, 176, 240],
    body: 'M66 28 Q120 18 174 28 L176 74 Q150 84 146 92 L160 222 L124 226 L112 96 Q100 82 64 74 Z',
    folds: ['M80 40 Q120 52 160 40 L162 60 Q120 70 78 60 Z', 'M130 100 L140 220 L132 222 Z'],
    highlights: ['M90 32 Q120 26 150 32 L150 36 Q120 32 90 38 Z'],
    seams: [],
    details: [126, 132, 138, 144, 150, 156].map((x, i) => `<path d="M${x - 2} ${222 + (i % 2)} l-2 14" stroke="${c.base}" stroke-width="3" stroke-linecap="round"/>`).join(''),
    texture: 'knit',
  }),
  cap: (c) => ({
    body: 'M46 146 Q50 70 120 64 Q190 70 194 146 Z',
    folds: ['M60 140 Q66 96 96 78 L100 84 Q74 102 70 140 Z'],
    highlights: ['M110 70 Q140 70 160 88 L156 92 Q138 78 112 76 Z'],
    seams: ['M120 64 L120 146', 'M84 70 Q100 110 96 146', 'M156 70 Q140 110 144 146'],
    details: `<path d="M150 140 Q200 136 232 150 Q228 166 200 164 L150 158 Z" fill="${c.dark}"/><circle cx="120" cy="64" r="4" fill="${c.dark}"/>`,
    texture: 'twill',
    extent: [46, 60, 234, 166],
  }),
  belt: (c) => ({
    extent: [8, 100, 232, 152],
    body: 'M14 112 L226 112 Q232 112 232 118 L232 136 Q232 142 226 142 L14 142 Q8 142 8 136 L8 118 Q8 112 14 112 Z',
    folds: [],
    highlights: ['M14 115 L226 115 L226 118 L14 118 Z'],
    seams: ['M14 117 L226 117', 'M14 137 L226 137'],
    details: `<rect x="86" y="104" width="44" height="46" rx="5" fill="none" stroke="#c9a24a" stroke-width="5"/><path d="M108 108 L108 146" stroke="#c9a24a" stroke-width="4"/>` +
      [150, 164, 178, 192].map((x) => `<circle cx="${x}" cy="127" r="2.4" fill="${c.dark}"/>`).join(''),
    texture: 'leather',
  }),
};

function texture(kind: Parts['texture'], c: { line: string; light: string }) {
  switch (kind) {
    case 'knit': return `<pattern id="tx" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 q2 -4 4 0 q2 4 4 0" fill="none" stroke="${c.line}" stroke-width=".7" opacity=".35"/></pattern>`;
    case 'twill': return `<pattern id="tx" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="${c.line}" stroke-width=".6" opacity=".22"/></pattern>`;
    case 'canvas': return `<pattern id="tx" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 2 H4 M2 0 V4" stroke="${c.line}" stroke-width=".4" opacity=".2"/></pattern>`;
    case 'leather': return `<pattern id="tx" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".7" fill="${c.light}" opacity=".18"/><circle cx="8" cy="7" r=".6" fill="${c.light}" opacity=".14"/></pattern>`;
    default: return '';
  }
}

export function garmentSvg(shape: Shape, color: string, accent?: string, stripes = false, uid: string = shape): string {
  const base = color;
  const dark = shade(base, -0.28), light = shade(base, 0.28);
  const isDark = lum(base) < 0.3;
  const line = isDark ? shade(base, 0.35) : shade(base, -0.42);
  const acc = accent ?? dark;
  const c = { base, dark, light, line, acc };
  const p = P[shape](c);
  const id = (s: string) => `${s}-${uid}`;
  let box = p.extent;
  if (!box) {
    const nums = (p.body.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
    box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  const [x0, y0, x1, y1] = box;
  const bw = x1 - x0, bh = y1 - y0 + 18; // room for floor shadow
  const side = Math.max(bw, bh) * 1.12;
  const vx = (x0 + x1) / 2 - side / 2, vy = y0 + bh / 2 - side / 2;
  const shadow = `<ellipse cx="${(x0 + x1) / 2}" cy="${y1 + 9}" rx="${bw * 0.46}" ry="${Math.max(4, bw * 0.035)}" fill="url(#sh-${uid})"/>`;
  const tex = texture(p.texture, c).replace('id="tx"', `id="${id('tx')}"`);
  const stripeDef = stripes ? `<pattern id="${id('st')}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${base}"/><rect y="13" width="22" height="9" fill="${acc}"/></pattern>` : '';
  const fill = stripes ? `url(#${id('st')})` : `url(#${id('g')})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}">
<defs>
<linearGradient id="${id('g')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<linearGradient id="${id('v')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<radialGradient id="${id('sh')}"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<clipPath id="${id('c')}"><path d="${p.body}"/></clipPath>
${tex}${stripeDef}
</defs>
${shadow}
<g transform="translate(2 4)" opacity=".18"><path d="${p.body}" fill="#000"/></g>
<path d="${p.body}" fill="${fill}"/>
<g clip-path="url(#${id('c')})">
${tex ? `<rect x="-50" y="-50" width="340" height="360" fill="url(#${id('tx')})"/>` : ''}
<rect x="${x0}" y="${y0}" width="${bw}" height="${y1 - y0}" fill="url(#${id('v')})"/>
${(p.folds ?? []).map((d) => `<path d="${d}" fill="#000" opacity=".13"/>`).join('')}
${(p.highlights ?? []).map((d) => `<path d="${d}" fill="#fff" opacity=".13"/>`).join('')}
${(p.seams ?? []).map((d) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="1.1" stroke-dasharray="3.2 2.6" opacity=".75"/>`).join('')}
</g>
<path d="${p.body}" fill="none" stroke="${line}" stroke-width="1.4" stroke-linejoin="round" opacity=".9"/>
${p.details ?? ''}
</svg>`;
}
