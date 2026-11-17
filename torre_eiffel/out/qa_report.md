# Torre Eiffel — QA

Resultado: **PASS**

Archivo: `torre_eiffel_1080p.mp4`

| Prueba | Resultado |
|---|---|
| dimensions | PASS |
| fps | PASS |
| frame_count | PASS |
| no_identical_freezes | PASS |
| no_near_freezes | PASS |
| no_black_frames | PASS |
| no_unplanned_exposure_spikes | PASS |
| planned_three_frame_flashes_visible | PASS |
| no_unplanned_white_frames | PASS |
| true_peak_at_most_minus_1_dbtp | PASS |
| duration_within_one_frame_of_voice | PASS |
| av_duration_within_one_frame | PASS |
| captions_two_to_four_words | PASS |
| h264_aac | PASS |
| preview_h264_720x1280_30fps | PASS |
| preview_frame_count | PASS |
| preview_duration_matches_master | PASS |
| preview_uses_same_aac_packets | PASS |

Duración: 38.933333 s; voz: 38.922438 s; diferencia: 10.895 ms.

Pico verdadero: -4.1 dBTP. Loudness: -19.1 LUFS.

Se decodifican todos los fotogramas. Detección de flashes por luminancia, con ventanas programadas documentadas.

La alineación de Whisper estima el inicio de cada palabra. El montaje aplica −3 fotogramas a esos inicios y cuantiza a 30 fps.
