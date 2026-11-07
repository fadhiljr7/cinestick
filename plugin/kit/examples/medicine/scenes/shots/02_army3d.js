// shots/02_army3d.js — s08: "An army of bacteria invaded my body, multiplying rapidly."
// 3D fly-through down a red tissue tunnel; low-poly green germs (capsules with eyes) double in number as we fly.
import { E, V, S, registerShot, mood, ease, prog, rng, clamp, alpha } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import { GREEN } from '../cast.js';

registerShot('s08', {
  kind: '3d',
  init(T) {
    const { THREE } = T, M = mood('body');
    const st = T.stage({ mood: 'body', fov: V(40, 60), fog: [6, 34], fogColor: '#2a0610', keyPos: [0, 6, 4], keyColor: '#ffc8b8', keyIntensity: 1.6, ambient: 1.6, ambientSky: '#ff9fb0', bloom: 0.5 });
    // tunnel: a long open cylinder seen from inside, with tissue rings drawn in code
    const tex = T.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#7a1f30'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? 'rgba(255,150,170,.18)' : 'rgba(40,4,12,.35)'; g.fillRect(0, i * h / 9, w, h / 18); } g.strokeStyle = 'rgba(42,34,51,.6)'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, i * h / 9); g.lineTo(w, i * h / 9 + 20); g.stroke(); } }, [6, 10]);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 80, 28, 1, true), T.mat('#ffffff', { map: tex, side: THREE.BackSide, roughness: 0.6 }));
    tube.rotation.x = Math.PI / 2; tube.position.set(0, 2.6, -30); tube.receiveShadow = true; st.add(tube);
    st.add(T.ground(9, 80, M.floor)).position.set(0, 0, -30);
    // drifting blood cells
    const r = rng(7), cells = [];
    for (let i = 0; i < 40; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.14, 8, 16), T.mat('#d8344a', { roughness: 0.4 })); c.position.set((r() - 0.5) * 6, 0.8 + r() * 4, -r() * 60); c.rotation.set(r() * 3, r() * 3, 0); st.add(c); cells.push({ m: c, sp: 0.3 + r() * 0.6 }); }
    // germ army: 256 germs, revealed in doubling generations
    const gm = T.mat('#14101a', { roughness: 0.7 }), shell = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN), side: THREE.BackSide }), wm = T.basic('#f4efe6'), km = T.basic('#0e0b12');
    const capsule = new THREE.CapsuleGeometry(0.32, 0.5, 4, 10), eye = new THREE.SphereGeometry(0.09, 10, 8), pup = new THREE.SphereGeometry(0.045, 8, 6);
    const germs = [];
    for (let i = 0; i < 256; i++) {
      const grp = new THREE.Group(); const b = new THREE.Mesh(capsule, gm); b.castShadow = true; b.position.y = 0.6; grp.add(b); const sh = new THREE.Mesh(capsule, shell); sh.scale.setScalar(1.12); sh.position.y = 0.6; grp.add(sh);
      for (const sx of [-0.12, 0.12]) { const e = new THREE.Mesh(eye, wm); e.position.set(sx, 0.78, 0.29); grp.add(e); }
      grp.position.set((r() - 0.5) * 6.4, 0, -2 - r() * 34); grp.rotation.y = (r() - 0.5) * 0.8; grp.userData = { born: Math.floor(Math.log2(i + 1)), ph: r() * 6 };
      grp.visible = false; st.add(grp); germs.push(grp);
    }
    return { stage: st, germs, cells };
  },
  draw(s, t, info, T) {
    const gen = Math.floor(clamp(t / info.dur * 1.15) * 8.99);      // 0..8 → 1..256 germs
    s.germs.forEach((g, i) => { const b = g.userData.born; g.visible = b <= gen; const k = clamp((t - b * info.dur / 9 / 1.15) * 6); g.scale.setScalar(g.visible ? 0.3 + 0.7 * ease.outBack(k) : 0.01); g.position.y = Math.abs(Math.sin(t * 6 + g.userData.ph)) * 0.12; });
    s.cells.forEach(c => { c.m.rotation.x += 0.01; c.m.position.y += Math.sin(t + c.sp) * 0.002; });
    T.dolly(s.stage.camera, t, [[0, { pos: [0.4, 2.0, 6], look: [0, 1.2, -6], fov: V(40, 60) }], [info.dur, { pos: [-0.3, 1.5, -6], look: [0, 0.9, -20], fov: V(40, 60) }]]);
  },
  overlay(g, t, info) {
    const gen = Math.floor(clamp(t / info.dur * 1.15) * 8.99), n = 2 ** gen;
    UI.badge(g, { str: '×' + n.toLocaleString('en-US'), x: E.W - V(90, 80), y: V(130, 220), size: V(64, 92), color: S().ui.gold });
  },
});
