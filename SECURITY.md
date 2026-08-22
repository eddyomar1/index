# Seguridad del portafolio

Este repositorio y su sitio son públicos. No incluyas contraseñas, tokens, claves privadas,
conexiones de base de datos, copias de seguridad ni archivos `.env` reales en commits, incidencias o
capturas de pantalla.

La integración web de Supabase debe utilizar únicamente la URL pública del proyecto y una clave
`sb_publishable_...`. Una clave `sb_secret_...` o `service_role` nunca debe enviarse al navegador ni
guardarse en GitHub. Las credenciales del despliegue se configuran en **Settings → Secrets and
variables → Actions**.

El acceso a proyectos persistentes se concede mediante `public.portfolio_admins`. Después de crear
la cuenta propietaria en Supabase Auth, agrega únicamente su UUID desde el SQL Editor y mantén
deshabilitado el registro público. La ruta `/admin/` no se exporta salvo que `ENABLE_ADMIN_PAGE` sea
`true` durante el build.

El formulario limita mensajes repetidos por dirección, pero una API pública no puede detener por sí
sola a un atacante que rote direcciones. Antes de recibir tráfico elevado, conviene colocar el envío
detrás de una Supabase Edge Function con CAPTCHA o Turnstile y límites por IP.

Antes de publicar fotografías técnicas, revisa visualmente nombres de clientes, direcciones,
números de serie, códigos QR, credenciales, diagramas confidenciales y pantallas de configuración.
También elimina metadatos de ubicación cuando existan.

Para reportar de forma responsable una vulnerabilidad que no deba hacerse pública, escribe a
[eddyomarscb@gmail.com](mailto:eddyomarscb@gmail.com) en lugar de abrir una incidencia pública.
