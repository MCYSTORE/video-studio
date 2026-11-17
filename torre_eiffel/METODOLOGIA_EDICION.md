# Metodología técnica de edición de videos programáticos

Esta guía documenta el proceso usado en **El hombre que vendió la Torre Eiffel**, composición `TorreEiffelShort`. Sirve como plantilla para episodios posteriores: cambian los activos, la narración y las decisiones de escena; se conserva el método de ingesta, sincronización, animación, render y control de calidad.

## 1. Preparar el proyecto y conservar los originales

Se trabaja en una carpeta propia (`torre_eiffel/`) dentro del repositorio. Los archivos recibidos en la raíz no se modifican. `scripts/ingest.py` copia los cuatro audios a `public/audio/` y `public/sfx/`, ordena las ilustraciones en `public/scenes/01.jpg` a `15.jpg`, calcula SHA-256 por archivo y deja la correspondencia en `alignment/asset_manifest.json`. También crea `out/ingest_contact_sheet.jpg`, una hoja para revisar las 16 imágenes de un vistazo.

La revisión visual identifica el papel narrativo de cada imagen. Se eligieron 15 escenas, incluida la toma en que el personaje apunta a cámara antes del cierre; una variante adicional de la Torre permanece entre los originales. Para un episodio nuevo hay que revisar y cambiar el orden del manifiesto antes de copiar: los nombres de archivo son una pista, no sustituyen la inspección visual. No se encontró una hoja de personaje sobre fondo beige en este lote.

```bash
cd /workspace/video-studio/torre_eiffel
python -m venv .venv
.venv/bin/pip install -r requirements.lock.txt
npm ci
.venv/bin/python scripts/ingest.py
```

**Salida revisable:** `alignment/asset_manifest.json`, `public/scenes/` y `out/ingest_contact_sheet.jpg`. Si una escena está mal ordenada, se corrige el mapeo y se repite la ingesta antes de generar las capas.

## 2. Medir la voz y construir el calendario de edición

`ffprobe` mide la duración del MP3 original; para este episodio es **38,922438 s**. A 30 fps, cada fotograma dura 33,333 ms. La composición usa `ceil(38,922438 × 30) = 1.168` fotogramas, es decir **38,933333 s**. La diferencia inevitable por cuantización es **10,895 ms**. No se añade una pantalla final ni se corta la voz: se mantuvo íntegra por elección del usuario.

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 public/audio/voiceover.mp3
.venv/bin/python scripts/transcribe.py
.venv/bin/python scripts/build_timeline.py
```

`transcribe.py` usa FFmpeg para convertir el MP3 a PCM de 16 kHz y Faster-Whisper `small` en español para estimar el inicio y el final de cada palabra. Guarda el resultado sin corregir en `alignment/whisper.words.json`. `alignment/word_corrections.json` registra correcciones editoriales, entre ellas «Falsificó» y el nombre «Víctor». El generador une `7` y `.000` en una sola palabra y elimina una interjección inicial detectada por Whisper. Conviene escuchar la voz y revisar estas correcciones: Whisper entrega estimaciones, no verdad exacta a nivel de muestra.

`alignment/scene_anchors.json` asigna frases pronunciadas a las imágenes. `build_timeline.py` busca cada frase en orden y calcula el corte con la regla de anticipación:

```text
fotograma de entrada = max(0, round(segundo de inicio de palabra × 30) − 3)
```

El avance de tres fotogramas equivale a unos **100 ms**. Se aplica también a los dos SFX asociados a palabras. En esta voz, «idea absurda» comienza en 9,22 s y el ding se dispara en el fotograma 274 (9,133 s). «Vendió otra vez» comienza en 33,98 s y la caja se dispara en el fotograma 1.016 (33,867 s). Los seis destellos periódicos usan los fotogramas 177, 357, 537, 717, 897 y 1.077; cada uno dura tres fotogramas. Los tiempos que acompañan una idea de guion son aproximados: se impone el tiempo de la voz real.

**Salida revisable:** `alignment/voiceover.reviewed.words.json` y `alignment/timeline.json`. Si cambia la voz, se repiten medición, transcripción, corrección, anclas y construcción del calendario; no basta con desplazar escenas manualmente.

## 3. Organizar subtítulos legibles

El calendario agrupa palabras en bloques de **2 a 4**. La puntuación puede cerrar un bloque y el generador redistribuye palabras sueltas. El texto y el intervalo de cada palabra quedan en `alignment/timeline.json`. `KineticCaption` en `src/TorreEiffelShort.tsx` muestra cada palabra como un elemento independiente; `column-gap: 20px` y `row-gap: 10px` en `src/style.css` impiden que se peguen. La zona está al **18 % del borde inferior**. La palabra activa y la palabra clave reciben amarillo `#FFE600`, contorno negro de 3 px y un impulso `spring`. La fuente local se carga antes de capturar un fotograma.

