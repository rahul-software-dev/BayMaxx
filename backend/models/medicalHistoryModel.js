import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // 🔥 Indexed for faster lookups
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor", // Links to doctor who created the record
            required: false,
        },
        symptoms: [
            {
                name: { type: String, required: true },
                severity: { type: String, enum: ["Mild", "Moderate", "Severe"], required: true },
                duration: { type: String }, // e.g., "3 days", "2 weeks"
                reportedAt: { type: Date, default: Date.now },
            },
        ],
        diagnoses: [
            {
                condition: { type: String, required: true },
                diagnosisDate: { type: Date, default: Date.now },
                diagnosedBy: { type: String }, // Doctor's name or AI System
            },
        ],
        medications: [
            {
                name: { type: String, required: true },
                dosage: { type: String, required: true }, // e.g., "500mg", "2 pills daily"
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: false },
                prescribedBy: { type: String },
            },
        ],
        allergies: [
            {
                allergen: { type: String, required: true },
                reaction: { type: String, required: true },
                severity: { type: String, enum: ["Mild", "Moderate", "Severe"], required: true },
            },
        ],
        labReports: [
            {
                testName: { type: String, required: true },
                result: { type: String, required: true },
                normalRange: { type: String },
                testedAt: { type: Date, default: Date.now },
                labName: { type: String },
            },
        ],
        surgeries: [
            {
                procedure: { type: String, required: true },
                date: { type: Date, required: true },
                hospital: { type: String },
                surgeon: { type: String },
            },
        ],
        healthMetrics: {
            bloodPressure: {
                systolic: { type: Number },
                diastolic: { type: Number },
                unit: { type: String, default: "mmHg" },
                recordedAt: { type: Date, default: Date.now },
            },
            heartRate: { type: Number, min: 40, max: 200 },
            bloodSugar: {
                level: { type: Number },
                unit: { type: String, default: "mg/dL" },
                recordedAt: { type: Date, default: Date.now },
            },
            weight: { type: Number, min: 1 }, // kg
            height: { type: Number, min: 30 }, // cm
        },
        lifestyleFactors: {
            smoking: { type: Boolean, default: false },
            alcoholConsumption: { type: String, enum: ["None", "Occasionally", "Regularly"], default: "None" },
            exerciseFrequency: { type: String, enum: ["None", "1-2 times/week", "3-5 times/week", "Daily"] },
            dietType: { type: String, enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Keto", "Other"] },
        },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// 🔥 **MongoDB Indexing for Faster Retrieval**
medicalHistorySchema.index({ userId: 1, timestamp: -1 });

// 📌 **Hide Sensitive Fields in API Responses**
medicalHistorySchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const MedicalHistory = mongoose.model("MedicalHistory", medicalHistorySchema);
export default MedicalHistory;