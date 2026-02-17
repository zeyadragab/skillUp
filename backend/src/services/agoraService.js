import dotenv from 'dotenv';
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = pkg;

// Load environment variables
dotenv.config();

/**
 * Agora Service for Video Session Management
 * Handles token generation and channel management for real-time video sessions
 */

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// Token expiration time (24 hours in seconds)
const TOKEN_EXPIRATION_TIME = 24 * 3600;

/**
 * Generate Agora RTC (Real-Time Communication) token for video/audio
 * @param {string} channelName - Unique channel identifier
 * @param {string} userId - User ID (0 for any user)
 * @param {string} role - 'publisher' or 'subscriber'
 * @returns {string} Generated RTC token
 */
export const generateRtcToken = (channelName, userId = 0, role = 'publisher') => {
  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Certificate are required. Please check your .env file.');
  }

  // Convert role string to Agora role constant
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Calculate privilege expiration timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + TOKEN_EXPIRATION_TIME;

  // Generate and return token
  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userId,
      agoraRole,
      privilegeExpireTime
    );

    return token;
  } catch (error) {
    console.error('Error generating RTC token:', error);
    throw new Error('Failed to generate video session token');
  }
};

/**
 * Generate Agora RTM (Real-Time Messaging) token for in-call chat
 * @param {string} userId - User ID
 * @returns {string} Generated RTM token
 */
export const generateRtmToken = (userId) => {
  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Certificate are required. Please check your .env file.');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + TOKEN_EXPIRATION_TIME;

  try {
    const token = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      userId,
      RtmRole.Rtm_User,
      privilegeExpireTime
    );

    return token;
  } catch (error) {
    console.error('Error generating RTM token:', error);
    throw new Error('Failed to generate messaging token');
  }
};

/**
 * Generate unique channel name for a session
 * @param {string} sessionId - MongoDB session ID
 * @returns {string} Channel name
 */
export const generateChannelName = (sessionId) => {
  return `session_${sessionId}_${Date.now()}`;
};

/**
 * Validate Agora configuration
 * @returns {boolean} Whether Agora is properly configured
 */
export const isAgoraConfigured = () => {
  return !!(appId && appCertificate &&
    appId !== 'your_agora_app_id' &&
    appCertificate !== 'your_agora_app_certificate');
};

/**
 * Get Agora App ID (safe for client-side)
 * @returns {string} App ID
 */
export const getAppId = () => {
  if (!appId || appId === 'your_agora_app_id') {
    throw new Error('Agora App ID not configured');
  }
  return appId;
};

/**
 * Generate comprehensive session credentials
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID
 * @param {string} role - User role in session
 * @returns {object} Complete session credentials
 */
export const generateSessionCredentials = (sessionId, userId, role = 'publisher') => {
  if (!isAgoraConfigured()) {
    throw new Error('Agora is not properly configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in your environment variables.');
  }

  const channelName = `session_${sessionId}`;
  const rtcToken = generateRtcToken(channelName, userId, role);
  const rtmToken = generateRtmToken(userId.toString());

  return {
    appId: getAppId(),
    channelName,
    rtcToken,
    rtmToken,
    userId: userId.toString(),
    expiresAt: Date.now() + (TOKEN_EXPIRATION_TIME * 1000)
  };
};

export default {
  generateRtcToken,
  generateRtmToken,
  generateChannelName,
  generateSessionCredentials,
  isAgoraConfigured,
  getAppId
};
