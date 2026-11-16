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

export const SHORT_FPS = 30;
export const TOTAL_DURATION_SEC = 43.5;

export const SCENES: SceneConfig[] = [
  {
    id: 1,
    image: 'scenes/01.jpg',
    startSec: 0.0,
    endSec: 3.1,
    cameraMotion: 'zoom-in',
    captions: [
      { text: 'ESTABA EN LA CIUDAD EQUIVOCADA...', highlight: 'EQUIVOCADA', startSec: 0.1, endSec: 2.0 },
      { text: '¡DOS VECES!', highlight: 'DOS VECES!', startSec: 2.0, endSec: 3.1 },
    ],
  },
  {
    id: 2,
    image: 'scenes/02.jpg',
    startSec: 3.1,
    endSec: 6.0,
    cameraMotion: 'pan-right',
    captions: [
      { text: 'EN 1945 TSUTOMU YAMAGUCHI', highlight: '1945', startSec: 3.1, endSec: 4.6 },
      { text: 'TRABAJABA EN HIROSHIMA', highlight: 'HIROSHIMA', startSec: 4.6, endSec: 6.0 },
    ],
  },
  {
    id: 3,
    image: 'scenes/03.jpg',
    startSec: 6.0,
    endSec: 9.2,
    cameraMotion: 'impact-shake',
    isPatternInterrupt: true,
    sfx: { file: 'sfx/sfx_explosion.mp3', startSec: 6.4, volume: 0.45 },
    captions: [
      { text: 'UN DESTELLO CEGADOR', highlight: 'DESTELLO CEGADOR', startSec: 6.0, endSec: 7.6 },
      { text: 'LO BORRÓ TODO', highlight: 'TODO', startSec: 7.6, endSec: 9.2 },
    ],
  },
  {
    id: 4,
    image: 'scenes/04.jpg',
    startSec: 9.2,
    endSec: 12.2,
    cameraMotion: 'zoom-in',
    captions: [
      { text: 'SOBREVIVIÓ DE MILAGRO', highlight: 'MILAGRO', startSec: 9.2, endSec: 10.7 },
      { text: 'CON QUEMADURAS GRAVES', highlight: 'GRAVES', startSec: 10.7, endSec: 12.2 },
    ],
  },
  {
    id: 5,
    image: 'scenes/05.jpg',
    startSec: 12.2,
    endSec: 15.6,
    cameraMotion: 'pan-left',
    isPatternInterrupt: true,
    sfx: { file: 'sfx/sfx_train.mp3', startSec: 13.5, volume: 0.35 },
    captions: [
      { text: '¿LO PEOR? AL DÍA SIGUIENTE...', highlight: 'DÍA SIGUIENTE', startSec: 12.2, endSec: 14.0 },
      { text: 'VOLVIÓ A SU PUEBLO NATAL', highlight: 'PUEBLO NATAL', startSec: 14.0, endSec: 15.6 },
    ],
  },
  {
    id: 6,
    image: 'scenes/06.jpg',
    startSec: 15.6,
    endSec: 17.5,
    cameraMotion: 'zoom-out',
    captions: [
      { text: '¡A NAGASAKI!', highlight: '¡A NAGASAKI!', startSec: 15.6, endSec: 17.5 },
    ],
  },
  {
    id: 7,
    image: 'scenes/07.jpg',
    startSec: 17.5,
    endSec: 20.5,
    cameraMotion: 'zoom-in',
    isPatternInterrupt: true,
    captions: [
      { text: 'CUANDO LE CONTABA A SU JEFE', highlight: 'SU JEFE', startSec: 17.5, endSec: 19.2 },
      { text: 'LO QUE PASÓ...', highlight: 'PASÓ...', startSec: 19.2, endSec: 20.5 },
    ],
  },
  {
    id: 8,
    image: 'scenes/08.jpg',
    startSec: 20.5,
    endSec: 23.8,
    cameraMotion: 'impact-shake',
    sfx: { file: 'sfx/sfx_explosion.mp3', startSec: 20.6, volume: 0.5 },
    captions: [
      { text: '¡PUM!', highlight: '¡PUM!', startSec: 20.5, endSec: 21.6 },
      { text: 'CAYÓ LA SEGUNDA BOMBA', highlight: 'SEGUNDA BOMBA', startSec: 21.6, endSec: 23.8 },
    ],
  },
  {
    id: 9,
    image: 'scenes/09.jpg',
    startSec: 23.8,
    endSec: 26.8,
    cameraMotion: 'zoom-out',
    isPatternInterrupt: true,
    captions: [
      { text: 'ESTABA EN EL EPICENTRO...', highlight: 'EPICENTRO', startSec: 23.8, endSec: 25.3 },
      { text: '¡OTRA VEZ!', highlight: '¡OTRA VEZ!', startSec: 25.3, endSec: 26.8 },
    ],
  },
  {
    id: 10,
    image: 'scenes/10.jpg',
    startSec: 26.8,
    endSec: 30.0,
    cameraMotion: 'zoom-in',
    captions: [
      { text: 'VOLVIÓ A SOBREVIVIR', highlight: 'SOBREVIVIR', startSec: 26.8, endSec: 28.4 },
      { text: 'SALIÓ ILESO DE LA ZONA CERO', highlight: 'ILESO', startSec: 28.4, endSec: 30.0 },
    ],
  },
  {
    id: 11,
    image: 'scenes/11.jpg',
    startSec: 30.0,
    endSec: 33.4,
    cameraMotion: 'pan-right',
    isPatternInterrupt: true,
    sfx: { file: 'sfx/sfx_chime.mp3', startSec: 31.8, volume: 0.35 },
    captions: [
      { text: 'LOS MÉDICOS NO ENTENDÍAN NADA', highlight: 'NADA', startSec: 30.0, endSec: 31.7 },
      { text: 'SU CUERPO ERA DE ACERO', highlight: 'DE ACERO', startSec: 31.7, endSec: 33.4 },
    ],
  },
  {
    id: 12,
    image: 'scenes/12.jpg',
    startSec: 33.4,
    endSec: 36.8,
    cameraMotion: 'zoom-in',
    captions: [
      { text: 'VIVIÓ HASTA LOS 93 AÑOS', highlight: '93 AÑOS', startSec: 33.4, endSec: 35.1 },
      { text: 'DESAFIANDO A LA CIENCIA', highlight: 'CIENCIA', startSec: 35.1, endSec: 36.8 },
    ],
  },
  {
    id: 13,
    image: 'scenes/13.jpg',
    startSec: 36.8,
    endSec: 40.2,
    cameraMotion: 'zoom-out',
    isPatternInterrupt: true,
    captions: [
      { text: '¿SUERTE EXTREMA O EL HOMBRE', highlight: 'SUERTE EXTREMA', startSec: 36.8, endSec: 38.5 },
      { text: 'MÁS DESAFORTUNADO?', highlight: 'DESAFORTUNADO', startSec: 38.5, endSec: 40.2 },
    ],
  },
  {
    id: 14,
    image: 'scenes/14.jpg',
    startSec: 40.2,
    endSec: 41.8,
    cameraMotion: 'pan-left',
    captions: [
      { text: 'COMENTA QUÉ HABRÍAS HECHO TÚ', highlight: 'COMENTA', startSec: 40.2, endSec: 41.8 },
    ],
  },
  {
    id: 15,
    image: 'scenes/15.jpg',
    startSec: 41.8,
    endSec: 42.9,
    cameraMotion: 'zoom-in',
    captions: [
      { text: 'PORQUE ESTE HOMBRE...', highlight: 'ESTE HOMBRE...', startSec: 41.8, endSec: 42.9 },
    ],
  },
  {
    id: 16,
    image: 'scenes/16.jpg',
    startSec: 42.9,
    endSec: 43.5,
    cameraMotion: 'zoom-in',
    captions: [],
  },
];
