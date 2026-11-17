import {Config} from '@remotion/cli/config';
process.env.LP_NUM_THREADS ??= '2';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setBrowserExecutable('/usr/bin/chromium');
Config.setChromiumOpenGlRenderer('angle-egl');
Config.setConcurrency(2);
Config.setOverwriteOutput(true);
