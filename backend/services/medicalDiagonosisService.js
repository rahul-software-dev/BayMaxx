const axios = require("axios"); // For API requests (optional)
const medicalDB = require("../data/medical_knowledge_base.json"); // Medical dataset
const { preprocessText, tokenize } = require("../utils/nlpProcessor"); // NLP utilities
const { trainDiseaseModel, predictDisease } = require("../utils/aiModel"); // AI model utilities

/**
 * Predicts potential diseases based on symptoms
 * @param {Array} symptoms - List of reported symptoms
 * @returns {Object} - Predicted diseases & confidence scores
 */
const diagnoseDisease = async (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return { error: "No symptoms provided" };
  }

  try {
    // Preprocess input symptoms (normalize text)
    const processedSymptoms = symptoms.map(preprocessText);
    
    // AI-based disease prediction
    const prediction = await predictDisease(processedSymptoms);

    return {
      predictedDiseases: prediction.diseases,
      confidenceScores: prediction.confidences,
    };
  } catch (error) {
    console.error("Disease Diagnosis Error:", error);
    return { error: "Diagnosis failed" };
  }
};

/**
 * Provides treatment suggestions based on diagnosed disease
 * @param {string} disease - Diagnosed disease name
 * @returns {Object} - Recommended treatments & medication
 */
const suggestTreatment = (disease) => {
  if (!disease) return { error: "No disease provided" };

  const treatment = medicalDB.treatments[disease] || "No treatment available";
  return { disease, treatment };
};

/**
 * Checks risk factors based on symptoms & medical history
 * @param {Array} symptoms - User's reported symptoms
 * @param {Object} medicalHistory - User's past health records
 * @returns {Object} - Risk assessment report
 */
const assessRiskFactors = (symptoms, medicalHistory) => {
  if (!symptoms.length || !medicalHistory) return { riskLevel: "Unknown" };

  let riskScore = 0;
  symptoms.forEach((symptom) => {
    if (medicalHistory.chronicDiseases.includes(symptom)) riskScore += 2;
    if (medicalHistory.allergies.includes(symptom)) riskScore += 1;
  });

  return { riskLevel: riskScore > 3 ? "High" : "Low" };
};

module.exports = {
  diagnoseDisease,
  suggestTreatment,
  assessRiskFactors,
};