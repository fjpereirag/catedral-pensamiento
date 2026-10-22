# La Catedral del Pensamiento

Diez estancias para aprender a preguntar, mirar y vivir con conciencia. En el centro, pensar. Misma familia visual y misma arquitectura que *La Catedral de la Libertad* (fondo oscuro, oro, Cormorant Garamond + Inter, solo móvil).

## Archivos (estructura plana)

Un único camino: Portada → Etapa I (Preguntar) → estancias 1-3 → Etapa II (Mirar) → 4-7 → Etapa III (Vivir con conciencia) → 8-10 → El centro.

| Archivo | Qué es |
|---|---|
| `index.html` | Portada (nave 3D dibujada) + rosetón «El mapa interior» + el camino completo con «Sigue aquí» |
| `etapa.html?e=1…3` | Entrada de cada etapa |
| `estancia.html?n=1…10` | Lectura de cada estancia: lectura, Para tu vida, Detente, Tres miradas, Un paso para hoy, Para llevar contigo |
| `centro.html` | Final: «La razón como contemplación» + las diez frases para llevar |
| `contenido.js` | Todo el texto (`window.CP`) |
| `app.js` | Camino, progreso, rosetón, emblemas y barra inferior ‹ Anterior · progreso · Siguiente › |
| `nave.js` | Portada: nave en perspectiva con 10 lámparas que se encienden |
| `efectos.js` | Fotos 3D por profundidad, polvo de luz, chispas al iluminar, títulos animados |
| `estilo.css` | Estilo móvil |

Las estancias iluminadas se guardan solo en el dispositivo (localStorage, clave `cp-encendidas`; no se mezcla con la Catedral de la Libertad).

## Fotos y audio (opcionales)

Funciona sin imágenes: cada estancia tiene su emblema dibujado. Si se añade la carpeta `assets_img/` con estos nombres, se usan automáticamente:
`foto-nave.webp`, `foto-etapa-1..3.webp`, `foto-estancia-01..10.webp`, `foto-centro.webp` (y sus `-prof.webp` de Colab para el efecto 3D).
Audio en `assets_audio/`: `etapa-1..3.mp3`, `estancia-01..10.mp3`, `centro.mp3`. El botón «Escuchar» solo aparece si el MP3 existe.

## Publicar en GitHub Pages

1. Crear repo público nuevo (p. ej. `catedral-pensamiento`).
2. «Add file → Upload files»: subir todos los archivos.
3. Settings → Pages → Branch `main` / root → Save.
4. Al cambiar CSS o JS, subir `?v=1` a `?v=2` en los cuatro HTML.

## Probar en local

`py -m http.server 8000` dentro de la carpeta y abrir `http://localhost:8000`.
