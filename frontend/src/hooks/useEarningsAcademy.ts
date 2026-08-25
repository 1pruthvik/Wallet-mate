import { useState, useEffect, useCallback } from "react";
import {
    EARNINGS_COURSES,
    EARNINGS_PATHWAYS,
    PROFESSIONAL_TIERS,
    type EarningsCourse,
    type ProfessionalTier
} from "../data/earningsCertificationData";
import { useAuthStore } from "../store/useAuthStore";

export interface CourseProgressRecord {
    courseId: string;
    lessonsCompleted: string[];
    progressPct: number;
    isCompleted: boolean;
    examReady: boolean;
    bestQuizScore: number;
    status: "Not Started" | "In Progress" | "Completed" | "Exam Ready" | "Certified" | "Honors" | "Distinction";
    lastUpdated?: string;
}

export interface UserCertificate {
    certificateId: string;
    courseId: string;
    courseTitle: string;
    pathId: string;
    pathTitle: string;
    recipientName: string;
    score: number;
    grade: "PASS" | "HONORS" | "DISTINCTION";
    skillsValidated: string[];
    issuedAt: string;
    verificationUrl: string;
}

export interface UserDiploma {
    diplomaId: string;
    pathId: string;
    pathTitle: string;
    recipientName: string;
    coursesCompleted: string[];
    issuedAt: string;
}

export interface UserExamAttempt {
    attemptId: string;
    courseId: string;
    courseTitle: string;
    score: number;
    grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED";
    passed: boolean;
    timeSpentSeconds: number;
    attemptDate: string;
    skillBreakdown: Record<string, { correct: number; total: number; pct: number }>;
    questionsAnswered: number;
}

export interface UserGrandCapstoneState {
    unlocked: boolean;
    passed: boolean;
    score: number;
    grade?: string;
    completedAt?: string;
    certificateId?: string;
}

export interface EarningsAcademyState {
    courses: Record<string, CourseProgressRecord>;
    certificates: UserCertificate[];
    diplomas: UserDiploma[];
    examAttempts: UserExamAttempt[];
    tier: "Associate" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
    totalXP: number;
    studyStreakDays: number;
    lastActiveDate: string;
    grandCapstone: UserGrandCapstoneState;
}

const STORAGE_KEY = "finmitra_earnings_certification_state_v1";

const DEFAULT_STATE: EarningsAcademyState = {
    courses: {},
    certificates: [],
    diplomas: [],
    examAttempts: [],
    tier: "Associate",
    totalXP: 0,
    studyStreakDays: 0,
    lastActiveDate: "",
    grandCapstone: {
        unlocked: false,
        passed: false,
        score: 0
    }
};

