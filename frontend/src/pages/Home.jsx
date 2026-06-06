import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Navbar from '../components/Navbar';
import ServerStatusBadge from '../components/ServerStatusBadge';
import { getGallery, getStaff, getTestimonials } from '../api/community';
import { getProducts } from '../api/products';
import toast from 'react-hot-toast';
import { MTA_CONNECT_URL, DISCORD_INVITE, SITE_YEAR, RULES_URL } from '../config/site';

// Intenta abrir MTA:SA; si el protocolo no tiene handler (no instalado),
// seguimos en la página y avisamos.
function connectToMta() {
  const start = Date.now();
  window.location.href = MTA_CONNECT_URL;
  setTimeout(() => {
    if (Date.now() - start < 2000 && !document.hidden) {
      toast.error('Necesitas tener MTA:SA instalado para conectarte directamente');
    }
  }, 1500);
}

// ── Hook de animación al hacer scroll ────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, className = '' }) {
  const [ref, visible] = useScrollReveal();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [gallery, setGallery] = useState([]);
  const [staff, setStaff] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getGallery().then(setGallery).catch(() => {});
    getStaff().then(setStaff).catch(() => {});
    getTestimonials().then(setTestimonials).catch(() => {});
    getProducts({ category: 'vip' })
      .then((d) => setFeatured(d.data?.slice(0, 3) ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-[#080810] to-blue-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_60%)]" />
        {/* Grid de puntos decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge servidor */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0f0f1a]/80 border border-slate-200 dark:border-[#1e1e30] rounded-full px-4 py-2 mb-8 backdrop-blur">
            <ServerStatusBadge compact />
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Valparaíso
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Roleplay
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            El servidor de roleplay más inmersivo de Chile. Vive tu historia en la
            ciudad de Valparaíso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={connectToMta}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:scale-95"
            >
              🎮 Conectarse ahora
            </button>
            <Link
              to="/store"
              className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/50 text-slate-900 dark:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              🛒 Ver tienda
            </Link>
          </div>

        </div>

        {/* Scroll indicator: hermano del contenido, hijo directo del hero */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-400 dark:text-slate-600 pointer-events-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* ── VIPs DESTACADOS ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <Section className="py-24 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Tienda
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Mejora tu experiencia
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <Link
                key={p.id}
                to={`/store/${p.slug}`}
                className={`group bg-white dark:bg-[#0f0f1a] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  i === 1
                    ? 'border-purple-500/50 shadow-[0_0_40px_rgba(124,58,237,0.15)]'
                    : 'border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/30'
                }`}
              >
                {i === 1 && (
                  <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    ⭐ POPULAR
                  </div>
                )}
                <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-2">{p.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xl">
                    {p.price_formatted}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 text-sm group-hover:translate-x-1 transition-transform">
                    Ver más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/store"
              className="text-slate-500 hover:text-purple-400 text-sm transition-colors"
            >
              Ver todos los productos →
            </Link>
          </div>
        </Section>
      )}

      {/* ── GALERÍA ───────────────────────────────────────────────── */}
      {gallery.length > 0 && (
        <Section className="py-24 bg-gradient-to-b from-[#080810] via-purple-950/5 to-[#080810]">
          <div className="text-center mb-12 px-4">
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Comunidad
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Momentos del servidor
            </h2>
          </div>
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            className="px-4"
          >
            {gallery.map((photo) => (
              <SwiperSlide key={photo.id}>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e1e30] group">
                  <img loading="lazy" decoding="async"
                    src={photo.image_url}
                    alt={photo.title || 'Foto del servidor'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photo.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-slate-900 dark:text-white text-sm font-medium">{photo.title}</p>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="text-center mt-8 px-4">
            <Link
              to="/gallery"
              className="text-slate-500 hover:text-purple-400 text-sm transition-colors"
            >
              Ver galería completa →
            </Link>
          </div>
        </Section>
      )}

      {/* ── STAFF ─────────────────────────────────────────────────── */}
      {staff.length > 0 && (
        <Section className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              El equipo
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Nuestro staff</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] hover:border-purple-500/30 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
              >
                <img loading="lazy" decoding="async"
                  src={
                    member.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=7c3aed&color=fff`
                  }
                  alt={member.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-purple-600/50"
                />
                <p className="text-slate-900 dark:text-white font-semibold text-sm">{member.name}</p>
                <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">{member.role_title}</p>
                {member.discord_username && (
                  <p className="text-slate-600 text-xs mt-1">@{member.discord_username}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── TESTIMONIOS ───────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <Section className="py-24 bg-gradient-to-b from-[#080810] via-blue-950/5 to-[#080810]">
          <div className="text-center mb-12 px-4">
            <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Reviews
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Lo que dicen los jugadores
            </h2>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{ 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            className="px-4 pb-10"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="bg-white dark:bg-[#0f0f1a] border border-slate-200 dark:border-[#1e1e30] rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < t.rating ? 'text-yellow-400' : 'text-slate-700'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">"{t.content}"</p>
                  <div className="flex items-center gap-2">
                    <img loading="lazy" decoding="async"
                      src={
                        t.author_avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(t.author_name)}&background=1e1e30&color=94a3b8`
                      }
                      className="w-8 h-8 rounded-full"
                      alt={t.author_name}
                    />
                    <span className="text-slate-500 text-xs">{t.author_name}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Section>
      )}

      {/* ── CTA FINAL ─────────────────────────────────────────────── */}
      <Section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-purple-800/30 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">¿Listo para jugar?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Únete a la comunidad de Valparaíso RP y empieza tu historia hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={connectToMta}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] active:scale-95"
            >
              🎮 Conectarse al servidor
            </button>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              <span className="mr-2">💬</span> Unirse al Discord
            </a>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-[#1e1e30] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">
              ⬡ Valparaíso <span className="text-purple-600 dark:text-purple-400">RP</span>
            </p>
            <p className="text-slate-600 text-sm mt-1">El roleplay más inmersivo de Chile</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link to="/store" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tienda</Link>
            <Link to="/gallery" className="hover:text-slate-900 dark:hover:text-white transition-colors">Galería</Link>
            <a href={RULES_URL} target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Normativas
            </a>
            <Link to="/staff" className="hover:text-slate-900 dark:hover:text-white transition-colors">Staff</Link>
            <Link to="/leaderboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Leaderboard</Link>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Discord
            </a>
          </nav>
          <p className="text-slate-700 text-xs">
            © {SITE_YEAR} Valparaíso RP. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
