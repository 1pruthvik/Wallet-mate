import React from "react";
import {
    Printer,
    ShieldCheck
} from "lucide-react";
import {
    type UserCertificate,
    type UserExamAttempt
} from "../../hooks/useEarningsAcademy";

interface EarningsTranscriptProps {
    candidateName: string;
    certificates: UserCertificate[];
    examAttempts?: UserExamAttempt[];
    tierName: string;
}

export const EarningsTranscript: React.FC<EarningsTranscriptProps> = ({
    candidateName,
    certificates,
    examAttempts: _examAttempts,
    tierName
}) => {
    const handlePrint = () => {
        window.print();
    };

    const totalCertified = certificates.length;
    const avgScore = totalCertified > 0
        ? Math.round(certificates.reduce((acc, c) => acc + c.score, 0) / totalCertified)
        : 0;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* TRANSCRIPT CARD */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "36px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {/* Transcript Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "20px", marginBottom: "24px" }}>
                    <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Financial Education Academy · Wallet-Mate
                        </div>
                        <h1 style={{ margin: "4px 0", fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>
                            Official Academic Transcript
                        </h1>
                        <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                            Earnings & Profit Certification Program
                        </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="wm-btn-primary"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "0.85rem" }}
                        >
                            <Printer size={16} /> Print / Export PDF
                        </button>
                    </div>
                </div>

                {/* Candidate Information Header Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", background: "#f8fafc", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "28px", fontSize: "0.85rem" }}>
                    <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>Candidate Name:</span>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>{candidateName}</div>
                    </div>
                    <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>Current Designation:</span>
                        <div style={{ fontWeight: 800, color: "#6366f1" }}>{tierName}</div>
                    </div>
                    <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>Courses Certified:</span>
                        <div style={{ fontWeight: 800, color: "#10b981" }}>{totalCertified} / 50</div>
                    </div>
                    <div>
                        <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>Cumulative Average:</span>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{avgScore}%</div>
                    </div>
                </div>

                {/* Transcript Course Table */}
                <h3 style={{ margin: "0 0 12px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                    Course Certification Records
                </h3>

                {certificates.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                        No examination records found. Complete official 100-question certification exams to generate academic records.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto", marginBottom: "28px" }}>
                        <table className="wm-transcript-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Course Title</th>
                                    <th>Pathway</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Date Issued</th>
                                    <th>Certificate ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.map((cert) => (
                                    <tr key={cert.certificateId}>
                                        <td style={{ fontWeight: 800, color: "#6366f1" }}>{cert.courseId}</td>
                                        <td style={{ fontWeight: 700 }}>{cert.courseTitle}</td>
                                        <td style={{ color: "#64748b", fontSize: "0.8rem" }}>{cert.pathTitle}</td>
                                        <td style={{ fontWeight: 800, color: "#0f172a" }}>{cert.score}%</td>
                                        <td>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 800,
                                                padding: "2px 8px",
                                                borderRadius: "8px",
                                                background: cert.grade === "DISTINCTION" ? "rgba(217, 119, 6, 0.15)" : cert.grade === "HONORS" ? "rgba(99, 102, 241, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                                color: cert.grade === "DISTINCTION" ? "#b45309" : cert.grade === "HONORS" ? "#4338ca" : "#047857"
                                            }}>
                                                {cert.grade}
                                            </span>
                                        </td>
                                        <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
                                            {new Date(cert.issuedAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#475569" }}>
                                            {cert.certificateId}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Transcript Footer Verification */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: 700 }}>
                        <ShieldCheck size={16} /> Official Academic Record • Verified by Financial Education Academy
                    </div>
                    <div>
                        Issued via Wallet-Mate Institutional Verification Protocol
                    </div>
                </div>
            </div>
        </div>
    );
};
