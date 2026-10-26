import './style.css';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.querySelector('#hero-stage');
const canvas = document.querySelector('#cosmos');
const fallback = document.querySelector('#scene-fallback');

async function buildCosmicScene() {
  const THREE = await import('three');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 1.5,
      powerPreference: 'low-power'
    });
  } catch (error) {
    fallback.hidden = false;
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 80);
  camera.position.set(0, 1.35, 8.4);
  camera.lookAt(0, 0, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 620 ? 1.15 : 1.55));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  scene.add(new THREE.HemisphereLight(0xffe1e0, 0x54223f, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffe6c5, 3.2);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);
  const pinkRim = new THREE.PointLight(0xd65e92, 30, 16);
  pinkRim.position.set(3, 1, -2);
  scene.add(pinkRim);
  const softFill = new THREE.PointLight(0x8075d9, 13, 12);
  softFill.position.set(-4, -1, 1);
  scene.add(softFill);

  const starPositions = [];
  const starCount = innerWidth < 620 ? 105 : 185;
  for (let i = 0; i < starCount; i++) {
    const a = i * 2.399;
    const radius = 2.4 + ((i * 37) % 100) / 31;
    starPositions.push(Math.cos(a) * radius, ((i * 17) % 60 - 30) / 10, -2 - ((i * 13) % 45) / 9);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
    color: 0xffd8dc, size: innerWidth < 620 ? 0.025 : 0.034, transparent: true, opacity: 0.82,
    sizeAttenuation: true
  }));
  scene.add(stars);

  const sun = new THREE.Group();
  sun.position.set(2.15, 1.12, -1.65);
  scene.add(sun);
  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 28, 20),
    new THREE.MeshStandardMaterial({color: 0xf1c76d, emissive: 0xf6a94b, emissiveIntensity: 1.4, roughness: 0.36, metalness: 0.05})
  );
  sun.add(sunCore);
  const sunRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.013, 6, 76),
    new THREE.MeshBasicMaterial({color: 0xffdca1, transparent: true, opacity: 0.75})
  );
  sunRing.rotation.x = 0.95;
  sun.add(sunRing);
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const ctx = glowCanvas.getContext('2d');
  const glow = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  glow.addColorStop(0, 'rgba(255,216,144,.66)');
  glow.addColorStop(.25, 'rgba(245,150,163,.26)');
  glow.addColorStop(1, 'rgba(245,150,163,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  sunHalo.scale.set(3.5, 3.5, 1);
  sun.add(sunHalo);

  const orbit = new THREE.Group();
  orbit.position.set(-1.58, 0.36, -0.48);
  scene.add(orbit);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 28, 20),
    new THREE.MeshStandardMaterial({color: 0x9e6caa, roughness: 0.62, metalness: 0.08, emissive: 0x321b43, emissiveIntensity: 0.35})
  );
  orbit.add(planet);
  const planetBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.055, 7, 80),
    new THREE.MeshStandardMaterial({color: 0xf2b7c8, roughness: 0.35, metalness: 0.35})
  );
  planetBand.rotation.x = 1.23;
  planet.add(planetBand);
  const smallMoon = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 16, 12),
    new THREE.MeshStandardMaterial({color: 0xf3d593, roughness: 0.48})
  );
  orbit.add(smallMoon);

  const solar = new THREE.Group();
  solar.position.set(-0.08, -1.12, 0.05);
  solar.rotation.x = -0.14;
  scene.add(solar);
  const frameMaterial = new THREE.MeshStandardMaterial({color: 0x472743, roughness: 0.42, metalness: 0.62});
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x695179, roughness: 0.29, metalness: 0.56, emissive: 0x261934, emissiveIntensity: 0.24
  });
  const cellLineMaterial = new THREE.LineBasicMaterial({color: 0xf4c6d6, transparent: true, opacity: 0.75});
  const legGeometry = new THREE.CylinderGeometry(0.018, 0.024, 0.48, 6);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const panel = new THREE.Group();
      panel.position.set((col - 1) * 1.17, (row - 0.5) * 0.5, row * -0.56);
      panel.rotation.x = -0.22;
      const plate = new THREE.Mesh(new THREE.BoxGeometry(1.03, 0.055, 0.52), frameMaterial);
      panel.add(plate);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.44), panelMaterial);
      face.rotation.x = -Math.PI / 2;
      face.position.y = 0.031;
      panel.add(face);
      const vertices = [];
      for (let x = 1; x < 4; x++) {
        const px = -0.47 + x * 0.94 / 4;
        vertices.push(px, 0.034, -0.22, px, 0.034, 0.22);
      }
      for (let z = 1; z < 2; z++) {
        const pz = -0.22 + z * 0.44 / 2;
        vertices.push(-0.47, 0.034, pz, 0.47, 0.034, pz);
      }
      const gridGeometry = new THREE.BufferGeometry();
      gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      panel.add(new THREE.LineSegments(gridGeometry, cellLineMaterial));
      for (const x of [-0.37, 0.37]) {
        const leg = new THREE.Mesh(legGeometry, frameMaterial);
        leg.position.set(x, -0.24, 0.17);
        panel.add(leg);
      }
      solar.add(panel);
    }
  }
  const groundLine = new THREE.Mesh(
    new THREE.TorusGeometry(2.65, 0.012, 5, 90),
    new THREE.MeshBasicMaterial({color: 0xffd3dc, transparent: true, opacity: 0.6})
  );
  groundLine.rotation.x = Math.PI / 2;
  groundLine.position.set(0, -1.45, 0);
  solar.add(groundLine);

  const pebbleMaterial = new THREE.MeshStandardMaterial({color: 0xe38ba0, roughness: 0.5, metalness: 0.12});
  const pebble = new THREE.Mesh(new THREE.IcosahedronGeometry(0.19, 1), pebbleMaterial);
  pebble.position.set(1.35, -0.25, 0.8);
  scene.add(pebble);
  const pebbleRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.018, 5, 36), new THREE.MeshStandardMaterial({color:0xffdfa4, metalness:.25, roughness:.4}));
  pebbleRing.rotation.set(0.8, 0.2, -0.3);
  pebble.add(pebbleRing);

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderer.render(scene, camera);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let scrollProgress = 0, visible = false, raf = 0;
  if (!reducedMotion) {
    stage.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -0.42;
    });
    stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    window.addEventListener('scroll', () => {
      const rect = stage.getBoundingClientRect();
      scrollProgress = THREE.MathUtils.clamp(-rect.top / Math.max(innerHeight * 0.8, 1), 0, 1);
    }, {passive: true});
  }

  const renderOnce = () => renderer.render(scene, camera);
  const animate = time => {
    raf = 0;
    if (!visible || document.hidden || reducedMotion) return;
    const t = time * 0.001;
    pointerX += (targetX - pointerX) * 0.035;
    pointerY += (targetY - pointerY) * 0.035;
    camera.position.x += (pointerX - camera.position.x) * 0.026;
    const desiredY = 1.35 + pointerY + scrollProgress * 0.28;
    camera.position.y += (desiredY - camera.position.y) * 0.035;
    const desiredZ = 8.4 + scrollProgress * 0.72;
    camera.position.z += (desiredZ - camera.position.z) * 0.026;
    camera.lookAt(0, -0.1, 0);
    sun.rotation.y = t * 0.11;
    sunRing.rotation.z = Math.sin(t * 0.18) * 0.09;
    orbit.rotation.y = t * 0.19;
    orbit.rotation.z = Math.sin(t * 0.3) * 0.08;
    const moonAngle = t * 0.42;
    smallMoon.position.set(Math.cos(moonAngle) * 0.83, Math.sin(moonAngle * 0.7) * 0.2, Math.sin(moonAngle) * 0.83);
    planet.rotation.y += 0.002;
    solar.rotation.y = Math.sin(t * 0.2) * 0.045;
    pebble.rotation.x = Math.sin(t * 0.34) * 0.23;
    pebble.rotation.y += 0.003;
    stars.rotation.y = t * 0.008;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };
  const play = () => {
    visible = true;
    if (reducedMotion) renderOnce();
    else if (!raf && !document.hidden) raf = requestAnimationFrame(animate);
  };
  const pause = () => { visible = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  const visibilityObserver = new IntersectionObserver(entries => entries[0].isIntersecting ? play() : pause(), {threshold: 0.04});
  visibilityObserver.observe(stage);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : (visible = false, visibilityObserver.takeRecords(), play()));
  if (reducedMotion) renderOnce();
}
const startScene = () => buildCosmicScene().catch(() => { fallback.hidden = false; });
if ('requestIdleCallback' in window) requestIdleCallback(startScene, { timeout: 1200 });
else setTimeout(startScene, 100);

