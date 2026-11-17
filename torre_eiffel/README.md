# El hombre que vendió la Torre Eiffel

Composición **TorreEiffelShort**: Remotion + Three.js, vertical 1080 × 1920, 30 fps. Proyecto independiente de los episodios anteriores.

## Entregables

- `out/torre_eiffel_1080p.mp4`: H.264 CRF 18, AAC 192 kb/s, 1080 × 1920.
- `out/preview_720p.mp4`: 720 × 1280, H.264 CRF 21; copia del mismo audio master.
- `out/qa_report.json` y `out/qa_report.md`: auditoría del archivo final decodificado.
- `out/ingest_contact_sheet.jpg`: las 16 imágenes originales para inspección.

Verificación final: **PASS**, 1.168 fotogramas decodificados, 38,933333 s de video y 38,933 s de audio; pico verdadero −4,1 dBTP y loudness −19,1 LUFS. La preview conserva el mismo audio AAC. La voz original se mantiene completa, según la preferencia confirmada.

## Reproducir

Requiere Node 22+, Python 3.12, FFmpeg/ffprobe y Chromium. Las dependencias JavaScript están fijadas en `package-lock.json`; `requirements.lock.txt` registra el entorno de transcripción y QA.

```sh
npm ci
python -m venv .venv
.venv/bin/pip install -r requirements.lock.txt
.venv/bin/python scripts/ingest.py
.venv/bin/python scripts/prepare_layers.py
# Solo para repetir el reconocimiento (descarga Whisper small):
.venv/bin/python scripts/transcribe.py
.venv/bin/python scripts/build_timeline.py
npm run typecheck
npm run render
.venv/bin/python qa_audit.py out/torre_eiffel_1080p.mp4
```

También puede renderizarse con `npm run render:cli` y finalizarse con `node scripts/finalize.mjs`. `npm run studio` abre la composición. El navegador usa `/usr/bin/chromium` y `angle-egl` (Mesa sobre EGL) para renderizado WebGL por CPU en esta máquina. `LP_NUM_THREADS=2` ajusta el rasterizador a los dos núcleos disponibles. MSAA está desactivado: los planos usan imágenes ya suavizadas y el texto conserva su renderizado nativo. Los comandos que abren Chromium necesitan permitir sus sockets locales en el aislamiento del ejecutor.

## Activos y profundidad

`alignment/asset_manifest.json` registra cada original y su destino. Se seleccionan 15 escenas en el orden solicitado, incluyendo la toma apuntando a cámara. No se encontró ninguna hoja de referencia sobre fondo beige. Las imágenes `standing_by_Eiffel_Tower` y `standing_near_iron_tower` son variantes de cierre; se seleccionó la primera y se conserva la segunda original en la raíz del repositorio. El cierre suministrado incluye al personaje delante de París; se utiliza tal como fue entregado.

Las ilustraciones son imágenes aplanadas. La composición crea un fondo suavizado en Z = −1,5, el plano fotográfico principal en Z = 0 con transparencia periférica, iluminación y sombra proyectada, y partículas animadas en Z = +1,2. Es una puesta en escena 2.5D de planos reales; no hay geometría reconstruida del personaje ni fondo oculto inventado. OpenCV genera la periferia suave y el canal alfa. Dolly, arco de cámara, whip y temblor amortiguado son funciones deterministas del fotograma: no se usa un reloj WebGL independiente.

## Sincronización y bucle

ffprobe mide **38,922438 s** de voz. Una composición de 30 fps solo admite múltiplos de 33,333 ms: se utilizan **1.168 fotogramas, 38,933333 s**, con +10,895 ms respecto al MP3. No se afirma precisión por debajo del fotograma ni alineación lingüística perfecta: Whisper estima los inicios de palabras. Sus resultados originales, las correcciones y el calendario final se conservan en `alignment/`.

Los cambios de escena y los SFX se anclan a las palabras de la voz real mediante `round(inicio × 30) − 3`, no a los tiempos aproximados del encargo. Los seis golpes periódicos nominales de 6, 12, 18, 24, 30 y 36 segundos también anticipan tres fotogramas: 177, 357, 537, 717, 897 y 1.077. Cada destello dura exactamente tres fotogramas. El ding usa 0,45 y la caja 0,50. En esta narración, «idea absurda» empieza a 9,22 s (SFX en 9,133 s), y «vendió otra vez» a 33,98 s (SFX en 33,867 s).

Los subtítulos contienen 2–4 palabras por bloque, separadas por `column-gap: 20px`; cada palabra es un elemento independiente con contorno negro de 3 px. Se elimina del texto cualquier interjección de respiración inicial reconocida. Los bloques están al 18% del borde inferior y usan una fuente local. La palabra clave y la palabra activa se resaltan en amarillo #FFE600.

Se preserva la voz original completa, según la preferencia confirmada para la entrega. La apertura dice «El hombre que vendió…» y el cierre «porque este hombre…»; se conserva esa repetición verbal para mantener el audio y su duración. El MP3 trae aproximadamente 110 ms iniciales y 239 ms finales bajo −40 dB; no se añade cola de silencio ni pantalla final. La música mantiene continuidad durante esas pausas y el último plano se mezcla hacia la imagen inicial durante nueve fotogramas, devolviendo la cámara a su posición de apertura. El raccord narrativo depende de la frase final «porque este hombre…».

## Audio y QA

La voz se mezcla a 1,0. La música pasa suavemente de un máximo de 0,17 a 0,14 al entrar la voz, con entrada de cinco fotogramas y salida de diez. Después de la mezcla se aplica un limitador a cuatro veces la frecuencia de muestreo con techo de −1,6 dBFS antes de AAC para dejar margen a picos de reconstrucción; la pista se ajusta a exactamente 1.868.800 muestras a 48 kHz (1.168 fotogramas × 1.600 muestras), eliminando la cola añadida por codificación. El pico verdadero del archivo AAC se vuelve a medir con `ebur128=peak=true`. No se eleva artificialmente el volumen de la narración.

`qa_audit.py` decodifica todos los fotogramas y comprueba resolución, fps, número de fotogramas, audio y video H.264/AAC, duración respecto a la voz, desfase entre pistas, negros, congelamientos exactos y casi idénticos (>3 cuadros con diferencia media <0,05/255), y picos de exposición aislados fuera de los destellos programados. La detección de flashes es una heurística documentada y se complementa con revisión visual de fotogramas. También se mide el aumento de luminancia en cada uno de los tres cuadros de los seis destellos previstos. La preview también se comprueba en resolución, duración y número de cuadros, y se verifica que sus paquetes AAC son idénticos a los del master. Un fallo devuelve código de salida distinto de cero; no se publica como aprobado un informe fallido.
