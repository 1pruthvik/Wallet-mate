const mongoose = require("mongoose");

const examAttemptSchema = new mongoose.Schema({
    attemptId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, default: "" },
    score: { type: Number, required: true },
    grade: { type: String, enum: ["PASS", "HONORS", "DISTINCTION", "FAILED"], required: true },
    passed: { type: Boolean, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    attemptDate: { type: Date, default: Date.now },
    skillBreakdown: { type: Map, of: Object, default: {} },
    questionsAnswered: { type: Number, default: 100 }
});

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    pathId: { type: String, required: true },
    pathTitle: { type: String, required: true },
    recipientName: { type: String, required: true },
    score: { type: Number, required: true },
    grade: { type: String, enum: ["PASS", "HONORS", "DISTINCTION"], required: true },
    skillsValidated: [{ type: String }],
    issuedAt: { type: Date, default: Date.now },
    verificationUrl: { type: String }
});

const diplomaSchema = new mongoose.Schema({
    diplomaId: { type: String, required: true, unique: true },
    pathId: { type: String, required: true },
    pathTitle: { type: String, required: true },
    recipientName: { type: String, required: true },
    coursesCompleted: [{ type: String }],
    issuedAt: { type: Date, default: Date.now }
});

const courseProgressSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    lessonsCompleted: [{ type: String }],
    progressPct: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    examReady: { type: Boolean, default: false },
    bestQuizScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed", "Exam Ready", "Certified", "Honors", "Distinction"],
        default: "Not Started"
    },
    updatedAt: { type: Date, default: Date.now }
});

const academyProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        courses: {
            type: Map,
            of: courseProgressSchema,
            default: {}
        },
        certificates: [certificateSchema],
        diplomas: [diplomaSchema],
        examAttempts: [examAttemptSchema],
        tier: {
            type: String,
            enum: ["Associate", "Bronze", "Silver", "Gold", "Platinum", "Diamond"],
            default: "Associate"
        },
        totalXP: { type: Number, default: 0 },
        studyStreakDays: { type: Number, default: 0 },
        lastActiveDate: { type: String, default: "" },
        grandCapstone: {
            unlocked: { type: Boolean, default: false },
            passed: { type: Boolean, default: false },
            score: { type: Number, default: 0 },
            grade: { type: String, default: "" },
            completedAt: { type: Date },
            certificateId: { type: String }
        }
    },
    {
        timestamps: true
    }
);

// Helper method to calculate tier
academyProgressSchema.methods.recalculateTier = function () {
    const certCount = this.certificates.length;
    const diplomaCount = this.diplomas.length;
    const capstonePassed = this.grandCapstone?.passed;

    if (certCount >= 50 && capstonePassed) {
        this.tier = "Diamond"; // Master of Financial Earnings (MFE)
    } else if (certCount >= 35) {
        this.tier = "Platinum";
    } else if (certCount >= 20) {
        this.tier = "Gold";
    } else if (certCount >= 10 || diplomaCount >= 1) {
        this.tier = "Silver";
    } else if (certCount >= 5) {
        this.tier = "Bronze";
    } else {
        this.tier = "Associate";
    }
};

const AcademyProgress = mongoose.models.AcademyProgress || mongoose.model("AcademyProgress", academyProgressSchema);

module.exports = AcademyProgress;
