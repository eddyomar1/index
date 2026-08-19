import { useState, type FormEvent } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

const portfolioEmail = 'eddyomarscb@gmail.com';
const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;

interface FormValues {
  name: string;
  email: string;
  message: string;
}

const emptyForm: FormValues = { name: '', email: '', message: '' };
const fieldLimits = { name: 100, email: 254, message: 5000 } as const;

function validate(values: FormValues): string {
  if (values.name.trim().length < 2) return 'Escribe tu nombre (al menos 2 caracteres).';
  if (values.name.trim().length > fieldLimits.name) return 'El nombre es demasiado largo.';
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) return 'Escribe un correo electrónico válido.';
  if (values.email.trim().length > fieldLimits.email)
    return 'El correo electrónico es demasiado largo.';
  if (values.message.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
  if (values.message.trim().length > fieldLimits.message) return 'El mensaje es demasiado largo.';
  return '';
}

async function submitToFormspree(values: FormValues): Promise<void> {
  if (!formspreeId) throw new Error('El formulario no está disponible.');

  const response = await fetch(`https://formspree.io/f/${encodeURIComponent(formspreeId)}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error('No se pudo enviar el mensaje.');
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // This field is hidden from people. Silently accept it when a basic bot fills it.
    if (website) {
      setValues(emptyForm);
      setWebsite('');
      setStatus('success');
      setFeedback('Gracias. Tu mensaje fue enviado correctamente.');
      return;
    }

    const validationMessage = validate(values);

    if (validationMessage) {
      setStatus('error');
      setFeedback(validationMessage);
      return;
    }

    setStatus('loading');
    setFeedback('Enviando mensaje…');

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };

    try {
      const client = getSupabaseClient();

      if (client) {
        try {
          const { error } = await client.from('contact_messages').insert(payload);
          if (!error) {
            setValues(emptyForm);
            setStatus('success');
            setFeedback('Gracias. Tu mensaje fue enviado correctamente.');
            return;
          }

          if (process.env.NODE_ENV === 'development') {
            console.warn(`Supabase no pudo recibir el mensaje: ${error.message}`);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            const message = error instanceof Error ? error.message : 'Error de red desconocido';
            console.warn(`Supabase no está disponible: ${message}`);
          }
        }
      }

      if (formspreeId) {
        await submitToFormspree(payload);
        setValues(emptyForm);
        setStatus('success');
        setFeedback('Gracias. Tu mensaje fue enviado correctamente.');
        return;
      }

      setStatus('error');
      setFeedback(`El envío automático no está configurado. Escríbeme a ${portfolioEmail}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar el mensaje.';
      setStatus('error');
      setFeedback(`${message} También puedes escribirme directamente por correo.`);
    }
  };

  const fieldClass =
    'mt-2 w-full rounded-2xl border border-slate-900/15 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10';

  return (
    <form
      className="rounded-[1.75rem] bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">
          Sitio web
          <input
            id="contact-website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold" htmlFor="contact-name">
          Nombre
          <input
            className={fieldClass}
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={fieldLimits.name}
            required
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>

        <label className="text-sm font-bold" htmlFor="contact-email">
          Correo electrónico
          <input
            className={fieldClass}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={fieldLimits.email}
            required
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </label>
      </div>

      <label className="mt-5 block text-sm font-bold" htmlFor="contact-message">
        Mensaje
        <textarea
          className={`${fieldClass} min-h-36 resize-y`}
          id="contact-message"
          name="message"
          minLength={10}
          maxLength={fieldLimits.message}
          required
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
        />
      </label>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-400 px-6 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
        <a
          className="font-bold text-teal-800 underline underline-offset-4"
          href={`mailto:${portfolioEmail}`}
        >
          {portfolioEmail}
        </a>
      </div>

      <p
        className={`mt-4 min-h-6 text-sm ${status === 'error' ? 'text-red-700' : 'text-teal-800'}`}
        role="status"
        aria-live="polite"
      >
        {feedback}
      </p>
    </form>
  );
}
