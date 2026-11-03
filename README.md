# Piensa antes de publicar

Sitio web de la campaña de ética digital. Reemplaza los carteles por una experiencia interactiva: test de situaciones, muro de consejos y compromiso firmado.

## Qué incluye

- **Inicio editorial** con el mensaje de la campaña y una publicación de ejemplo interactiva.
- **El problema** y las **4 reglas**: respeta, protege, verifica y actúa.
- **Test “¿Lo publicarías?”** con 5 situaciones, retroalimentación y resultado.
- **Muro de consejos** editable (se guarda en el navegador).
- **Compromiso digital** con tres promesas y tarjeta descargable en PNG (1080 × 1350).
- **Recursos** de UNESCO, UNICEF y ONU.
- Diseño responsive, navegación por teclado y respeto a `prefers-reduced-motion`.
- Fuentes autoalojadas: el sitio no hace peticiones a Google Fonts ni a terceros.

## Ver en local

Desde esta carpeta:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`. También puedes abrir `index.html` directamente, pero la descarga de la tarjeta funciona mejor con el servidor local.

## Publicar (Netlify Drop, gratis)

1. Entra a <https://app.netlify.com/drop>.
2. Arrastra **la carpeta completa `campana-etica`** (no solo el `index.html`).
3. Netlify te dará una URL parecida a `https://nombre-random.netlify.app`.
4. En **Site configuration → Change site name**, cámbialo a `piensa-antes-de-publicar` para tener una URL fácil de recordar. Si el nombre ya está ocupado, usa otro.
5. Abre la URL en el teléfono y prueba el test y la descarga de la tarjeta.

Si usas otro dominio, actualiza la URL en `app.js` → `CONFIG.siteUrl` (respaldo para compartir el resultado del test en la vista local).

## Personalizar los créditos

En `app.js`, al inicio:

```js
const CONFIG = {
  siteUrl: 'https://piensa-antes-de-publicar.netlify.app',
  team: 'Ana, Luis y Sofía',
  subject: 'Ética',
  teacher: 'Prof. García'
};
```

También puedes editar directamente el pie de página en `index.html`.

## Código QR (opcional, fuera del sitio)

El sitio ya no muestra la sección del QR. Los archivos quedan solo por si necesitas imprimir el código para llevarlo a la exposición o pegarlo en el salón:

- `assets/qr-codigo.svg` y `assets/qr-codigo.png`: QR listo para imprimir.
- Ahora mismo apuntan a la URL provisional `https://piensa-antes-de-publicar.netlify.app`.
- Para cambiarlos:

```bash
pip install qrcode pillow
python generar_qr.py https://tu-url-definitiva.com
```

- El QR tiene corrección de errores alta (H), módulos cuadrados y una insignia central; se probó su lectura con un decodificador.

## Estructura

```
campana-etica/
├── index.html          # Contenido y secciones
├── styles.css          # Diseño responsive
├── app.js              # Test, muro y compromiso
├── generar_qr.py       # Generador del QR imprimible (opcional)
└── assets/
    ├── qr-codigo.svg
    ├── qr-codigo.png
    └── fonts/          # Bricolage Grotesque + Inter (OFL)
```

## Nota sobre los datos

El muro y el compromiso usan `localStorage`: cada visitante ve y guarda sus propios consejos y su firma **en su dispositivo**. No hay servidor ni base de datos, así que no se recopilan datos personales. Si quieres un muro compartido entre todos, haría falta un backend o un servicio como Firebase.

## Referencias de la campaña

- UNESCO — Alfabetización mediática e informacional.
- UNICEF — Seguridad, bienestar y derechos de la infancia en internet.
- ONU — Objetivos de Desarrollo Sostenible y ciudadanía responsable.

---

Proyecto de Ética · 2026