export function useEarningsAcademy() {
    const { user, token } = useAuthStore();
    const candidateName = user?.name || "Certified Candidate";

    const [state, setState] = useState<EarningsAcademyState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return DEFAULT_STATE;
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_STATE, ...parsed };
        } catch {
            return DEFAULT_STATE;
        }
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error("Failed to save earnings academy state:", err);
        }
    }, [state]);

    // Initial fetch from backend if authenticated
    useEffect(() => {
        const fetchBackendProgress = async () => {
            if (!token) return;
            try {
                const res = await fetch("http://localhost:5000/api/academy/progress", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setState(prev => ({
                            ...prev,
                            courses: json.data.courses || prev.courses,
                            certificates: json.data.certificates || prev.certificates,
                            diplomas: json.data.diplomas || prev.diplomas,
                            examAttempts: json.data.examAttempts || prev.examAttempts,
                            tier: json.data.tier || prev.tier,
                            totalXP: json.data.totalXP ?? prev.totalXP,
                            studyStreakDays: json.data.studyStreakDays ?? prev.studyStreakDays,
                            grandCapstone: json.data.grandCapstone || prev.grandCapstone
                        }));
                    }
                }
            } catch {
                // Backend might be offline; local state is preserved
            }
        };

        fetchBackendProgress();
    }, [token]);

    // Calculate current tier
    const calculateTier = useCallback((certs: UserCertificate[], diplomas: UserDiploma[], capstone: UserGrandCapstoneState): ProfessionalTier => {
        const certCount = certs.length;
        const diplomaCount = diplomas.length;
        const capstonePassed = capstone.passed;

        if (certCount >= 50 && capstonePassed) {
            return PROFESSIONAL_TIERS.find(t => t.tier === "Diamond")!;
        }
        if (certCount >= 35 && diplomaCount >= 6) {
            return PROFESSIONAL_TIERS.find(t => t.tier === "Platinum")!;
        }
        if (certCount >= 20 && diplomaCount >= 3) {
            return PROFESSIONAL_TIERS.find(t => t.tier === "Gold")!;
        }
        if (certCount >= 10 || diplomaCount >= 1) {
            return PROFESSIONAL_TIERS.find(t => t.tier === "Silver")!;
        }
        if (certCount >= 5) {
            return PROFESSIONAL_TIERS.find(t => t.tier === "Bronze")!;
        }
        return PROFESSIONAL_TIERS.find(t => t.tier === "Associate")!;
    }, []);

    // Check and update study streak
    const touchStreak = useCallback(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        setState(prev => {
            if (prev.lastActiveDate === todayStr) return prev;

            let newStreak = prev.studyStreakDays;
            if (prev.lastActiveDate) {
                const lastDate = new Date(prev.lastActiveDate);
                const today = new Date(todayStr);
                const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            return {
                ...prev,
                studyStreakDays: newStreak,
                lastActiveDate: todayStr
            };
        });
    }, []);

    // Mark a lesson complete
    const completeLesson = useCallback((courseId: string, lessonId: string) => {
        touchStreak();
        setState(prev => {
            const current = prev.courses[courseId] || {
                courseId,
                lessonsCompleted: [],
                progressPct: 0,
                isCompleted: false,
                examReady: false,
                bestQuizScore: 0,
                status: "Not Started"
            };

            if (current.lessonsCompleted.includes(lessonId)) return prev;

            const course = EARNINGS_COURSES.find(c => c.id === courseId);
            const totalLessons = course ? course.lessonsCount : 10;
            const newLessons = [...current.lessonsCompleted, lessonId];
            const pct = Math.min(100, Math.round((newLessons.length / totalLessons) * 100));
            const isCompleted = pct >= 100;
            const examReady = pct >= 80;

            let status = current.status;
            if (status !== "Certified" && status !== "Honors" && status !== "Distinction") {
                if (examReady) status = "Exam Ready";
                else if (isCompleted) status = "Completed";
                else status = "In Progress";
            }

            const updatedCourses = {
                ...prev.courses,
                [courseId]: {
                    ...current,
                    lessonsCompleted: newLessons,
                    progressPct: pct,
                    isCompleted,
                    examReady,
                    status,
                    lastUpdated: new Date().toISOString()
                }
            };

            return {
                ...prev,
                courses: updatedCourses,
                totalXP: prev.totalXP + 25
            };
        });
    }, [touchStreak]);

    // Record Practice Quiz attempt
    const recordQuizScore = useCallback((courseId: string, scorePct: number) => {
        touchStreak();
        setState(prev => {
            const current = prev.courses[courseId] || {
                courseId,
                lessonsCompleted: [],
                progressPct: 0,
                isCompleted: false,
                examReady: false,
                bestQuizScore: 0,
                status: "Not Started"
            };

            const best = Math.max(current.bestQuizScore || 0, scorePct);
            const updatedCourses = {
                ...prev.courses,
                [courseId]: {
                    ...current,
                    bestQuizScore: best,
                    status: current.status === "Not Started" ? "In Progress" : current.status,
                    lastUpdated: new Date().toISOString()
                }
            };

            return {
                ...prev,
                courses: updatedCourses,
                totalXP: prev.totalXP + 15
            };
        });
    }, [touchStreak]);

    // Submit Official 100-Question Exam
    const submitOfficialExam = useCallback((
        course: EarningsCourse,
        score: number,
        timeSpentSeconds: number,
        skillBreakdown: Record<string, { correct: number; total: number; pct: number }>
    ): { passed: boolean; grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED"; certId?: string; diplomaEarned?: UserDiploma } => {
        touchStreak();
        const passed = score >= course.passMark;
        let grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED" = "FAILED";
        if (score === 100) grade = "DISTINCTION";
        else if (score >= 90) grade = "HONORS";
        else if (score >= 80) grade = "PASS";

        const attemptId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newAttempt: UserExamAttempt = {
            attemptId,
            courseId: course.id,
            courseTitle: course.title,
            score,
            grade,
            passed,
            timeSpentSeconds,
            attemptDate: new Date().toISOString(),
            skillBreakdown,
            questionsAnswered: 100
        };

        let generatedCert: UserCertificate | null = null;
        let earnedDiploma: UserDiploma | null = null;

        if (passed) {
            const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
            const certId = `FEA-EARN-2026-${course.code}-${randomHex}`;
            generatedCert = {
                certificateId: certId,
                courseId: course.id,
                courseTitle: course.title,
                pathId: course.pathId,
                pathTitle: course.pathTitle,
                recipientName: candidateName,
                score,
                grade: grade as "PASS" | "HONORS" | "DISTINCTION",
                skillsValidated: course.skills,
                issuedAt: new Date().toISOString(),
                verificationUrl: `https://walletmate.io/verify/${certId}`
            };
        }

        setState(prev => {
            const updatedAttempts = [newAttempt, ...prev.examAttempts];
            let updatedCerts = [...prev.certificates];
            let updatedDiplomas = [...prev.diplomas];

            if (passed && generatedCert) {
                updatedCerts = updatedCerts.filter(c => c.courseId !== course.id);
                updatedCerts.push(generatedCert);

                // Check pathway diploma eligibility
                const pathObj = EARNINGS_PATHWAYS.find(p => p.id === course.pathId);
                if (pathObj) {
                    const alreadyHasDiploma = updatedDiplomas.some(d => d.pathId === pathObj.id);
                    if (!alreadyHasDiploma) {
                        const pathCerts = updatedCerts.filter(c => pathObj.courseIds.includes(c.courseId));
                        if (pathCerts.length >= 5) {
                            const dipHex = Math.random().toString(36).substring(2, 8).toUpperCase();
                            earnedDiploma = {
                                diplomaId: `FEA-DIP-2026-${pathObj.code}-${dipHex}`,
                                pathId: pathObj.id,
                                pathTitle: pathObj.diplomaName,
                                recipientName: candidateName,
                                coursesCompleted: pathCerts.map(c => c.courseId),
                                issuedAt: new Date().toISOString()
                            };
                            updatedDiplomas.push(earnedDiploma);
                        }
                    }
                }
            }

            // Update course status
            const currentCourse = prev.courses[course.id] || {
                courseId: course.id,
                lessonsCompleted: [],
                progressPct: 100,
                isCompleted: true,
                examReady: true,
                bestQuizScore: 100,
                status: "Not Started"
            };

            let newStatus = currentCourse.status;
            if (passed) {
                if (grade === "DISTINCTION") newStatus = "Distinction";
                else if (grade === "HONORS") newStatus = "Honors";
                else newStatus = "Certified";
            }

            const updatedCourses = {
                ...prev.courses,
                [course.id]: {
                    ...currentCourse,
                    status: newStatus,
                    lastUpdated: new Date().toISOString()
                }
            };

            // Calculate new XP & Tier
            const xpGained = passed ? (grade === "DISTINCTION" ? 1000 : grade === "HONORS" ? 750 : 500) : 50;
            const newTier = calculateTier(updatedCerts, updatedDiplomas, prev.grandCapstone).tier;

            // Grand capstone check: unlocked if all 50 courses certified
            const grandCapstoneUnlocked = updatedCerts.length >= 50;
            const updatedCapstone = {
                ...prev.grandCapstone,
                unlocked: grandCapstoneUnlocked
            };

            return {
                ...prev,
                courses: updatedCourses,
                certificates: updatedCerts,
                diplomas: updatedDiplomas,
                examAttempts: updatedAttempts,
                tier: newTier,
                totalXP: prev.totalXP + xpGained,
                grandCapstone: updatedCapstone
            };
        });

        // Background sync to server if token available
        if (token) {
            fetch("http://localhost:5000/api/academy/exam/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: course.id,
                    courseTitle: course.title,
                    pathId: course.pathId,
                    pathTitle: course.pathTitle,
                    score,
                    timeSpentSeconds,
                    skillBreakdown,
                    skillsValidated: course.skills,
                    isCapstone: false
                })
            }).catch(() => {});
        }

        return {
            passed,
            grade,
            certId: generatedCert?.certificateId,
            diplomaEarned: earnedDiploma || undefined
        };
    }, [candidateName, calculateTier, touchStreak, token]);

    // Submit Grand Capstone Exam
    const submitCapstoneExam = useCallback((score: number, _timeSpentSeconds?: number) => {
        touchStreak();
        const passed = score >= 80;
        let grade: "PASS" | "HONORS" | "DISTINCTION" | "FAILED" = "FAILED";
        if (score === 100) grade = "DISTINCTION";
        else if (score >= 90) grade = "HONORS";
        else if (score >= 80) grade = "PASS";

        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const certId = `FEA-MFE-2026-${randomHex}`;

        setState(prev => {
            const updatedCapstone: UserGrandCapstoneState = {
                unlocked: true,
                passed,
                score,
                grade,
                completedAt: new Date().toISOString(),
                certificateId: passed ? certId : undefined
            };

            const newTier = calculateTier(prev.certificates, prev.diplomas, updatedCapstone).tier;
            const xpGained = passed ? 2500 : 100;

            return {
                ...prev,
                grandCapstone: updatedCapstone,
                tier: newTier,
                totalXP: prev.totalXP + xpGained
            };
        });

        return { passed, grade, certId: passed ? certId : undefined };
    }, [calculateTier, touchStreak]);

    // Derived statistics for Hero & Dashboards
    const totalCoursesCount = 50;
    const certifiedCount = state.certificates.length;
    const diplomasCount = state.diplomas.length;
    const examsCompletedCount = state.examAttempts.filter(a => a.passed).length;
    const totalQuestionsAnswered = state.examAttempts.reduce((acc, curr) => acc + (curr.questionsAnswered || 100), 0);
    const averageScore = state.examAttempts.length > 0
        ? Math.round(state.examAttempts.reduce((acc, curr) => acc + curr.score, 0) / state.examAttempts.length)
        : null;

    const currentTierObj = calculateTier(state.certificates, state.diplomas, state.grandCapstone);

    return {
        state,
        candidateName,
        currentTierObj,
        certifiedCount,
        diplomasCount,
        examsCompletedCount,
        totalQuestionsAnswered,
        averageScore,
        totalCoursesCount,
        completeLesson,
        recordQuizScore,
        submitOfficialExam,
        submitCapstoneExam,
        touchStreak
    };
}
