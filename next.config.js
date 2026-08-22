function assertSafePublicSupabaseConfig() {
  if (process.env.NEXT_PUBLIC_ENABLE_SUPABASE !== 'true') return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase está habilitado, pero faltan su URL o su clave pública.');
  }

  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL debe utilizar HTTPS.');
  }

  if (key.startsWith('sb_secret_')) {
    throw new Error('Nunca configures una clave secreta de Supabase como variable NEXT_PUBLIC.');
  }

  if (key.startsWith('sb_') && !key.startsWith('sb_publishable_')) {
    throw new Error('La integración pública requiere una clave sb_publishable_ de Supabase.');
  }

  if (key.split('.').length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
      if (payload.role && payload.role !== 'anon') {
        throw new Error('La clave JWT de Supabase destinada al navegador debe tener rol anon.');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('La clave pública JWT de Supabase no tiene un formato válido.');
      }
      throw error;
    }
  }
}

assertSafePublicSupabaseConfig();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  agentRules: false,
  // The compiler API avoids a CLI stdout-capture issue seen in constrained CI shells.
  experimental: {
    useTypeScriptCli: false,
  },
};

module.exports = nextConfig;