Para otro video se revisan acentos, cifras, nombres, velocidad de lectura, contraste y la zona segura de la plataforma. La agrupación automática no sustituye esa lectura editorial. El episodio actual contiene **32 bloques** y mantiene el mismo calendario de subtítulos en la versión animada.

## 4. Preparar fondos y personajes en capas

`scripts/prepare_layers.py` genera una copia suavizada de cada escena (`public/layers/XX_back.jpg`) y un canal alfa periférico (`focus.png`) para el fondo lejano. Después, `scripts/separate_hero.py` recorta al protagonista con `rembg` **U2Net** dentro de una región revisada para cada imagen. OpenCV conserva los componentes principales, cierra pequeñas discontinuidades y suaviza el borde. El resultado se recorta al cuadro que lo contiene y se guarda como `hero_XX.png` con transparencia.

El mismo script dilata la máscara y usa `cv2.inpaint` con método **Telea** sobre una versión reducida de la imagen para crear `bg_XX.jpg`. `hero_manifest.json` guarda las dimensiones originales y el rectángulo del PNG; Three.js usa esos datos para colocar el recorte sobre su posición original. Se hicieron **15 pares** `hero_XX.png`/`bg_XX.jpg`, incluido el plano de cierre.

```bash
.venv/bin/python scripts/prepare_layers.py
.venv/bin/python scripts/separate_hero.py
```

La separación automática es aproximada cuando un brazo se superpone a una mesa o el sombrero se parece al fondo. Por eso se comparan originales, recortes, fondos reconstruidos y fotogramas de prueba antes de renderizar todo el episodio. Si un borde deja artefactos, se ajusta la región del sujeto o la máscara de esa escena y se vuelve a generar. Los movimientos del personaje son moderados para no descubrir grandes áreas rellenadas.

## 5. Medir la energía de la narración para animar al personaje

`scripts/voice_envelope.py` decodifica la voz original a **48 kHz mono** y calcula el RMS de cada bloque de **1.600 muestras**, exactamente un fotograma a 30 fps. Normaliza respecto al percentil 90 y suaviza con los cuadros vecino, actual y siguiente. Guarda **1.168 valores** en `alignment/voice_envelope.json`.

```bash
.venv/bin/python scripts/voice_envelope.py
```

La envolvente gobierna la inclinación al hablar y una pequeña deformación de escala horizontal y vertical (*squash/stretch*). Una función seno añade respiración continua. En tres golpes —fotogramas 177, 447 y 1.017— un `spring` aporta rebote al protagonista independientemente de la cámara. Este sistema responde a **amplitud**, no a fonemas ni a articulaciones reales: la boca de la ilustración no se reconstruye ni se sincroniza palabra por palabra.

## 6. Montar la escena 2.5D en Three.js y Remotion

`src/Root.tsx` registra `TorreEiffelShort` a **1080 × 1920, 30 fps**. `src/TorreEiffelShort.tsx` usa `<ThreeCanvas>` de `@remotion/three`, con los planos situados en profundidad: fondo suavizado en **Z = −1,5**, fondo rellenado en **Z = 0**, personaje en **Z = +0,27** y atmósfera delante. Cada plano conserva perspectiva de cámara, luz ambiente y luz direccional. El personaje es una textura PNG transparente sobre una geometría plana; esto crea separación y paralaje 2.5D, no un personaje 3D modelado.

La cámara hace un acercamiento progresivo, un arco lateral pequeño y un desplazamiento rápido al cambiar de escena. Los golpes periódicos añaden punch y destello de tres cuadros; los SFX producen un temblor breve con decaimiento. En los nueve fotogramas finales la imagen vuelve gradualmente a la apertura y la cámara retorna a su posición inicial. La voz original empieza «El hombre que vendió…» y termina «porque este hombre…»; se conserva la repetición verbal para mantener el archivo completo.

Los efectos propios de las escenas se calculan a partir del número de fotograma, sin depender de un reloj externo:

| Escena | Animación específica |
|---|---|
| 03 | Nueve rayos de luz giran detrás de la bombilla. |
| 08 y 12 | Quince billetes verdes caen y giran en planos 3D. |
| 09 | Once formas blancas suben y se dispersan como humo de tren. |
| 11 | Líneas de velocidad y una vibración corta animan el regreso en coche. |

La iluminación y las partículas mantienen continuidad entre las tomas, mientras esos elementos hacen que cada momento clave tenga movimiento propio. Las funciones deterministas permiten volver a renderizar un fotograma aislado y obtener la misma posición de los elementos.

