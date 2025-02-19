const speechRecognition = require("@google-cloud/speech"); // Google Speech-to-Text API
const textToSpeech = require("@google-cloud/text-to-speech"); // Google TTS API
const { analyzeVoiceEmotion } = require("../utils/voiceProcessor"); // AI-based emotion detection
const fs = require("fs");
const util = require("util");

// Google Cloud Clients
const speechClient = new speechRecognition.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * Converts speech (audio file) to text using Google Speech-to-Text API.
 * @param {Buffer} audioData - Audio file buffer
 * @returns {Object} - Transcribed text and confidence score
 */
const convertSpeechToText = async (audioData) => {
  if (!audioData) return { error: "No audio provided" };

  try {
    const request = {
      audio: { content: audioData.toString("base64") },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results.map((result) => result.alternatives[0].transcript).join("\n");

    return { text: transcription, confidence: response.results[0].alternatives[0].confidence };
  } catch (error) {
    console.error("Speech Recognition Error:", error);
    return { error: "Failed to process speech-to-text" };
  }
};

/**
 * Converts text to speech (TTS) using Google Text-to-Speech API.
 * @param {string} text - Text to be converted to speech
 * @returns {Buffer} - Audio file buffer
 */
const convertTextToSpeech = async (text) => {
  if (!text) return { error: "No text provided" };

  try {
    const request = {
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error("Text-to-Speech Error:", error);
    return { error: "Failed to generate speech" };
  }
};

/**
 * Detects emotions from a user's voice input.
 * @param {Buffer} audioData - Audio file buffer
 * @returns {Object} - Detected emotion and confidence score
 */
const analyzeVoiceEmotionState = async (audioData) => {
  if (!audioData) return { error: "No audio data provided" };

  try {
    const emotionResult = await analyzeVoiceEmotion(audioData);
    return emotionResult;
  } catch (error) {
    console.error("Voice Emotion Detection Error:", error);
    return { error: "Voice emotion analysis failed" };
  }
};

/**
 * Full Voice Processing Pipeline: Speech-to-Text, Emotion Detection, and Response.
 * @param {Buffer} audioData - User's voice input
 * @returns {Object} - Response containing transcribed text, detected emotion, and AI-generated voice reply
 */
const processVoiceInteraction = async (audioData) => {
  const speechText = await convertSpeechToText(audioData);
  if (speechText.error) return { error: "Speech processing failed" };

  const emotionState = await analyzeVoiceEmotionState(audioData);
  const aiResponseText = `I detected that you are feeling ${emotionState.emotion}. How can I assist you?`;

  const voiceReply = await convertTextToSpeech(aiResponseText);

  return {
    transcribedText: speechText.text,
    detectedEmotion: emotionState,
    aiVoiceResponse: voiceReply,
  };
};

module.exports = {
  convertSpeechToText,
  convertTextToSpeech,
  analyzeVoiceEmotionState,
  processVoiceInteraction,
};