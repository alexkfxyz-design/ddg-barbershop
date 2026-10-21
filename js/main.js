/* =========================================
   DDG Barbershop — lógica de la página
   Edita CONFIG para cambiar datos del negocio
   ========================================= */
const CONFIG = {
  whatsapp: '51999999999',            // número con código de país, sin "+" ni espacios
  telefono: '+51 999 999 999',
  direccion: 'Av. Ejemplo 123, Arequipa',
  mapa: 'Plaza de Armas, Arequipa',   // texto que se busca en Google Maps
  intervaloMin: 30,                   // minutos entre turnos
  // 0 = domingo ... 6 = sábado  →  [abre, cierra] en formato 24 h, null = cerrado
  horario: {
    1: ['09:00', '21:00'], 2: ['09:00', '21:00'], 3: ['09:00', '21:00'],
    4: ['09:00', '21:00'], 5: ['09:00', '21:00'], 6: ['09:00', '21:00'],
    0: ['09:00', '14:00'],
  },
};

const SERVICIOS = [
  { id: 'clasico', cat: 'corte', icon: '✂️', nombre: 'Corte clásico', precio: 20, min: 30, desc: 'Tijera y máquina, acabado con navaja y peinado.' },
  { id: 'fade', cat: 'corte', icon: '💈', nombre: 'Fade / Degradado', precio: 25, min: 40, desc: 'Low, mid, high o skin fade con transición limpia.', tag: 'Más pedido' },
  { id: 'diseno', cat: 'corte', icon: '⚡', nombre: 'Corte + diseño', precio: 30, min: 50, desc: 'Fade con líneas o figura a mano alzada.' },
  { id: 'nino', cat: 'corte', icon: '🧒', nombre: 'Corte niño', precio: 15, min: 30, desc: 'Para los reyes de la casa, hasta 12 años.' },
  { id: 'barba', cat: 'barba', icon: '🧔', nombre: 'Perfilado de barba', precio: 15, min: 20, desc: 'Contorno con navaja, recorte y aceite.' },
  { id: 'ritual', cat: 'barba', icon: '🔥', nombre: 'Ritual toalla caliente', precio: 25, min: 35, desc: 'Toalla caliente, afeitado a navaja y bálsamo.' },
  { id: 'rey', cat: 'combo', icon: '👑', nombre: 'Combo Rey', precio: 40, min: 60, desc: 'Fade + barba + cejas + lavado. El paquete completo.', tag: 'Ahorra S/ 10' },
  { id: 'express', cat: 'combo', icon: '⏱️', nombre: 'Combo Express', precio: 32, min: 45, desc: 'Corte clásico + perfilado de barba.' },
  { id: 'cejas', cat: 'extra', icon: '〰️', nombre: 'Cejas', precio: 8, min: 10, desc: 'Perfilado con navaja.' },
  { id: 'tinte', cat: 'extra', icon: '🎨', nombre: 'Tinte / Platinado', precio: 60, min: 90, desc: 'Decoloración y matiz. Precio desde.' },
];

