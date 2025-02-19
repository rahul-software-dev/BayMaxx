const { analyzeTextSentiment } = require("../utils/nlpProcessor"); // NLP sentiment analysis
const { analyzeVoiceEmotion } = require("../utils/voiceProcessor"); // Voice-based emotion detection
const { analyzeFacialExpression } = require("../utils/visionProcessor"); // Facial recognition
const { updateUserMoodHistory } = require("../database/userMoodModel"); // Store mood history

/**
 * Detects sentiment from a given text input.
 * @param {string} text - User's input text
 * @returns {Object} - Detected sentiment and confidence score
 */
const detectTextSentiment = async (text) => {
  if (!text) return { error: "No text provided" };

  try {
    const sentimentResult = await analyzeTextSentiment(text);
    return sentimentResult;
  } catch (error) {
    console.error("Text Sentiment Analysis Error:", error);
    return { error: "Sentiment analysis failed" };
  }
};

/**
 * Analyzes user's voice input to detect emotions.
 * @param {Buffer} voiceData - Audio file buffer
 * @returns {Object} - Detected emotion and confidence score
 */
const detectVoiceEmotion = async (voiceData) => {
  if (!voiceData) return { error: "No voice data provided" };

  try {
    const emotionResult = await analyzeVoiceEmotion(voiceData);
    return emotionResult;
  } catch (error) {
    console.error("Voice Emotion Analysis Error:", error);
    return { error: "Voice emotion analysis failed" };
  }
};

/**
 * Analyzes user's facial expression to detect mood.
 * @param {Buffer} imageData - Image file buffer
 * @returns {Object} - Detected facial expression and mood
 */
const detectFacialExpression = async (imageData) => {
  if (!imageData) return { error: "No image data provided" };

  try {
    const expressionResult = await analyzeFacialExpression(imageData);
    return expressionResult;
  } catch (error) {
    console.error("Facial Expression Analysis Error:", error);
    return { error: "Facial emotion analysis failed" };
  }
};

/**
 * Combines all emotion detection methods to get a complete emotional profile.
 * @param {string} text - User's text input
 * @param {Buffer} voiceData - User's voice input
 * @param {Buffer} imageData - User's image input
 * @returns {Object} - Overall emotional state with confidence levels
 */
const analyzeUserEmotion = async (text, voiceData, imageData) => {
  const textEmotion = text ? await detectTextSentiment(text) : null;
  const voiceEmotion = voiceData ? await detectVoiceEmotion(voiceData) : null;
  const facialEmotion = imageData ? await detectFacialExpression(imageData) : null;

  const emotions = {
    text: textEmotion,
    voice: voiceEmotion,
    facial: facialEmotion,
  };

  // Update user mood history
  await updateUserMoodHistory(emotions);

  return emotions;
};

module.exports = {
  detectTextSentiment,
  detectVoiceEmotion,
  detectFacialExpression,
  analyzeUserEmotion,
};