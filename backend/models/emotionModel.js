import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // 🔥 Indexed for fast lookups
        },
        detectedEmotion: {
            type: String,
            enum: [
                "Happy",
                "Sad",
                "Angry",
                "Fearful",
                "Surprised",
                "Disgusted",
                "Neutral",
                "Stressed",
                "Anxious",
                "Depressed",
                "Excited",
            ],
            required: true,
        },
        confidenceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 1, // AI Confidence Score (0 to 1)
        },
        sentimentScore: {
            type: Number,
            required: true,
            min: -1,
            max: 1, // Sentiment Analysis (-1: Negative, 0: Neutral, 1: Positive)
        },
        inputSource: {
            type: String,
            enum: ["Text", "Voice", "Facial Expression", "Multi-Modal"],
            required: true,
        },
        facialAnalysis: {
            happiness: { type: Number, min: 0, max: 1 },
            sadness: { type: Number, min: 0, max: 1 },
            anger: { type: Number, min: 0, max: 1 },
            surprise: { type: Number, min: 0, max: 1 },
            neutral: { type: Number, min: 0, max: 1 },
        },
        voiceAnalysis: {
            pitch: Number, // Voice Pitch Variation
            tone: String, // Tone Classification
            stressLevel: Number, // AI-based stress prediction
        },
        textAnalysis: {
            keywords: [String], // AI-extracted keywords
            sentimentIntensity: Number, // Strength of detected sentiment
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// 🔥 **MongoDB Indexing for Performance**
emotionSchema.index({ userId: 1, timestamp: -1 });

// 📌 **Hide Sensitive Fields in API Responses**
emotionSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Emotion = mongoose.model("Emotion", emotionSchema);
export default Emotion;