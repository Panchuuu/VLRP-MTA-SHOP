import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-[#1e1e30] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-[#0f0f1a] transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
        <span className={`text-purple-500 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/faqs')
      .then((r) => setGrouped(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2 text-center">
          Preguntas Frecuentes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-10">
          Encuentra respuestas a las dudas más comunes
        </p>

        {!loading && categories.length === 0 && (
          <p className="text-center text-slate-400">No hay preguntas disponibles todavía.</p>
        )}

        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="text-lg font-bold font-display text-purple-600 dark:text-purple-400 mb-3">
                {cat}
              </h2>
              <div className="space-y-2">
                {grouped[cat].map((faq) => (
                  <FaqItem key={faq.id} faq={faq} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
