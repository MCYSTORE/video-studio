import { Config } from '@remotion/cli/config';
import { existsSync } from 'node:fs';

// Reuse the installed browser in this cloud machine, with a portable fallback.
if (existsSync('/usr/bin/chromium')) Config.setBrowserExecutable('/usr/bin/chromium');
Config.setConcurrency(2);
Config.setCodec('h264');
Config.setAudioCodec('aac');
Config.setAudioBitrate('192k');
Config.setPixelFormat('yuv420p');
Config.setCrf(20);
