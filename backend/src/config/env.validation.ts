/**
 * Falla al arrancar con un mensaje claro si faltan variables críticas.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const required: string[] = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'MONGODB_URI',
    'META_VERIFY_TOKEN',
    'META_APP_SECRET',
    'ADMIN_EMAIL',
  ];
  const missing = required.filter(
    (key) => config[key] == null || String(config[key]).trim() === '',
  );
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${missing.join(', ')}. ` +
        'Copia backend/.env.example a backend/.env y complétalas.',
    );
  }
  return config;
}
