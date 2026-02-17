import axios from 'axios';
import { generateRtcToken } from './agoraService.js';

/**
 * Agora Cloud Recording Service
 * Handles cloud recording operations for video sessions
 *
 * Documentation: https://docs.agora.io/en/cloud-recording/overview
 */

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;
const AGORA_RECORDING_REGION = process.env.AGORA_RECORDING_REGION || 'NA'; // NA, EU, AP, CN

// Agora Cloud Recording API Base URL
const AGORA_API_BASE = `https://api.agora.io/v1/apps/${AGORA_APP_ID}/cloud_recording`;

/**
 * Generate Basic Auth for Agora API
 * @returns {string} Base64 encoded authorization header
 */
const getAuthHeader = () => {
  const credentials = `${AGORA_CUSTOMER_ID}:${AGORA_CUSTOMER_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

/**
 * Acquire cloud recording resource
 * Step 1: Get resource ID before starting recording
 * @param {string} channelName - Channel name
 * @param {string} uid - Recording user ID (should be different from participants)
 * @returns {Promise<string>} Resource ID
 */
export const acquireRecordingResource = async (channelName, uid = '0') => {
  try {
    const response = await axios.post(
      `${AGORA_API_BASE}/acquire`,
      {
        cname: channelName,
        uid,
        clientRequest: {
          resourceExpiredHour: 24,
          region: AGORA_RECORDING_REGION
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        }
      }
    );

    return response.data.resourceId;
  } catch (error) {
    console.error('Agora acquire resource error:', error.response?.data || error.message);
    throw new Error('Failed to acquire recording resource');
  }
};

/**
 * Start cloud recording
 * Step 2: Start the recording with resource ID
 * @param {string} resourceId - Resource ID from acquire
 * @param {string} channelName - Channel name
 * @param {string} uid - Recording user ID
 * @param {object} storageConfig - Cloud storage configuration
 * @returns {Promise<object>} Recording session info (sid, resourceId)
 */
export const startCloudRecording = async (resourceId, channelName, uid = '0', storageConfig) => {
  try {
    // Generate token for recording bot
    const token = generateRtcToken(channelName, uid, 'publisher');

    // Default storage config (Cloudinary or S3)
    const defaultStorage = storageConfig || {
      vendor: parseInt(process.env.CLOUD_STORAGE_VENDOR || '2'), // 1=S3, 2=Aliyun, 3=Azure, etc.
      region: parseInt(process.env.CLOUD_STORAGE_REGION || '0'),
      bucket: process.env.CLOUD_STORAGE_BUCKET || 'swaply-recordings',
      accessKey: process.env.CLOUD_STORAGE_ACCESS_KEY,
      secretKey: process.env.CLOUD_STORAGE_SECRET_KEY,
      fileNamePrefix: [`recordings`, `${channelName}`]
    };

    const response = await axios.post(
      `${AGORA_API_BASE}/resourceid/${resourceId}/mode/mix/start`,
      {
        cname: channelName,
        uid,
        clientRequest: {
          token,
          recordingConfig: {
            maxIdleTime: 30, // Stop recording after 30s of no activity
            streamTypes: 2, // 0=audio, 1=video, 2=both
            channelType: 0, // 0=communication, 1=live
            videoStreamType: 0, // 0=high, 1=low
            subscribeAudioUids: ['#allstream#'], // Record all audio
            subscribeVideoUids: ['#allstream#'], // Record all video
            subscribeUidGroup: 0
          },
          recordingFileConfig: {
            avFileType: ['hls', 'mp4'] // Output formats
          },
          storageConfig: defaultStorage
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        }
      }
    );

    return {
      resourceId,
      sid: response.data.sid
    };
  } catch (error) {
    console.error('Agora start recording error:', error.response?.data || error.message);
    throw new Error('Failed to start cloud recording');
  }
};

/**
 * Stop cloud recording
 * Step 3: Stop the recording
 * @param {string} resourceId - Resource ID
 * @param {string} sid - Recording session ID
 * @param {string} channelName - Channel name
 * @param {string} uid - Recording user ID
 * @returns {Promise<object>} Recording file information
 */
export const stopCloudRecording = async (resourceId, sid, channelName, uid = '0') => {
  try {
    const response = await axios.post(
      `${AGORA_API_BASE}/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
      {
        cname: channelName,
        uid,
        clientRequest: {}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        }
      }
    );

    return {
      resourceId: response.data.resourceId,
      sid: response.data.sid,
      serverResponse: response.data.serverResponse,
      fileList: response.data.serverResponse?.fileList || []
    };
  } catch (error) {
    console.error('Agora stop recording error:', error.response?.data || error.message);
    throw new Error('Failed to stop cloud recording');
  }
};

