import mongoose from "mongoose";

const aiInteractionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // 🔥 Indexed for fast lookups
        },
        sessionId: {
            type: String,
            required: true,
            index: true, // 🔥 Enables efficient retrieval of session-based conversations
        },
        interactionType: {
            type: String,
            enum: ["Text", "Voice", "Multimodal"],
            required: true,
        },
        query: {
            type: String,
            required: true,
            trim: true,
        },
        response: {
            type: String,
            required: true,
        },
        emotionAnalysis: {
            emotion: { type: String, enum: ["Happy", "Sad", "Angry", "Neutral", "Stressed", "Anxious"] },
            confidenceScore: { type: Number, min: 0, max: 1 }, // AI confidence level in emotion detection
        },
        aiInsights: {
            sentimentScore: { type: Number, min: -1, max: 1 }, // NLP-based sentiment analysis score
            medicalRelevance: { type: Boolean, default: false }, // Flags if conversation is medically relevant
            actionSuggested: { type: String, default: null }, // Suggested next step (e.g., "Consult Doctor", "Take Rest", "Emergency Alert")
        },
        metadata: {
            language: { type: String, default: "en" }, // Supports multi-language interactions
            interactionTime: { type: Date, default: Date.now },
            responseTimeMs: { type: Number, default: 0 }, // AI response time in milliseconds
        },
    },
    { timestamps: true }
);

// 🔥 **MongoDB Indexing for Optimized Performance**
aiInteractionSchema.index({ userId: 1, sessionId: 1, "metadata.interactionTime": -1 });

// 📌 **Hide Sensitive Fields in API Responses**
aiInteractionSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const AIInteraction = mongoose.model("AIInteraction", aiInteractionSchema);
export default AIInteraction;