const projectDetails = {
  batterywise: {
    kicker: '01 / Energy simulation · open source · MIT',
    title: 'BatteryWise',
    copy: 'An hourly solar-plus-storage simulator built with Python and JavaScript. It uses 8,784 validated hours of Great Britain 2024 grid data, and both models are checked against a shared test fixture. In one 40% solar scenario, a 10 GWh / 5 GW battery recovers about 2.1 TWh of curtailed solar a year. This is a scenario result from a transparent simulation, not an installed or deployed grid-storage system.',
    stack: ['Python','JavaScript','NumPy','Pandas','Validated hourly data'],
    link: 'https://illmaahh.github.io/batterywise', linkLabel: 'Open the BatteryWise simulator ↗',
    note: 'Scenario outputs depend on the assumptions and inputs used in the model.'
  },
  mindbridge: {
    kicker: '02 / Live deployment · multi-agent system',
    title: 'MindBridge-AI',
    copy: 'A multi-agent wellness assistant. I wrote its Python and FastAPI API layer and agent hand-off logic, deployed the service, and maintain and debug it independently.',
    stack: ['Python','FastAPI','Multi-agent systems','Live deployment'],
    note: 'The CV confirms a live deployment but does not list a public demo URL.'
  },
  cbas: {
    kicker: '03 / Computer vision · open source · MIT',
    title: 'CBAS-AI',
    copy: 'A real-time computer-vision pipeline exploring cognitive-load estimation from four signals: facial expression, gaze, hand, and posture. It serves a browser dashboard through a FastAPI backend.',
    stack: ['Python','FastAPI','Computer vision','Four visual signals'],
    link: 'https://github.com/illmaahh/CBAS-AI', linkLabel: 'View the CBAS-AI repository ↗'
  },
  airaware: {
    kicker: '04 / Climate data · live web application',
    title: 'AirAware',
    copy: 'A TypeScript application comparing CO₂ across seven commuting modes. The emissions are formula-calculated, with Open-Meteo and CPCB air-quality data.',
    stack: ['TypeScript','Gemini API','Open-Meteo','CPCB AQI','Seven travel modes'],
    link: 'https://air-aware-web-sul9.vercel.app', linkLabel: 'Open AirAware ↗'
  },
  cineai: {
    kicker: '05 / Recommendation systems',
    title: 'CineAI',
    copy: 'A movie recommender combining content-based and collaborative filtering.',
    stack: ['Content-based filtering','Collaborative filtering'],
    note: 'A public project URL was not listed in the CV.'
  },
  eldervr: {
    kicker: '06 / Accessible healthcare · prototype',
    title: 'ElderVR',
    copy: 'A large-text healthcare dashboard prototype designed for older adults.',
    stack: ['Accessible interface','Healthcare dashboard prototype'],
    link: 'https://github.com/illmaahh/ElderVR', linkLabel: 'View the ElderVR repository ↗'
  }
};