const BARBEROS = [
  { id: 'cualquiera', nombre: 'Cualquiera' },
  { id: 'dante', nombre: 'Dante', rol: 'Barbero master', bio: 'Especialista en fades y diseños. 8 años en la silla.' },
  { id: 'gabriel', nombre: 'Gabriel', rol: 'Barbero', bio: 'Cortes clásicos, tijera y rituales de barba.' },
  { id: 'kevin', nombre: 'Kevin', rol: 'Barbero', bio: 'Tendencias urbanas, mullets y platinados.' },
];

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const STORAGE_KEY = 'ddg_reservas';

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const fmtHora = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`; };
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fechaLarga = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }); };
const waUrl = (texto) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

function leerReservas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function guardarReservas(lista) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Navegación ---------- */
const nav = $('#nav'), navLinks = $('#navLinks'), navToggle = $('#navToggle');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
navToggle.addEventListener('click', () => { navToggle.classList.toggle('open'); navLinks.classList.toggle('open'); });
$$('a', navLinks).forEach((a) => a.addEventListener('click', () => { navToggle.classList.remove('open'); navLinks.classList.remove('open'); }));

/* ---------- Abierto / cerrado ---------- */
function estadoAbierto() {
  const ahora = new Date(); const h = CONFIG.horario[ahora.getDay()];
  const el = $('#openStatus'); const min = ahora.getHours() * 60 + ahora.getMinutes();
  if (h && min >= toMin(h[0]) && min < toMin(h[1])) {
    el.textContent = `Abierto ahora · cierra a las ${fmtHora(h[1])}`; el.style.setProperty('--dot', '#3ddc84');
  } else {
    el.textContent = 'Cerrado ahora · reserva para tu próxima visita'; el.style.setProperty('--dot', '#ff5566');
  }
}

/* ---------- Servicios ---------- */
function pintarServicios(cat = 'todos') {
  const grid = $('#servicesGrid');
  grid.innerHTML = SERVICIOS.filter((s) => cat === 'todos' || s.cat === cat).map((s, i) => `
    <article class="service" style="animation-delay:${i * 50}ms">
      ${s.tag ? `<span class="service__tag">${s.tag}</span>` : ''}
      <div class="service__icon">${s.icon}</div>
      <div class="service__top"><h4>${s.nombre}</h4><span class="service__price">S/ ${s.precio}</span></div>
      <p>${s.desc}</p>
      <div class="service__foot">
        <span class="service__time">⏱ ${s.min} min</span>
        <button class="btn btn--ghost btn--sm" data-reservar="${s.id}">Reservar</button>
      </div>
    </article>`).join('');
}
$('#serviceTabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab'); if (!b) return;
  $$('.tab').forEach((t) => t.classList.toggle('active', t === b));
  pintarServicios(b.dataset.cat);
});
$('#servicesGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-reservar]'); if (!b) return;
  $('#fService').value = b.dataset.reservar; actualizarResumen();
  $('#reservar').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Equipo ---------- */
function pintarEquipo() {
  $('#teamGrid').innerHTML = BARBEROS.filter((b) => b.id !== 'cualquiera').map((b) => `
    <article class="barber reveal">
      <div class="barber__avatar"><span>${b.nombre[0]}</span></div>
      <h4>${b.nombre}</h4>
      <div class="barber__role">${b.rol}</div>
      <p>${b.bio}</p>
      <button class="btn btn--ghost btn--sm" data-barbero="${b.id}">Reservar con ${b.nombre}</button>
    </article>`).join('');
}
$('#teamGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-barbero]'); if (!b) return;
  elegirBarbero(b.dataset.barbero);
  $('#reservar').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Formulario de reserva ---------- */
const estado = { barbero: 'cualquiera', hora: null };

function iniciarFormulario() {
  $('#fService').innerHTML = '<option value="">Selecciona un servicio</option>' +
    SERVICIOS.map((s) => `<option value="${s.id}">${s.nombre} — S/ ${s.precio}</option>`).join('');
  $('#barberChips').innerHTML = BARBEROS.map((b) =>
    `<button type="button" class="chip${b.id === 'cualquiera' ? ' active' : ''}" data-id="${b.id}">${b.nombre}</button>`).join('');

  const hoy = new Date(); const max = new Date(); max.setDate(hoy.getDate() + 30);
  $('#fDate').min = isoLocal(hoy); $('#fDate').max = isoLocal(max);

  $('#barberChips').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) elegirBarbero(c.dataset.id); });
  $('#fService').addEventListener('change', actualizarResumen);
  $('#fDate').addEventListener('change', () => { estado.hora = null; pintarHorarios(); actualizarResumen(); });
  $('#fPhone').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^\d ]/g, ''); });
  $('#slots').addEventListener('click', (e) => {
    const s = e.target.closest('.slot'); if (!s || s.disabled) return;
    estado.hora = s.dataset.h; $$('.slot').forEach((x) => x.classList.toggle('active', x === s)); actualizarResumen();
  });
  $('#bookingForm').addEventListener('submit', confirmarReserva);
}

function elegirBarbero(id) {
  estado.barbero = id;
  $$('.chip').forEach((c) => c.classList.toggle('active', c.dataset.id === id));
  if ($('#fDate').value) { estado.hora = null; pintarHorarios(); }
  actualizarResumen();
}

// Ocupación simulada (siempre igual para la misma fecha) para que la agenda luzca real
function ocupadoSimulado(fecha, hora, barbero) {
  const str = fecha + hora + barbero; let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 100 < 22;
}

function pintarHorarios() {
  const fecha = $('#fDate').value; const cont = $('#slots');
  if (!fecha) { cont.innerHTML = '<p class="muted">Primero elige una fecha.</p>'; return; }
  const [y, m, d] = fecha.split('-').map(Number); const dia = new Date(y, m - 1, d).getDay();
  const h = CONFIG.horario[dia];
  if (!h) { cont.innerHTML = '<p class="muted">Ese día estamos cerrados. Elige otra fecha.</p>'; return; }

  const esHoy = fecha === isoLocal(new Date()); const ahora = new Date().getHours() * 60 + new Date().getMinutes();
  const reservas = leerReservas().filter((r) => r.fecha === fecha);
  let html = '';
  for (let t = toMin(h[0]); t < toMin(h[1]); t += CONFIG.intervaloMin) {
    const hh = toHHMM(t);
    const pasado = esHoy && t <= ahora + 15;
    const tomado = reservas.some((r) => r.hora === hh && (estado.barbero === 'cualquiera' || r.barbero === estado.barbero || r.barbero === 'cualquiera'));
    const off = pasado || tomado || ocupadoSimulado(fecha, hh, estado.barbero);
    html += `<button type="button" class="slot" data-h="${hh}" ${off ? 'disabled' : ''}>${fmtHora(hh)}</button>`;
  }
  cont.innerHTML = html;
  if (!$('.slot:not(:disabled)', cont)) cont.innerHTML = '<p class="muted">No quedan horarios para esta fecha. Prueba otro día.</p>';
}

function actualizarResumen() {
  const s = SERVICIOS.find((x) => x.id === $('#fService').value);
  const b = BARBEROS.find((x) => x.id === estado.barbero);
  $('#sumService').textContent = s ? s.nombre : '—';
  $('#sumBarber').textContent = b ? b.nombre : '—';
  $('#sumDate').textContent = $('#fDate').value ? fechaLarga($('#fDate').value) : '—';
  $('#sumTime').textContent = estado.hora ? fmtHora(estado.hora) : '—';
  $('#sumPrice').textContent = `S/ ${s ? s.precio : 0}`;
}

function confirmarReserva(e) {
  e.preventDefault();
  const err = $('#formError'); err.textContent = '';
  $$('.invalid').forEach((x) => x.classList.remove('invalid'));
  const nombre = $('#fName').value.trim(); const tel = $('#fPhone').value.replace(/\s/g, '');
  const faltas = [];
  if (!$('#fService').value) { faltas.push('servicio'); $('#fService').classList.add('invalid'); }
  if (!$('#fDate').value) { faltas.push('fecha'); $('#fDate').classList.add('invalid'); }
  if (!estado.hora) faltas.push('hora');
  if (nombre.length < 2) { faltas.push('nombre'); $('#fName').classList.add('invalid'); }
  if (!/^9\d{8}$/.test(tel)) { faltas.push('celular válido (9 dígitos)'); $('#fPhone').classList.add('invalid'); }
  if (faltas.length) { err.textContent = `Falta completar: ${faltas.join(', ')}.`; return; }

  const s = SERVICIOS.find((x) => x.id === $('#fService').value);
  const b = BARBEROS.find((x) => x.id === estado.barbero);
  const reserva = {
    codigo: 'DDG-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    servicio: s.nombre, precio: s.precio, barbero: b.id, barberoNombre: b.nombre,
    fecha: $('#fDate').value, hora: estado.hora, nombre, tel, nota: $('#fNote').value.trim(),
  };
  const lista = leerReservas(); lista.push(reserva); guardarReservas(lista);
  mostrarTicket(reserva);

  e.target.reset(); estado.hora = null; elegirBarbero('cualquiera');
  $('#slots').innerHTML = '<p class="muted">Primero elige una fecha.</p>';
  actualizarResumen(); contarReservas();
}

function mensajeWa(r) {
  return `Hola DDG Barbershop 💈 Quiero confirmar mi reserva:\n` +
    `• Código: ${r.codigo}\n• Servicio: ${r.servicio} (S/ ${r.precio})\n• Barbero: ${r.barberoNombre}\n` +
    `• Fecha: ${fechaLarga(r.fecha)}\n• Hora: ${fmtHora(r.hora)}\n• Nombre: ${r.nombre}` +
    (r.nota ? `\n• Nota: ${r.nota}` : '');
}

function mostrarTicket(r) {
  $('#ticket').innerHTML = `
    <div class="ticket__check">✓</div>
    <h3>¡Reserva lista!</h3>
    <p class="ticket__code">${r.codigo}</p>
    <div class="ticket__body">
      <div class="summary__row"><span>Cliente</span><b>${r.nombre}</b></div>
      <div class="summary__row"><span>Servicio</span><b>${r.servicio}</b></div>
      <div class="summary__row"><span>Barbero</span><b>${r.barberoNombre}</b></div>
      <div class="summary__row"><span>Fecha</span><b>${fechaLarga(r.fecha)}</b></div>
      <div class="summary__row"><span>Hora</span><b>${fmtHora(r.hora)}</b></div>
      <div class="summary__row summary__total"><span>Total</span><b>S/ ${r.precio}</b></div>
    </div>`;
  $('#ticketWa').href = waUrl(mensajeWa(r));
  abrirModal('#confirmModal');
}

/* ---------- Mis reservas ---------- */
function contarReservas() { $('#bookingCount').textContent = leerReservas().length; }
function pintarMisReservas() {
  const lista = leerReservas().sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  $('#bookingList').innerHTML = lista.length ? lista.map((r) => `
    <div class="booking-item">
      <div><b>${r.servicio}</b><small>${fechaLarga(r.fecha)} · ${fmtHora(r.hora)} · ${r.barberoNombre}</small><small>${r.codigo}</small></div>
      <button data-cancel="${r.codigo}">Cancelar</button>
    </div>`).join('') : '<p class="muted" style="margin-top:12px">Aún no tienes reservas.</p>';
}
$('#openMyBookings').addEventListener('click', () => { pintarMisReservas(); abrirModal('#listModal'); });
$('#bookingList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cancel]'); if (!b) return;
  guardarReservas(leerReservas().filter((r) => r.codigo !== b.dataset.cancel));
  pintarMisReservas(); contarReservas(); if ($('#fDate').value) pintarHorarios();
  toast('Reserva cancelada');
});

/* ---------- Modales ---------- */
function abrirModal(sel) { $(sel).classList.add('open'); $(sel).setAttribute('aria-hidden', 'false'); }
$$('.modal').forEach((m) => m.addEventListener('click', (e) => {
  if (e.target === m || e.target.closest('[data-close]')) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }
}));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal.open').forEach((m) => m.classList.remove('open')); });

/* ---------- Contacto ---------- */
function pintarContacto() {
  const hoy = new Date().getDay();
  $('#hoursList').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = CONFIG.horario[d];
    return `<li class="${d === hoy ? 'today' : ''}"><span>${DIAS[d]}</span><span>${h ? `${fmtHora(h[0])} – ${fmtHora(h[1])}` : 'Cerrado'}</span></li>`;
  }).join('');
  $('#cAddress').textContent = CONFIG.direccion;
  $('#cPhone').textContent = CONFIG.telefono;
  const saludo = waUrl('Hola DDG Barbershop 💈 quisiera información.');
  $('#waLink').href = saludo; $('#waFloat').href = saludo;
  $('#mapFrame').src = `https://maps.google.com/maps?q=${encodeURIComponent(CONFIG.mapa)}&z=16&output=embed`;
  $('#year').textContent = new Date().getFullYear();
}

/* ---------- Animaciones al hacer scroll ---------- */
function animarContadores(el) {
  const fin = parseFloat(el.dataset.count); const dec = Number(el.dataset.decimals || 0); const t0 = performance.now();
  const paso = (t) => {
    const p = Math.min((t - t0) / 1400, 1); const v = fin * (1 - Math.pow(1 - p, 3));
    el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('es-PE');
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
function iniciarReveal() {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('visible');
    $$('[data-count]', en.target).forEach(animarContadores);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$('.reveal').forEach((el) => io.observe(el));
}

/* ---------- Inicio ---------- */
estadoAbierto(); setInterval(estadoAbierto, 60000);
pintarServicios(); pintarEquipo(); iniciarFormulario(); pintarContacto(); contarReservas(); iniciarReveal();