## 7. Mezclar y terminar el audio

La composición usa `voiceover.mp3` a volumen **1,0**; la música pasa suavemente entre **0,17 y 0,14** y sale durante los últimos diez cuadros. El ding se programa a **0,45** y la caja a **0,50**. `scripts/finalize.mjs` copia el video H.264 sin recodificar y procesa la mezcla a 192 kHz para aplicar un limitador con techo aproximado de −1,6 dBFS. Luego vuelve a 48 kHz, ajusta la pista a **1.868.800 muestras** y codifica AAC a **192 kb/s**. El objetivo es evitar un clic o una cola AAC que prolongue el archivo más allá del último cuadro.

La revisión comparó los paquetes AAC del master animado con los de la versión anterior y obtuvo el mismo SHA-256 ADTS: `7bb9da55f77ca67b000281d1ef9d7729ea2907bce91f827e3a902e3acef07b84`. Por tanto, la actualización visual mantuvo el audio final exactamente igual. Para un episodio diferente se repite la medición de pico verdadero: copiar estos volúmenes sin revisar nuevos activos no garantiza un nivel seguro.

## 8. Renderizar master y vista previa

```bash
npm run typecheck
npm run render
```

`npm run render` invoca `scripts/render.mjs` y después `scripts/finalize.mjs`. Remotion usa Chromium con backend `angle-egl` y dos procesos de render. El intermedio se guarda en `out/.work/master_raw.mp4`. El master final es `out/torre_eiffel_1080p.mp4`: **1080 × 1920, H.264 CRF 18, AAC 192 kb/s**. FFmpeg escala el video a **720 × 1280**, H.264 CRF 21, para `out/preview_720p.mp4`; copia los mismos paquetes AAC del master.

Si se usa el comando CLI `npm run render:cli`, todavía hay que ejecutar `node scripts/finalize.mjs` para obtener el master terminado y la vista previa. Un render puede tardar bastante en CPU porque cada cuadro incluye WebGL y transparencias; primero se prueban fotogramas representativos en Remotion Studio o con `remotion still`, y después se lanza el render completo.

## 9. Auditar y revisar el archivo exportado

```bash
.venv/bin/python qa_audit.py out/torre_eiffel_1080p.mp4
.venv/bin/python scripts/review_frames.py
```

`qa_audit.py` decodifica **todos** los cuadros del MP4. Comprueba resolución, fps, cantidad de cuadros, H.264/AAC, diferencia de duración con la fuente dentro de un fotograma, sincronía de las pistas, negros, congelamientos idénticos o casi idénticos durante más de tres cuadros, y destellos no programados. Verifica que los seis flashes previstos duren tres cuadros y eleven la luminancia. FFmpeg `ebur128=peak=true` mide sonoridad y pico verdadero; el umbral es **≤ −1,0 dBTP**. También coteja la duración y los paquetes AAC de la preview. El script sale con error si falla un control y escribe `out/qa_report.json` y `out/qa_report.md`.

`review_frames.py` crea `out/review_contact_sheet.jpg` con un punto medio de cada escena y `out/loop_check.jpg` con el primer y el último cuadro. La revisión visual detecta problemas que los umbrales automáticos no siempre capturan: contornos mal recortados, manos duplicadas, subtítulos superpuestos o un raccord de cierre evidente. `out/animation_review.md` conserva las observaciones de esta versión.

**Resultado de este master:** 1.168 cuadros; 38,933333 s de video frente a 38,922438 s de voz (+10,895 ms); sin cuadros negros, congelamientos ni flashes imprevistos; **−4,1 dBTP** y **−19,1 LUFS**. El informe final marca `PASS`.

## 10. Adaptar y publicar otro episodio

1. Crear una carpeta nueva y conservar los originales. Revisar la hoja de contacto, el orden narrativo y el manifiesto de activos.
2. Medir la nueva voz, transcribirla, corregir nombres y cifras, definir frases ancla y reconstruir `timeline.json`.
3. Generar máscaras, fondos y envolvente de voz. Revisar las escenas difíciles y diseñar elementos animados que respondan a la historia concreta.
4. Probar cuadros representativos y el empalme final, renderizar master y preview, ejecutar QA y corregir cualquier fallo antes de publicar.
5. Publicar en GitHub los videos, el informe de QA, los archivos de fuente y la guía del episodio. Verificar los enlaces y los hashes de los archivos publicados.

El repositorio conserva tanto el resultado como las decisiones que lo produjeron. El tiempo de palabra y el recorte automático siempre se revisan con oído y vista; las cifras del QA describen el archivo exportado, no sustituyen la evaluación editorial.