/**
 * Query recording status
 * Check the status of an ongoing recording
 * @param {string} resourceId - Resource ID
 * @param {string} sid - Recording session ID
 * @param {string} mode - Recording mode (mix, individual, web)
 * @returns {Promise<object>} Recording status
 */
export const queryRecordingStatus = async (resourceId, sid, mode = 'mix') => {
  try {
    const response = await axios.get(
      `${AGORA_API_BASE}/resourceid/${resourceId}/sid/${sid}/mode/${mode}/query`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader()
        }
      }
    );

    return response.data.serverResponse;
  } catch (error) {
    console.error('Agora query recording error:', error.response?.data || error.message);
    throw new Error('Failed to query recording status');
  }
};

/**
 * Complete recording workflow: acquire → start → store info
 * @param {string} channelName - Channel name
 * @param {string} recordingId - MongoDB Recording document ID
 * @returns {Promise<object>} Recording session info
 */
export const initiateRecording = async (channelName, recordingId) => {
  try {
    // Step 1: Acquire resource
    const uid = `recorder_${recordingId}`;
    const resourceId = await acquireRecordingResource(channelName, uid);

    // Step 2: Start recording
    const recordingSession = await startCloudRecording(resourceId, channelName, uid);

    return {
      resourceId: recordingSession.resourceId,
      sid: recordingSession.sid,
      uid,
      startedAt: new Date()
    };
  } catch (error) {
    console.error('Initiate recording error:', error);
    throw error;
  }
};

/**
 * Complete stop recording workflow
 * @param {string} resourceId - Resource ID
 * @param {string} sid - Session ID
 * @param {string} channelName - Channel name
 * @param {string} uid - Recording user ID
 * @returns {Promise<object>} Recording file info
 */
export const finalizeRecording = async (resourceId, sid, channelName, uid) => {
  try {
    const result = await stopCloudRecording(resourceId, sid, channelName, uid);

    // Extract file URLs from response
    const files = result.fileList.map(file => ({
      fileName: file.fileName,
      trackType: file.trackType, // 'audio', 'video', or 'audio_and_video'
      uid: file.uid,
      mixedAllUser: file.mixedAllUser,
      isPlayable: file.isPlayable,
      sliceStartTime: file.sliceStartTime
    }));

    return {
      ...result,
      files
    };
  } catch (error) {
    console.error('Finalize recording error:', error);
    throw error;
  }
};

/**
 * Validate Agora recording configuration
 * @returns {boolean} Whether recording is properly configured
 */
export const isRecordingConfigured = () => {
  return !!(
    AGORA_APP_ID &&
    AGORA_CUSTOMER_ID &&
    AGORA_CUSTOMER_SECRET &&
    process.env.CLOUD_STORAGE_BUCKET &&
    process.env.CLOUD_STORAGE_ACCESS_KEY &&
    process.env.CLOUD_STORAGE_SECRET_KEY
  );
};

export default {
  acquireRecordingResource,
  startCloudRecording,
  stopCloudRecording,
  queryRecordingStatus,
  initiateRecording,
  finalizeRecording,
  isRecordingConfigured
};