const dialog = document.querySelector('#project-dialog');
const dialogKicker = document.querySelector('#dialog-kicker');
const dialogTitle = document.querySelector('#dialog-title');
const dialogCopy = document.querySelector('#dialog-copy');
const dialogStack = document.querySelector('#dialog-stack');
const dialogLink = document.querySelector('#dialog-link');
const dialogNote = document.querySelector('#dialog-note');

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    const item = projectDetails[button.dataset.open];
    if (!item) return;
    dialogKicker.textContent = item.kicker;
    dialogTitle.textContent = item.title;
    dialogCopy.textContent = item.copy;
    dialogStack.replaceChildren(...item.stack.map(label => {
      const tag = document.createElement('span'); tag.textContent = label; return tag;
    }));
    if (item.link) { dialogLink.href = item.link; dialogLink.textContent = item.linkLabel; dialogLink.hidden = false; }
    else { dialogLink.removeAttribute('href'); dialogLink.hidden = true; }
    dialogNote.textContent = item.note || '';
    dialog.showModal();
  });
});
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project-card')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
  const category = button.dataset.filter;
  projects.forEach(card => { card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category); });
}));

const menu = document.querySelector('#menu-toggle');
const nav = document.querySelector('#nav-links');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation');
}));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
}), {threshold: 0.09});
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
