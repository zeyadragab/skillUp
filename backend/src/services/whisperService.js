import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param {string} audioFilePath - Path to audio file (mp3, mp4, wav, etc.)
 * @param {Object} options - Transcription options
 * @returns {Object} Transcript with timestamps
 */
export const transcribeAudio = async (audioFilePath, options = {}) => {
  try {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[Whisper] Transcribing audio file: ${audioFilePath}`);

    // Create read stream for the audio file
    const audioStream = fs.createReadStream(audioFilePath);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language: options.language || 'en',
      response_format: options.responseFormat || 'verbose_json', // includes timestamps
      timestamp_granularities: ['segment'], // Get segment-level timestamps
      temperature: 0.2 // Lower temperature for more accurate transcription
    });

    console.log('[Whisper] ✅ Transcription completed');

    return transcription;
  } catch (error) {
    console.error('[Whisper] ❌ Transcription error:', error);
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
};

/**
 * Transcribe and format for session summary
 * @param {string} audioFilePath - Path to recording
 * @param {Object} sessionInfo - Session metadata (teacher/learner names, etc.)
 * @returns {Array} Formatted transcript array
 */
export const transcribeSessionRecording = async (audioFilePath, sessionInfo = {}) => {
  try {
    const transcription = await transcribeAudio(audioFilePath);

    // Format transcript for session summary
    const formattedTranscript = [];

    if (transcription.segments) {
      for (const segment of transcription.segments) {
        // Determine speaker (this is simplified - real implementation would need speaker diarization)
        // For now, we'll alternate or use a simple heuristic
        const speaker = determineSpeaker(segment, formattedTranscript.length);

        formattedTranscript.push({
          speaker: speaker,
          speakerName: speaker === 'teacher' ? sessionInfo.teacherName : sessionInfo.learnerName,
          text: segment.text.trim(),
          timestamp: Math.floor(segment.start), // Convert to seconds
          startTime: new Date(Date.now() + segment.start * 1000),
          endTime: new Date(Date.now() + segment.end * 1000)
        });
      }
    } else {
      // Fallback if segments not available
      formattedTranscript.push({
        speaker: 'teacher',
        speakerName: sessionInfo.teacherName || 'Teacher',
        text: transcription.text,
        timestamp: 0
      });
    }

    return formattedTranscript;
  } catch (error) {
    console.error('[Whisper] Error transcribing session recording:', error);
    throw error;
  }
};

/**
 * Simple speaker determination (placeholder for real speaker diarization)
 * In production, you'd use a speaker diarization service or model
 */
function determineSpeaker(segment, segmentIndex) {
  // Simple alternating pattern (placeholder)
  // Real implementation would use:
  // - Speaker diarization API (e.g., AssemblyAI, Deepgram, or Pyannote)
  // - Voice characteristics analysis
  // - Turn-taking patterns

  // For now, assume teacher speaks more at the beginning
  if (segmentIndex < 3) return 'teacher';

  // Then alternate every 2-3 segments
  return (segmentIndex % 5 < 3) ? 'teacher' : 'learner';
}

/**
 * Transcribe from Agora cloud recording
 * @param {string} recordingUrl - URL to Agora recording
 * @param {Object} sessionInfo - Session metadata
 * @returns {Array} Formatted transcript
 */
export const transcribeAgoraRecording = async (recordingUrl, sessionInfo) => {
  try {
    console.log('[Whisper] Downloading Agora recording from:', recordingUrl);

    // Download recording to temp file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `recording-${Date.now()}.mp4`);

    // Download file
    const response = await fetch(recordingUrl);
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    console.log('[Whisper] Recording downloaded to:', tempFilePath);

    // Transcribe
    const transcript = await transcribeSessionRecording(tempFilePath, sessionInfo);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log('[Whisper] Temp file cleaned up');

    return transcript;
  } catch (error) {
    console.error('[Whisper] Error transcribing Agora recording:', error);
    throw error;
  }
};

/**
 * Check if Whisper API is available
 */
export const isWhisperAvailable = () => {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';
};

export default {
  transcribeAudio,
  transcribeSessionRecording,
  transcribeAgoraRecording,
  isWhisperAvailable
};
