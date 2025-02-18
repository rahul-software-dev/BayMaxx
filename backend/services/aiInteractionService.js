// aiInteractionService.js - Industry-Grade AI Interaction Service
import OpenAI from "openai";
import aiInteractionModel from "../models/aiInteractionModel.js";
import emotionModel from "../models/emotionModel.js";
import medicalDiagnosis from "../modules/medicalDiagnosis.js";
import sentimentAnalysis from "../modules/sentimentAnalysis.js";
import logger from "../utils/logger.js";

class AIInteractionService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Processes user input and generates AI response.
   * @param {Object} user - The user object (with ID, name, history).
   * @param {String} input - User's text input.
   * @returns {Object} - AI response with metadata.
   */
  async processUserInput(user, input) {
    try {
      // 1️⃣ Analyze Sentiment & Emotion
      const sentiment = await sentimentAnalysis.analyze(input);
      const detectedEmotion = await emotionModel.detectEmotion(input);

      // 2️⃣ Check Contextual Memory (Get last 5 interactions)
      const interactionHistory = await aiInteractionModel
        .find({ userId: user.id })
        .sort({ timestamp: -1 })
        .limit(5);

      // 3️⃣ If medical symptoms are detected, trigger medical analysis
      let medicalResponse = null;
      if (this.containsMedicalKeywords(input)) {
        medicalResponse = await medicalDiagnosis.getDiagnosis(input);
      }

      // 4️⃣ Generate AI Response using OpenAI (GPT)
      const aiResponse = await this.generateAIResponse(input, interactionHistory, detectedEmotion);

      // 5️⃣ Store Interaction in Database
      const savedInteraction = new aiInteractionModel({
        userId: user.id,
        userInput: input,
        aiResponse,
        sentiment,
        emotion: detectedEmotion,
      });
      await savedInteraction.save();

      return {
        success: true,
        aiResponse,
        sentiment,
        detectedEmotion,
        medicalResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("AI Processing Error: ", error);
      throw new Error("AI interaction failed.");
    }
  }

  /**
   * Uses OpenAI/GPT to generate AI response based on input.
   * @param {String} input - User's text input.
   * @param {Array} history - Previous interactions.
   * @param {String} emotion - Detected emotion.
   * @returns {String} - AI-generated response.
   */
  async generateAIResponse(input, history, emotion) {
    const prompt = `
      You are BayMaxx, an AI companion. 
      The user said: "${input}" 
      Emotion detected: ${emotion} 
      Past Context: ${JSON.stringify(history)}
      Reply intelligently in a human-like manner.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return response?.choices?.[0]?.message?.content || "I'm not sure how to respond.";
  }

  /**
   * Checks if the input contains medical-related keywords.
   * @param {String} input - User input.
   * @returns {Boolean} - True if medical terms are detected.
   */
  containsMedicalKeywords(input) {
    const medicalTerms = ["fever", "headache", "pain", "cough", "dizziness", "fatigue"];
    return medicalTerms.some((term) => input.toLowerCase().includes(term));
  }
}

export default new AIInteractionService();