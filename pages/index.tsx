import Head from 'next/head';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProjectsList from '@/components/ProjectsList';
import Web3Demo from '@/components/Web3Demo';
import { withBasePath } from '@/lib/basePath';

const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'Responsive Design',
  'Python',
  'PHP',
  'SQL',
  'Java',
  'jQuery',
];

const certificates = [
  { name: 'HTML', file: 'HTML_cer.jpg' },
  { name: 'CSS', file: 'CSS_cer.jpg' },
  { name: 'JavaScript', file: 'JS_cer.jpg' },
  { name: 'Responsive Web Design', file: 'RWD_cer.jpg' },
  { name: 'Python', file: 'Python_cer.jpg' },
  { name: 'PHP', file: 'PHP_cer.jpg' },
  { name: 'SQL', file: 'SQL_cer.jpg' },
  { name: 'Java', file: 'Java_cer.jpg' },
  { name: 'jQuery', file: 'jQuery_cer.jpg' },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{children}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Eddy Omar | Portafolio</title>
        <meta
          name="description"
          content="Portafolio de Eddy Omar: proyectos web, juegos, ejercicios de programación y recursos técnicos."
        />
        <meta
          name="google-site-verification"
          content="LRicwNiMcixzT3wnVH-W334NMQEZGCmj2SqQWXjYgrA"
        />
        <link rel="icon" href={withBasePath('/favicon.svg')} type="image/svg+xml" />
        <link rel="alternate icon" href={withBasePath('/img/alenn.png')} type="image/png" />
      </Head>

      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />

      <main id="contenido">
        <section
          className="relative isolate overflow-hidden bg-[#101820] px-5 py-20 text-white sm:px-8 sm:py-28"
          id="inicio"
        >
          <div className="hero-grid" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="eyebrow text-amber-300">Desarrollo web, juegos y tecnología</p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-black tracking-[-0.06em] text-balance sm:text-7xl">
                Construyo proyectos web simples, útiles y fáciles de mejorar.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Este portafolio reúne prácticas, experimentos y proyectos publicados mientras sigo
                fortaleciendo mis bases en frontend, lógica de programación y herramientas técnicas.
              </p>
              <div className="mt-9 flex flex-wrap gap-4" aria-label="Acciones principales">
                <a className="button-primary" href="#proyectos">
                  Ver proyectos <span aria-hidden="true">↓</span>
                </a>
                <a
                  className="button-secondary-dark"
                  href="https://github.com/eddyomar1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-white/[0.06] p-7 shadow-2xl backdrop-blur sm:p-9">
              <div className="code-monogram" aria-label="Monograma EO inspirado en programación">
                <span className="code-symbol symbol-one" aria-hidden="true">
                  &lt;/&gt;
                </span>
                <span className="code-symbol symbol-two" aria-hidden="true">
                  {'{ }'}
                </span>
                <span className="code-symbol symbol-three" aria-hidden="true">
                  ()
                </span>
                <span className="eo-letter" aria-hidden="true">
                  EO
                </span>
              </div>
              <div className="mt-8 border-t border-white/15 pt-6">
                <strong className="text-xs tracking-[0.18em] text-amber-300 uppercase">
                  Enfoque actual
                </strong>
                <p className="mt-2 leading-7 text-slate-300">
                  Frontend, JavaScript, prácticas interactivas y organización de proyectos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="proyectos">
          <SectionHeading eyebrow="Trabajo publicado" title="Proyectos">
            Una selección de ejercicios y aplicaciones pequeñas que muestran práctica con HTML, CSS
            y JavaScript.
          </SectionHeading>
          <ProjectsList />
        </section>

        <section className="border-y border-slate-900/10 bg-white/65" id="habilidades">
          <div className="section-shell">
            <SectionHeading eyebrow="Base técnica" title="Habilidades y certificados">
              Tecnologías que forman mi base y certificados que documentan el aprendizaje detrás de
              los proyectos.
            </SectionHeading>

            <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr]">
              <div>
                <h3 className="text-sm font-black tracking-[0.15em] text-slate-500 uppercase">
                  Herramientas
                </h3>
                <div className="mt-5 flex flex-wrap gap-3" aria-label="Habilidades">
                  {skills.map((skill) => (
                    <span
                      className="rounded-full border border-teal-800/15 bg-teal-50 px-4 py-2 text-sm font-black text-teal-900"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black tracking-[0.15em] text-slate-500 uppercase">
                  Certificados
                </h3>
                <div
                  className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3"
                  aria-label="Certificados"
                >
                  {certificates.map((certificate) => {
                    const path = withBasePath(`/img/cer/${certificate.file}`);
                    return (
                      <a
                        className="group overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                        href={path}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={certificate.file}
                      >
                        <img
                          className="aspect-[1.42/1] w-full object-cover transition group-hover:scale-[1.02]"
                          src={path}
                          alt={`Certificado de ${certificate.name}`}
                          width="1754"
                          height="1238"
                          loading="lazy"
                        />
                        <span className="block px-3 py-2 text-xs font-bold text-slate-700">
                          {certificate.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="recursos">
          <SectionHeading eyebrow="Extras" title="Recursos y experimentos">
            Materiales históricos del proyecto conservados en su propia sección para que sigan
            disponibles sin competir con el trabajo principal.
          </SectionHeading>

          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-[1.75rem] bg-[#101820] p-6 text-white shadow-xl">
              <p className="eyebrow text-amber-300">Experimento</p>
              <h3 className="mt-3 text-2xl font-black">Acertijo #3</h3>
              <img
                className="mt-6 aspect-square w-full rounded-2xl object-cover"
                src={withBasePath('/img/act3.jpeg')}
                alt="Código QR del acertijo número 3"
                width="512"
                height="512"
                loading="lazy"
              />
            </article>

            <article className="flex flex-col rounded-[1.75rem] border border-slate-900/10 bg-white p-7 shadow-lg lg:col-span-2">
              <p className="eyebrow">Archivos técnicos</p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Descargas</h3>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Recursos que ya estaban disponibles en la versión anterior del portafolio.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <a
                  className="download-link"
                  href={withBasePath('/dw/LiquidCrystal_I2C-master.zip')}
                  download
                >
                  <span>LiquidCrystal I2C</span>
                  <span aria-hidden="true">↓</span>
                </a>
                <a className="download-link" href={withBasePath('/dw/arNano.zip')} download>
                  <span>Driver Arduino Nano</span>
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="mt-auto pt-8 text-xs leading-5 text-slate-500">
                Los archivos se conservan como material legado. Revisa cualquier ejecutable con tus
                herramientas de seguridad antes de usarlo.
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-900/10 bg-white/65" id="web3">
          <div className="section-shell">
            <SectionHeading eyebrow="Demo dApp" title="Conexión Web3">
              Una prueba interactiva para conectar una wallet, leer datos básicos de red y firmar un
              mensaje sin enviar transacciones ni gastar gas.
            </SectionHeading>
            <Web3Demo />
          </div>
        </section>

        <section className="bg-[#0f766e] px-5 py-20 text-white sm:px-8 sm:py-24" id="contacto">
          <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-amber-300">Contacto</p>
              <h2 className="mt-4 text-5xl font-black tracking-[-0.05em] text-balance sm:text-6xl">
                Sigamos construyendo.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-teal-50/85">
                Cuéntame qué quieres crear o mejorar. El formulario usa Supabase o Formspree solo si
                están configurados; siempre puedes escribir directamente por correo.
              </p>
              <a
                className="mt-8 inline-flex font-black text-white underline decoration-amber-300 decoration-2 underline-offset-8"
                href="https://github.com/eddyomar1/index"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repositorio del sitio ↗
              </a>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
