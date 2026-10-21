# DDG Barbershop 💈

Página web de la barbería **DDG Barbershop** — *"Nunca es suerte, siempre es Dios."*

Sitio estático (HTML + CSS + JavaScript puro), sin instalaciones ni dependencias.

## Funciones
- Hero con logo, estado **Abierto / Cerrado** en tiempo real según el horario
- Servicios con precios y filtros (Cortes, Barba, Combos, Extras)
- Sección Nosotros con contadores animados y Equipo de barberos
- **Reserva de citas**: servicio, barbero, fecha, horarios disponibles, validación de celular
- Comprobante con código y botón para **enviar la reserva por WhatsApp**
- "Mis reservas" con opción de cancelar (se guardan en el navegador con `localStorage`)
- Horario, mapa, redes y botón flotante de WhatsApp
- Diseño responsive (celular, tablet y PC)

## Cómo probarlo
Abre `index.html` en el navegador, o publícalo gratis con **GitHub Pages**:
1. Sube esta carpeta a un repositorio.
2. *Settings → Pages → Branch: `main` / root → Save*.
3. En un minuto estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Personalizar
Todo lo editable está al inicio de `js/main.js`:
- `CONFIG` → número de WhatsApp, teléfono, dirección, ubicación del mapa y horario
- `SERVICIOS` → nombres, precios, duración y descripción
- `BARBEROS` → equipo

> Prototipo de demostración: las reservas se guardan solo en el navegador de quien las hace.
> Para recibirlas en un panel se puede conectar después a Firebase u otra base de datos.

---
Desarrollado por NexusCode Systems
