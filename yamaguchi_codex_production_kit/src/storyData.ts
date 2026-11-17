export interface SceneConfig {
  id: number;
  image: string;
  startSec: number;
  endSec: number;
  cameraMotion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'impact-shake';
  isPatternInterrupt?: boolean;
  sfx?: { file: string; startSec: number; volume: number };
  captions: {
    text: string;
    highlight?: string;
    startSec: number;
    endSec: number;
  }[];
}

// Aligned to Whisper word timestamps and FFmpeg speech/silence boundaries.
// Times are quantized once to 30 fps; see alignment/ for source observations.
export const SHORT_FPS = 30;
export const TOTAL_DURATION_SEC = 1285 / SHORT_FPS;

export const SCENES: SceneConfig[] = [
  {
    "id": 1,
    "image": "scenes/01.jpg",
    "startSec": 0.0,
    "endSec": 3.9,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "ESTABA EN LA CIUDAD EQUIVOCADA...",
        "highlight": "EQUIVOCADA",
        "startSec": 0.0,
        "endSec": 2.8
      },
      {
        "text": "¡DOS VECES!",
        "highlight": "DOS VECES",
        "startSec": 2.8,
        "endSec": 3.9
      }
    ]
  },
  {
    "id": 2,
    "image": "scenes/02.jpg",
    "startSec": 3.9,
    "endSec": 8.5,
    "cameraMotion": "pan-right",
    "captions": [
      {
        "text": "EN 1945, TSUTOMU YAMAGUCHI",
        "highlight": "1945",
        "startSec": 3.9,
        "endSec": 7.0
      },
      {
        "text": "TRABAJABA EN HIROSHIMA",
        "highlight": "HIROSHIMA",
        "startSec": 7.0,
        "endSec": 8.5
      }
    ]
  },
  {
    "id": 3,
    "image": "scenes/03.jpg",
    "startSec": 8.5,
    "endSec": 11.466666666666667,
    "cameraMotion": "impact-shake",
    "captions": [
      {
        "text": "DE REPENTE...",
        "highlight": "REPENTE",
        "startSec": 8.5,
        "endSec": 9.4
      },
      {
        "text": "DESTELLO CEGADOR",
        "highlight": "DESTELLO CEGADOR",
        "startSec": 9.4,
        "endSec": 10.233333333333333
      },
      {
        "text": "LO BORRÓ TODO",
        "highlight": "TODO",
        "startSec": 10.233333333333333,
        "endSec": 11.466666666666667
      }
    ],
    "sfx": {
      "file": "sfx/sfx_explosion.mp3",
      "startSec": 9.4,
      "volume": 0.3
    }
  },
  {
    "id": 4,
    "image": "scenes/04.jpg",
    "startSec": 11.466666666666667,
    "endSec": 14.766666666666667,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "SOBREVIVIÓ DE MILAGRO",
        "highlight": "MILAGRO",
        "startSec": 11.466666666666667,
        "endSec": 13.333333333333334
      },
      {
        "text": "CON QUEMADURAS GRAVES",
        "highlight": "GRAVES",
        "startSec": 13.333333333333334,
        "endSec": 14.766666666666667
      }
    ]
  },
  {
    "id": 5,
    "image": "scenes/05.jpg",
    "startSec": 14.766666666666667,
    "endSec": 18.766666666666666,
    "cameraMotion": "pan-left",
    "captions": [
      {
        "text": "¿LO PEOR?",
        "highlight": "LO PEOR",
        "startSec": 14.766666666666667,
        "endSec": 16.1
      },
      {
        "text": "AL DÍA SIGUIENTE...",
        "highlight": "DÍA SIGUIENTE",
        "startSec": 16.1,
        "endSec": 16.766666666666666
      },
      {
        "text": "VOLVIÓ A SU PUEBLO NATAL",
        "highlight": "PUEBLO NATAL",
        "startSec": 16.766666666666666,
        "endSec": 18.766666666666666
      }
    ],
    "sfx": {
      "file": "sfx/sfx_train.mp3",
      "startSec": 16.766666666666666,
      "volume": 0.25
    }
  },
  {
    "id": 6,
    "image": "scenes/06.jpg",
    "startSec": 18.766666666666666,
    "endSec": 19.833333333333332,
    "cameraMotion": "zoom-out",
    "captions": [
      {
        "text": "¡A NAGASAKI!",
        "highlight": "NAGASAKI",
        "startSec": 18.766666666666666,
        "endSec": 19.833333333333332
      }
    ]
  },
  {
    "id": 7,
    "image": "scenes/07.jpg",
    "startSec": 19.833333333333332,
    "endSec": 21.966666666666665,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "JUSTO CUANDO LE CONTABA A SU JEFE",
        "highlight": "SU JEFE",
        "startSec": 19.833333333333332,
        "endSec": 21.133333333333333
      },
      {
        "text": "LO QUE PASÓ...",
        "highlight": "PASÓ",
        "startSec": 21.133333333333333,
        "endSec": 21.966666666666665
      }
    ]
  },
  {
    "id": 8,
    "image": "scenes/08.jpg",
    "startSec": 21.966666666666665,
    "endSec": 24.2,
    "cameraMotion": "impact-shake",
    "captions": [
      {
        "text": "¡PUM!",
        "highlight": "PUM",
        "startSec": 21.966666666666665,
        "endSec": 22.566666666666666
      },
      {
        "text": "CAYÓ LA SEGUNDA BOMBA",
        "highlight": "SEGUNDA BOMBA",
        "startSec": 22.566666666666666,
        "endSec": 24.2
      }
    ],
    "sfx": {
      "file": "sfx/sfx_explosion.mp3",
      "startSec": 21.966666666666665,
      "volume": 0.32
    }
  },
  {
    "id": 9,
    "image": "scenes/09.jpg",
    "startSec": 24.2,
    "endSec": 26.633333333333333,
    "cameraMotion": "zoom-out",
    "captions": [
      {
        "text": "ESTABA EN EL EPICENTRO...",
        "highlight": "EPICENTRO",
        "startSec": 24.2,
        "endSec": 25.6
      },
      {
        "text": "¡OTRA VEZ!",
        "highlight": "OTRA VEZ",
        "startSec": 25.6,
        "endSec": 26.633333333333333
      }
    ]
  },
  {
    "id": 10,
    "image": "scenes/10.jpg",
    "startSec": 26.633333333333333,
    "endSec": 29.9,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "VOLVIÓ A SOBREVIVIR",
        "highlight": "SOBREVIVIR",
        "startSec": 26.633333333333333,
        "endSec": 28.133333333333333
      },
      {
        "text": "SALIÓ ILESO DE LA ZONA CERO",
        "highlight": "ILESO",
        "startSec": 28.133333333333333,
        "endSec": 29.9
      }
    ]
  },
  {
    "id": 11,
    "image": "scenes/11.jpg",
    "startSec": 29.9,
    "endSec": 33.4,
    "cameraMotion": "pan-right",
    "captions": [
      {
        "text": "LOS MÉDICOS NO ENTENDÍAN NADA",
        "highlight": "NADA",
        "startSec": 29.9,
        "endSec": 31.833333333333332
      },
      {
        "text": "SU CUERPO ERA DE ACERO",
        "highlight": "DE ACERO",
        "startSec": 31.833333333333332,
        "endSec": 33.4
      }
    ],
    "sfx": {
      "file": "sfx/sfx_chime.mp3",
      "startSec": 32.5,
      "volume": 3.0
    }
  },
  {
    "id": 12,
    "image": "scenes/12.jpg",
    "startSec": 33.4,
    "endSec": 36.5,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "VIVIÓ HASTA LOS 93 AÑOS",
        "highlight": "93 AÑOS",
        "startSec": 33.4,
        "endSec": 34.96666666666667
      },
      {
        "text": "DESAFIANDO A LA CIENCIA",
        "highlight": "CIENCIA",
        "startSec": 34.96666666666667,
        "endSec": 36.5
      }
    ]
  },
  {
    "id": 13,
    "image": "scenes/13.jpg",
    "startSec": 36.5,
    "endSec": 39.93333333333333,
    "cameraMotion": "zoom-out",
    "captions": [
      {
        "text": "¿SUERTE EXTREMA O EL HOMBRE",
        "highlight": "SUERTE EXTREMA",
        "startSec": 36.5,
        "endSec": 37.86666666666667
      },
      {
        "text": "MÁS DESAFORTUNADO DEL PLANETA?",
        "highlight": "DESAFORTUNADO",
        "startSec": 37.86666666666667,
        "endSec": 39.93333333333333
      }
    ]
  },
  {
    "id": 14,
    "image": "scenes/14.jpg",
    "startSec": 39.93333333333333,
    "endSec": 41.86666666666667,
    "cameraMotion": "pan-left",
    "captions": [
      {
        "text": "COMENTA QUÉ HABRÍAS HECHO TÚ",
        "highlight": "COMENTA",
        "startSec": 39.93333333333333,
        "endSec": 41.03333333333333
      },
      {
        "text": "EN SU LUGAR",
        "highlight": "SU LUGAR",
        "startSec": 41.03333333333333,
        "endSec": 41.86666666666667
      }
    ]
  },
  {
    "id": 15,
    "image": "scenes/15.jpg",
    "startSec": 41.86666666666667,
    "endSec": 42.13333333333333,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "PORQUE...",
        "highlight": "PORQUE",
        "startSec": 41.86666666666667,
        "endSec": 42.13333333333333
      }
    ]
  },
  {
    "id": 16,
    "image": "scenes/16.jpg",
    "startSec": 42.13333333333333,
    "endSec": 42.833333333333336,
    "cameraMotion": "zoom-in",
    "captions": [
      {
        "text": "ESTE HOMBRE...",
        "highlight": "ESTE HOMBRE",
        "startSec": 42.13333333333333,
        "endSec": 42.833333333333336
      }
    ]
  }
];
