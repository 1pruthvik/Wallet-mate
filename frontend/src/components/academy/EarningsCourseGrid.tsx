import React, { useState, useMemo } from "react";
import {
    Search,
    Award,
    Sparkles
} from "lucide-react";
import {
    EARNINGS_COURSES,
    type EarningsCourse
} from "../../data/earningsCertificationData";
import { type CourseProgressRecord } from "../../hooks/useEarningsAcademy";

interface EarningsCourseGridProps {
    courseProgress: Record<string, CourseProgressRecord>;
    onSelectCourse: (course: EarningsCourse) => void;
    onOpenExam: (course: EarningsCourse) => void;
    onOpenPractice: (course: EarningsCourse) => void;
    onViewCert: (course: EarningsCourse) => void;
}

export const EarningsCourseGrid: React.FC<EarningsCourseGridProps> = ({
    courseProgress,
    onSelectCourse,
    onOpenExam,
    onOpenPractice,
    onViewCert
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedLevel, setSelectedLevel] = useState<string>("All");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [sortBy, setSortBy] = useState<string>("recommended");

    const categories = [
        "All", "Income", "Personal Profit", "Profit Math", "Pricing",
        "Freelancing", "Business", "Growth", "Capital", "Risk", "Advanced"
    ];

    const filteredCourses = useMemo(() => {
        return EARNINGS_COURSES.filter(course => {
            const matchesSearch =
                searchQuery === "" ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            // Category filter
            if (selectedCategory !== "All") {
                const catLower = selectedCategory.toLowerCase();
                if (catLower === "income" && course.category !== "income") return false;
                if (catLower === "personal profit" && course.category !== "profit") return false;
                if (catLower === "profit math" && course.category !== "pricing") return false;
                if (catLower === "pricing" && course.category !== "pricing") return false;
                if (catLower === "freelancing" && course.category !== "business") return false;
                if (catLower === "business" && course.category !== "business") return false;
                if (catLower === "growth" && course.category !== "growth") return false;
                if (catLower === "capital" && course.category !== "capital") return false;
                if (catLower === "risk" && course.category !== "risk") return false;
                if (catLower === "advanced" && course.category !== "advanced") return false;
            }

            // Level filter
            if (selectedLevel !== "All" && course.level !== selectedLevel) return false;

            // Status filter
            if (selectedStatus !== "All") {
                const rec = courseProgress[course.id];
                const status = rec?.status || "Not Started";
                if (selectedStatus === "Not Started" && status !== "Not Started") return false;
                if (selectedStatus === "In Progress" && status !== "In Progress") return false;
                if (selectedStatus === "Completed" && status !== "Completed" && status !== "Exam Ready" && !status.includes("Cert")) return false;
                if (selectedStatus === "Exam Ready" && status !== "Exam Ready") return false;
                if (selectedStatus === "Certified" && !status.includes("Cert") && status !== "Honors" && status !== "Distinction") return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === "shortest") return a.duration.localeCompare(b.duration);
            if (sortBy === "difficulty") {
                const order: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
                return (order[a.level] || 1) - (order[b.level] || 1);
            }
            if (sortBy === "progress") {
                const pA = courseProgress[a.id]?.progressPct || 0;
                const pB = courseProgress[b.id]?.progressPct || 0;
                return pB - pA;
            }
            if (sortBy === "impact") return b.xpReward - a.xpReward;
            return a.code.localeCompare(b.code);
        });
    }, [searchQuery, selectedCategory, selectedLevel, selectedStatus, sortBy, courseProgress]);

    return (
        <div>
            {/* SEARCH & FILTER CONTROLS */}
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "18px 20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
                        <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Search by code (e.g. C13), title, skill, or pricing formula..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px 10px 42px",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.9rem",
                                outline: "none"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#f8fafc", fontWeight: 600, color: "#334155" }}
                        >
                            <option value="All">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#f8fafc", fontWeight: 600, color: "#334155" }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Exam Ready">Exam Ready</option>
                            <option value="Certified">Certified</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#f8fafc", fontWeight: 600, color: "#334155" }}
                        >
                            <option value="recommended">Recommended Sequence</option>
                            <option value="impact">Highest Income Impact</option>
                            <option value="progress">Highest Progress</option>
                            <option value="difficulty">Difficulty: Low to High</option>
                            <option value="shortest">Shortest Duration</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORY PILLS */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`wm-tab-pill ${selectedCategory === cat ? 'active' : ''}`}
                            style={{ fontSize: "0.78rem", padding: "6px 14px", whiteSpace: "nowrap" }}
                        >
                            <span>{cat}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* RESULTS COUNT */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                    Showing {filteredCourses.length} of 50 Professional Certification Courses
                </span>
            </div>

            {/* COURSE CARD GRID */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
                marginBottom: "32px"
            }}>
                {filteredCourses.map((course) => {
                    const rec = courseProgress[course.id];
                    const progressPct = rec?.progressPct || 0;
                    const status = rec?.status || "Not Started";
                    const isCertified = status === "Certified" || status === "Honors" || status === "Distinction";
                    const isExamReady = status === "Exam Ready" || progressPct >= 80;

                    let statusClass = "wm-status-not-started";
                    if (status === "In Progress") statusClass = "wm-status-in-progress";
                    else if (isExamReady && !isCertified) statusClass = "wm-status-exam-ready";
                    else if (status === "Honors") statusClass = "wm-status-honors";
                    else if (status === "Distinction") statusClass = "wm-status-distinction";
                    else if (isCertified) statusClass = "wm-status-certified";

                    return (
                        <div
                            key={course.id}
                            className="wm-course-card"
                            onClick={() => onSelectCourse(course)}
                        >
                            <div>
                                {/* Header: Code, Path, and Status */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span className="wm-course-code-badge">{course.code}</span>
                                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{course.pathTitle}</span>
                                    </div>
                                    <span className={`wm-status-pill ${statusClass}`}>
                                        {status}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3 style={{ margin: "4px 0 8px 0", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", lineHeight: "1.3" }}>
                                    {course.title}
                                </h3>
                                <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.45" }}>
                                    {course.description}
                                </p>

                                {/* Meta details: Level, Lessons, Duration, Exam Tag */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.75rem", color: "#64748b", marginBottom: "14px" }}>
                                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{course.level}</span>
                                    <span>•</span>
                                    <span>{course.lessonsCount} Lessons</span>
                                    <span>•</span>
                                    <span>{course.duration}</span>
                                    <span>•</span>
                                    <span style={{ color: "#6366f1", fontWeight: 700 }}>+{course.xpReward} XP</span>
                                </div>

                                {/* Skills Tags */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                                    {course.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                fontSize: "0.7rem",
                                                background: "#f1f5f9",
                                                color: "#334155",
                                                padding: "2px 8px",
                                                borderRadius: "6px",
                                                fontWeight: 600
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {course.skills.length > 3 && (
                                        <span style={{ fontSize: "0.7rem", color: "#94a3b8", padding: "2px 4px" }}>
                                            +{course.skills.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                {/* Progress Bar */}
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", marginBottom: "4px" }}>
                                        <span>Course Progress</span>
                                        <span style={{ fontWeight: 700, color: isCertified ? "#10b981" : "#6366f1" }}>{progressPct}%</span>
                                    </div>
                                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                width: `${progressPct}%`,
                                                height: "100%",
                                                background: isCertified ? "#10b981" : "#6366f1",
                                                transition: "width 0.3s ease"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Action Buttons */}
                                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                                    {isCertified ? (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onViewCert(course); }}
                                            className="wm-btn-secondary"
                                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem", justifyContent: "center", color: "#10b981", borderColor: "#10b981" }}
                                        >
                                            <Award size={14} /> View Certificate
                                        </button>
                                    ) : isExamReady ? (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onOpenExam(course); }}
                                            className="wm-btn-primary"
                                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem", justifyContent: "center", background: "#d97706" }}
                                        >
                                            <Sparkles size={14} /> Take 100-Q Exam
                                        </button>
                                    ) : progressPct > 0 ? (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onSelectCourse(course); }}
                                            className="wm-btn-primary"
                                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem", justifyContent: "center" }}
                                        >
                                            Continue Course →
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onSelectCourse(course); }}
                                            className="wm-btn-secondary"
                                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem", justifyContent: "center" }}
                                        >
                                            Start Course
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onOpenPractice(course); }}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            background: "#ffffff",
                                            color: "#475569",
                                            fontSize: "0.78rem",
                                            fontWeight: 700,
                                            cursor: "pointer"
                                        }}
                                        title="Take 30-Question Practice Quiz"
                                    >
                                        Practice
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
