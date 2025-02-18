const natural = require("natural"); // NLP processing library
const Sentiment = require("sentiment");
const facialRecognition = require("../utils/facialRecognition"); // Custom facial analysis module
const voiceEmotion = require("../utils/voiceEmotion"); // Custom voice emotion analysis module

const sentimentAnalyzer = new Sentiment();

/**
 * Analyze text-based emotion using NLP
 * @param {string} text - User input text
 * @returns {object} - Detected emotion & confidence score
 */
const analyzeTextEmotion = (text) => {
  if (!text) return { emotion: "Neutral", confidence: 0.5 };

  const sentimentResult = sentimentAnalyzer.analyze(text);
  let emotion = "Neutral";

  if (sentimentResult.score > 3) emotion = "Happy";
  else if (sentimentResult.score > 1) emotion = "Calm";
  else if (sentimentResult.score < -3) emotion = "Angry";
  else if (sentimentResult.score < -1) emotion = "Sad";

  return { emotion, confidence: Math.abs(sentimentResult.score / 10) };
};

/**
 * Analyze voice-based emotion using AI models
 * @param {string} audioFilePath - Path to the recorded voice file
 * @returns {object} - Detected emotion & confidence score
 */
const analyzeVoiceEmotion = async (audioFilePath) => {
  try {
    const result = await voiceEmotion.detectEmotion(audioFilePath);
    return result;
  } catch (error) {
    console.error("Voice Emotion Analysis Error:", error);
    return { emotion: "Unknown", confidence: 0 };
  }
};

/**
 * Analyze facial expressions for emotional detection
 * @param {string} imageFilePath - Path to the captured facial image
 * @returns {object} - Detected emotion & confidence score
 */
const analyzeFacialEmotion = async (imageFilePath) => {
  try {
    const result = await facialRecognition.detectEmotion(imageFilePath);
    return result;
  } catch (error) {
    console.error("Facial Emotion Analysis Error:", error);
    return { emotion: "Unknown", confidence: 0 };
  }
};

/**
 * Multi-Modal Emotion Analysis (Combining Text, Voice, and Facial Data)
 * @param {object} data - User input containing text, voice, or image
 * @returns {object} - Final emotion prediction & confidence score
 */
const analyzeEmotion = async (data) => {
  let results = [];

  if (data.text) results.push(analyzeTextEmotion(data.text));
  if (data.audio) results.push(await analyzeVoiceEmotion(data.audio));
  if (data.image) results.push(await analyzeFacialEmotion(data.image));

  if (results.length === 0) return { emotion: "Neutral", confidence: 0.5 };

  // Aggregate emotion results
  let emotionScores = {};
  results.forEach((res) => {
    if (!emotionScores[res.emotion]) emotionScores[res.emotion] = 0;
    emotionScores[res.emotion] += res.confidence;
  });

  // Determine final dominant emotion
  let dominantEmotion = Object.keys(emotionScores).reduce((a, b) =>
    emotionScores[a] > emotionScores[b] ? a : b
  );

  return { emotion: dominantEmotion, confidence: emotionScores[dominantEmotion] / results.length };
};

module.exports = {
  analyzeTextEmotion,
  analyzeVoiceEmotion,
  analyzeFacialEmotion,
  analyzeEmotion,
};