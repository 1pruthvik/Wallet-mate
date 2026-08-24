import { useState, useEffect } from "react";

export type MasteryStatus = "Opened" | "In Progress" | "Completed" | "Mastered" | "Applied";

export interface LessonProgressState {
    status: MasteryStatus;
    progressPct: number;
    quizScorePct?: number;
    completedAt?: string;
    appliedAt?: string;
}

export interface UserAcademyProgress {
    lessons: Record<string, LessonProgressState>;
    xp: number;
    learningTimeMinutes: number;
    streakDays: number;
    lastActivityDate?: string;
    completedChallenges: string[];
    earnedCertificates: { pathId: string; title: string; earnedDate: string; score: number }[];
}

const STORAGE_KEY = "finmitra_academy_user_progress";

const DEFAULT_PROGRESS: UserAcademyProgress = {
    lessons: {},
    xp: 0,
    learningTimeMinutes: 0,
    streakDays: 0,
    completedChallenges: [],
    earnedCertificates: []
};

export function useAcademyProgress() {
    const [progress, setProgress] = useState<UserAcademyProgress>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return DEFAULT_PROGRESS;
            return JSON.parse(saved);
        } catch {
            return DEFAULT_PROGRESS;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (err) {
            console.error("Failed to save academy progress to localStorage:", err);
        }
    }, [progress]);

    // Calculate Level
    const calculateLevel = (xp: number) => {
        if (xp >= 1500) return { name: "Elite Advisor", min: 1500, max: 3000, next: "Max Level" };
        if (xp >= 701) return { name: "Platinum", min: 701, max: 1500, next: "Elite Advisor" };
        if (xp >= 301) return { name: "Gold", min: 301, max: 700, next: "Platinum" };
        if (xp >= 101) return { name: "Silver", min: 101, max: 300, next: "Gold" };
        return { name: "Bronze", min: 0, max: 100, next: "Silver" };
    };

    const level = calculateLevel(progress.xp);

    // Mastery counts
    const masteredCount = Object.values(progress.lessons).filter(l => l.status === "Mastered" || l.status === "Applied").length;
    const appliedCount = Object.values(progress.lessons).filter(l => l.status === "Applied").length;
    const inProgressCount = Object.values(progress.lessons).filter(l => l.status === "In Progress" || l.status === "Completed").length;

    // Streak Updater
    const checkAndUpdateStreak = () => {
        const todayStr = new Date().toISOString().split("T")[0];
        if (progress.lastActivityDate === todayStr) return;

        let newStreak = progress.streakDays;
        if (progress.lastActivityDate) {
            const lastDate = new Date(progress.lastActivityDate);
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

        setProgress(prev => ({
            ...prev,
            streakDays: newStreak,
            lastActivityDate: todayStr
        }));
    };

    const startLesson = (lessonId: string) => {
        checkAndUpdateStreak();
        setProgress(prev => {
            const current = prev.lessons[lessonId];
            if (current && (current.status === "Mastered" || current.status === "Applied")) return prev;

            return {
                ...prev,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        status: current?.status === "Completed" ? "Completed" : "In Progress",
                        progressPct: Math.max(50, current?.progressPct || 50)
                    }
                }
            };
        });
    };

    const completeLesson = (lessonId: string, xpReward: number = 20) => {
        checkAndUpdateStreak();
        setProgress(prev => {
            const current = prev.lessons[lessonId];
            const isFirstComplete = !current || (current.status !== "Completed" && current.status !== "Mastered" && current.status !== "Applied");

            return {
                ...prev,
                xp: isFirstComplete ? prev.xp + xpReward : prev.xp,
                learningTimeMinutes: prev.learningTimeMinutes + 5,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        status: current?.status === "Mastered" || current?.status === "Applied" ? current.status : "Completed",
                        progressPct: 100,
                        completedAt: current?.completedAt || new Date().toISOString()
                    }
                }
            };
        });
    };

    const submitQuizMastery = (lessonId: string, scorePct: number, xpReward: number = 10) => {
        checkAndUpdateStreak();
        const passed = scorePct >= 80;

        setProgress(prev => {
            const current = prev.lessons[lessonId];
            const wasMasteredBefore = current?.status === "Mastered" || current?.status === "Applied";
            const newStatus = passed ? (current?.status === "Applied" ? "Applied" : "Mastered") : (current?.status || "In Progress");

            return {
                ...prev,
                xp: passed && !wasMasteredBefore ? prev.xp + xpReward : prev.xp,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        status: newStatus,
                        progressPct: 100,
                        quizScorePct: scorePct,
                        completedAt: current?.completedAt || new Date().toISOString()
                    }
                }
            };
        });

        return passed;
    };

    const applyActionToMoney = (lessonId: string, xpReward: number = 25) => {
        checkAndUpdateStreak();
        setProgress(prev => {
            const current = prev.lessons[lessonId];
            const wasAppliedBefore = current?.status === "Applied";

            return {
                ...prev,
                xp: !wasAppliedBefore ? prev.xp + xpReward : prev.xp,
                lessons: {
                    ...prev.lessons,
                    [lessonId]: {
                        status: "Applied",
                        progressPct: 100,
                        appliedAt: new Date().toISOString()
                    }
                }
            };
        });
    };

    const completeWeeklyChallenge = (challengeId: string, xpReward: number) => {
        checkAndUpdateStreak();
        setProgress(prev => {
            if (prev.completedChallenges.includes(challengeId)) return prev;
            return {
                ...prev,
                xp: prev.xp + xpReward,
                completedChallenges: [...prev.completedChallenges, challengeId]
            };
        });
    };

    return {
        progress,
        level,
        masteredCount,
        appliedCount,
        inProgressCount,
        startLesson,
        completeLesson,
        submitQuizMastery,
        applyActionToMoney,
        completeWeeklyChallenge
    };
}
