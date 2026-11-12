// Shared helpers for opening the camera/microphone and explaining failures.

export const isMediaSupported = (): boolean =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function';

const errorName = (err: unknown): string =>
  err && typeof err === 'object' && 'name' in err ? String((err as { name: unknown }).name) : '';

/**
 * Opens a camera. If the request fails because of the microphone (missing,
 * busy or blocked), it retries with video only so the camera still works.
 * If the device rejects the requested resolution, it retries with defaults.
 */
export async function requestCameraStream(options: {
  audio: boolean;
  width?: number;
  height?: number;
}): Promise<{ stream: MediaStream; hasAudio: boolean }> {
  if (!isMediaSupported()) {
    throw Object.assign(new Error('UNSUPPORTED'), { name: 'UnsupportedBrowserError' });
  }

  const video: MediaTrackConstraints = {
    facingMode: 'user',
    ...(options.width ? { width: { ideal: options.width } } : {}),
    ...(options.height ? { height: { ideal: options.height } } : {}),
  };

  const request = (audio: boolean, v: MediaTrackConstraints | boolean) =>
    navigator.mediaDevices.getUserMedia({ video: v, audio });

  try {
    const stream = await request(options.audio, video);
    return { stream, hasAudio: options.audio && stream.getAudioTracks().length > 0 };
  } catch (err) {
    const name = errorName(err);
    if (name === 'OverconstrainedError') {
      const stream = await request(options.audio, true);
      return { stream, hasAudio: options.audio && stream.getAudioTracks().length > 0 };
    }
    if (options.audio && ['NotFoundError', 'NotAllowedError', 'NotReadableError', 'AbortError'].includes(name)) {
      const stream = await request(false, video);
      return { stream, hasAudio: false };
    }
    throw err;
  }
}

/** Arabic message for a camera/microphone failure. */
export function describeMediaError(err: unknown): string {
  const name = errorName(err);
  switch (name) {
    case 'UnsupportedBrowserError':
      return 'المتصفح لا يدعم الكاميرا، أو الموقع لا يعمل عبر HTTPS. افتح الموقع بعنوان آمن ثم أعد المحاولة.';
    case 'NotAllowedError':
    case 'SecurityError':
      return 'تم رفض إذن الكاميرا. اسمح بالوصول من إعدادات الموقع في المتصفح ثم أعد المحاولة.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'لم يتم العثور على كاميرا متصلة بهذا الجهاز.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'الكاميرا مستخدمة من تطبيق آخر. أغلق التطبيق الآخر ثم أعد المحاولة.';
    case 'OverconstrainedError':
      return 'إعدادات الكاميرا غير مدعومة في هذا الجهاز.';
    default:
      return 'تعذر تشغيل الكاميرا. تحقق من الأذونات والجهاز ثم أعد المحاولة.';
  }
}

/** Calls onEnded when the camera is disconnected or revoked while in use. */
export function watchStreamEnded(stream: MediaStream, onEnded: () => void): void {
  stream.getTracks().forEach((track) => {
    track.addEventListener('ended', () => {
      // Only react when no live track is left in this stream.
      if (!stream.getTracks().some((t) => t.readyState === 'live')) onEnded();
    });
  });
}
