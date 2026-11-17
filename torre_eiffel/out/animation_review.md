# Revisión del master animado

Se revisaron las 15 escenas del MP4 final en `review_contact_sheet.jpg` y el raccord entre los fotogramas 0 y 1.167 en `loop_check.jpg`.

- El personaje se renderiza como PNG independiente sobre un fondo rellenado con OpenCV en las 15 escenas.
- Bombilla: rayos giratorios; maletín y segunda venta: billetes 3D; tren: humo ascendente; coche: líneas de velocidad y vibración.
- La voz dirige inclinación, rebote y escala del personaje mediante la envolvente RMS por fotograma. El salto independiente usa `spring` en los tres golpes previstos.
- Los subtítulos y su calendario son los mismos del master anterior.
- El audio AAC es idéntico al del master anterior: SHA-256 de paquetes ADTS `7bb9da55f77ca67b000281d1ef9d7729ea2907bce91f827e3a902e3acef07b84`.
- La segmentación automática de dibujos complejos es aproximada en detalles pequeños; los movimientos contenidos evitan exponer grandes áreas del fondo rellenado.

La auditoría completa de resolución, cuadros, flashes, duración y audio está en `qa_report.json`.
