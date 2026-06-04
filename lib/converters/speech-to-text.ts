// @xenova/transformers loaded dynamically

let transcriber: any = null;

export interface SpeechToTextOptions {
  language?: string; // e.g. 'turkish', 'english'
}

export async function convertSpeechToText(
  file: File,
  options: SpeechToTextOptions,
  onProgress?: (data: { status: string; progress?: number; name?: string; loaded?: number; total?: number }) => void
): Promise<{ blob: Blob; filename: string; originalSize: number; convertedSize: number }> {
  
  if (!transcriber) {
    // Load the multilingual whisper model
    const { pipeline } = await import('@xenova/transformers');
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: (data: any) => {
        if (onProgress) {
          onProgress(data);
        }
      }
    });
  }

  // Start inference decoding
  if (onProgress) {
    onProgress({ status: 'decoding' });
  }

  // Decode audio using browser's AudioContext (needs to be 16kHz)
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Transformers.js Whisper expects mono audio Float32Array
  let audioData = audioBuffer.getChannelData(0);
  
  // If stereo, average the channels (though getting channel 0 is usually fine for speech)
  if (audioBuffer.numberOfChannels > 1) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    audioData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      audioData[i] = (left[i] + right[i]) / 2;
    }
  }

  if (onProgress) {
    onProgress({ status: 'inferencing' });
  }

  // Run the model
  const output = await transcriber(audioData, {
    language: options.language || 'turkish',
    task: 'transcribe',
  });

  const text = output.text;
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const filename = file.name.replace(/\.[^/.]+$/, "") + ".txt";

  return {
    blob,
    filename,
    originalSize: file.size,
    convertedSize: blob.size,
  };
}
