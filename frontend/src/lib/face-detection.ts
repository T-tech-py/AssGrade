'use client';

type NativeFaceDetectorInstance = {
  detect: (image: ImageBitmapSource) => Promise<Array<{ boundingBox?: DOMRectReadOnly }>>;
};

type FaceDetectionResult = {
  count: number;
  engine: 'native' | 'tfjs' | 'unavailable';
};

declare global {
  interface Window {
    FaceDetector?: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => NativeFaceDetectorInstance;
  }
}

let nativeDetector: NativeFaceDetectorInstance | null = null;
let nativeDetectorAvailable = true;
let tfDetectorPromise: Promise<any | null> | null = null;

async function getNativeDetector() {
  if (!nativeDetectorAvailable || typeof window === 'undefined' || !window.FaceDetector) {
    return null;
  }

  if (!nativeDetector) {
    nativeDetector = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 5,
    });
  }

  return nativeDetector;
}

async function getTfDetector() {
  if (tfDetectorPromise) {
    return tfDetectorPromise;
  }

  tfDetectorPromise = (async () => {
    try {
      const [{ default: tf }, blazeface] = await Promise.all([
        import('@tensorflow/tfjs-core'),
        import('@tensorflow-models/blazeface'),
        import('@tensorflow/tfjs-backend-webgl'),
        import('@tensorflow/tfjs-backend-cpu'),
      ]);

      const candidateBackends = ['webgl', 'cpu'] as const;
      let backendReady = false;

      for (const backend of candidateBackends) {
        try {
          if (tf.getBackend() !== backend) {
            await tf.setBackend(backend);
          }
          await tf.ready();
          backendReady = true;
          break;
        } catch {
          // Try the next available backend.
        }
      }

      if (!backendReady) {
        return null;
      }

      return blazeface.load();
    } catch {
      return null;
    }
  })();

  return tfDetectorPromise;
}

export async function detectFacesFromVideo(
  video: HTMLVideoElement,
): Promise<FaceDetectionResult> {
  const native = await getNativeDetector();

  if (native) {
    try {
      const faces = await native.detect(video);
      return {
        count: faces.length,
        engine: 'native',
      };
    } catch {
      nativeDetectorAvailable = false;
      nativeDetector = null;
    }
  }

  const tfDetector = await getTfDetector();
  if (!tfDetector) {
    return {
      count: 0,
      engine: 'unavailable',
    };
  }

  try {
    const faces = await tfDetector.estimateFaces(video, false);
    return {
      count: faces.length,
      engine: 'tfjs',
    };
  } catch {
    return {
      count: 0,
      engine: 'unavailable',
    };
  }
}
