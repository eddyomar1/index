import Head from 'next/head';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import IndustrialProjects from '@/components/IndustrialProjects';
import ProjectsList from '@/components/ProjectsList';
import Web3Demo from '@/components/Web3Demo';
import { withBasePath } from '@/lib/basePath';

const skills = [
  'HTML y CSS',
  'JavaScript',
  'TypeScript',
  'React y Next.js',
  'Python',
  'PHP',
  'SQL',
  'Git y GitHub',
  'Programación de microcontroladores',
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
          content="Portafolio profesional de Eddy Omar con proyectos de desarrollo web y software, programación de microcontroladores y experiencia en electrónica industrial."
        />
        <meta property="og:title" content="Eddy Omar | Portafolio profesional" />
        <meta
          property="og:description"
          content="Proyectos de software, desarrollo web, microcontroladores y electrónica industrial realizados por Eddy Omar."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://eddyomar1.github.io/index/" />
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
              <p className="eyebrow text-amber-300">Software, web y sistemas embebidos</p>
              <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-black tracking-[-0.06em] text-balance sm:text-7xl">
                Un portafolio de proyectos, aprendizaje y trabajo técnico.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Aquí presento proyectos en los que he trabajado y otras cosas que he construido. He
                adquirido experiencia en programación, desarrollo de software y microcontroladores,
                áreas en las que continúo aprendiendo y desarrollándome, apoyándome también en mi
                experiencia con electrónica industrial.
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
                <span className="code-orbit code-orbit-one" aria-hidden="true">
                  <span className="code-symbol">&lt;/&gt;</span>
                </span>
                <span className="code-orbit code-orbit-two" aria-hidden="true">
                  <span className="code-symbol">{'{ }'}</span>
                </span>
                <span className="code-orbit code-orbit-three" aria-hidden="true">
                  <span className="code-symbol">()</span>
                </span>
                <span className="eo-letter" aria-hidden="true">
                  EO
                </span>
              </div>
              <div className="mt-8 border-t border-white/15 pt-6">
                <strong className="text-xs tracking-[0.18em] text-amber-300 uppercase">
                  Áreas de interés
                </strong>
                <p className="mt-2 leading-7 text-slate-300">
                  Desarrollo de software, aplicaciones web y programación de microcontroladores para
                  crear soluciones claras y prácticas.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="proyectos">
          <SectionHeading eyebrow="Software y web" title="Proyectos de programación">
            Una selección de aplicaciones, juegos y experimentos que muestran cómo trabajo con
            interfaces, lógica y desarrollo de software.
          </SectionHeading>
          <ProjectsList />
        </section>

        <section className="border-y border-slate-900/10 bg-white/65" id="electronica">
          <div className="section-shell">
            <SectionHeading eyebrow="Experiencia técnica" title="Electrónica industrial">
              Un espacio separado para documentar trabajos técnicos reales, el contexto de cada
              proyecto y las soluciones en las que participé.
            </SectionHeading>
            <IndustrialProjects />
          </div>
        </section>

        <section className="section-shell" id="habilidades">
          <SectionHeading eyebrow="Perfil técnico" title="Tecnologías y áreas de enfoque">
            Herramientas que utilizo y áreas en las que quiero seguir creciendo profesionalmente.
          </SectionHeading>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-7 shadow-lg sm:p-8">
              <div>
                <h3 className="text-sm font-black tracking-[0.15em] text-slate-500 uppercase">
                  Tecnologías
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[1.5rem] bg-[#101820] p-6 text-white shadow-lg">
                <p className="eyebrow text-amber-300">Experiencia práctica</p>
                <h3 className="mt-3 text-2xl font-black">Desarrollo de software</h3>
                <p className="mt-3 leading-7 text-slate-300">
                  He trabajado con aplicaciones web, interfaces y lógica de programación, mientras
                  continúo ampliando mis conocimientos mediante proyectos prácticos.
                </p>
              </article>
              <article className="rounded-[1.5rem] bg-teal-800 p-6 text-white shadow-lg">
                <p className="eyebrow text-amber-300">Integración técnica</p>
                <h3 className="mt-3 text-2xl font-black">Microcontroladores</h3>
                <p className="mt-3 leading-7 text-teal-50/85">
                  Programación y experimentación con sistemas embebidos, conectando software con
                  dispositivos y conocimientos de electrónica.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section-shell" id="recursos">
          <SectionHeading eyebrow="Extras" title="Recursos y experimentos">
            Materiales históricos del proyecto conservados en su propia sección para que sigan
            disponibles sin competir con el trabajo principal.
          </SectionHeading>

          <div className="max-w-md">
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
                Cuéntame qué quieres crear o mejorar. Puedes usar el formulario o escribirme
                directamente por correo.
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
