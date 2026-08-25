import React, { useState } from "react";
import {
    Award,
    CheckCircle2,
    ShieldCheck,
    Printer,
    Lock
} from "lucide-react";
import {
    type UserCertificate,
    type UserDiploma
} from "../../hooks/useEarningsAcademy";
import {
    EARNINGS_PATHWAYS,
    PROFESSIONAL_TIERS,
    type ProfessionalTier
} from "../../data/earningsCertificationData";

interface EarningsCertificateVaultProps {
    certificates: UserCertificate[];
    diplomas: UserDiploma[];
    currentTier: ProfessionalTier;
    candidateName: string;
    onSelectCourseById: (courseId: string) => void;
}

export const EarningsCertificateVault: React.FC<EarningsCertificateVaultProps> = ({
    certificates,
    diplomas,
    currentTier,
    candidateName,
    onSelectCourseById
}) => {
    const [selectedCert, setSelectedCert] = useState<UserCertificate | null>(certificates[0] || null);
    const [activeTab, setActiveTab] = useState<"courses" | "diplomas" | "tiers">("courses");

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            {/* VAULT HEADER DASHBOARD */}
            <div style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                color: "#ffffff",
                borderRadius: "20px",
                padding: "28px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "24px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Certifications & Diplomas Vault</h2>
                            <div className="wm-tier-badge" style={{ borderColor: currentTier.color, color: currentTier.color }}>
                                <Award size={14} /> {currentTier.name}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8" }}>
                            Authenticated, cryptographically verified credentials issued by Financial Education Academy.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "14px" }}>
                        <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#10b981" }}>{certificates.length} / 50</div>
                            <span style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>Course Certs</span>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#6366f1" }}>{diplomas.length} / 10</div>
                            <span style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>Pathway Diplomas</span>
                        </div>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="wm-tab-pills" style={{ marginBottom: 0 }}>
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab("courses")}
                    >
                        <span>Course Certificates ({certificates.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === 'diplomas' ? 'active' : ''}`}
                        onClick={() => setActiveTab("diplomas")}
                    >
                        <span>Pathway Diplomas ({diplomas.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`wm-tab-pill ${activeTab === 'tiers' ? 'active' : ''}`}
                        onClick={() => setActiveTab("tiers")}
                    >
                        <span>Professional Tiers & MFE</span>
                    </button>
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TAB 1: COURSE CERTIFICATES */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "courses" && (
                <div>
                    {certificates.length === 0 ? (
                        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "48px 24px", textAlign: "center" }}>
                            <Award size={48} color="#94a3b8" style={{ margin: "0 auto 16px auto" }} />
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>No Certificates Earned Yet</h3>
                            <p style={{ margin: "0 0 20px 0", fontSize: "0.88rem", color: "#64748b", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
                                Complete course lessons and score ≥80% on the official 100-question certification exams to earn verified certificates.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
                            {/* CERTIFICATE PREVIEW VIEWER */}
                            {selectedCert && (
                                <div className="wm-cert-frame">
                                    <div className="wm-cert-seal">
                                        FEA
                                    </div>

                                    <div style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Financial Education Academy
                                    </div>
                                    <h2 style={{ margin: "0 0 16px 0", fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>
                                        Certificate of Achievement
                                    </h2>

                                    <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "#64748b" }}>
                                        This official credential certifies that
                                    </p>

                                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#6366f1", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", maxWidth: "400px", margin: "0 auto 14px auto" }}>
                                        {selectedCert.recipientName || candidateName}
                                    </div>

                                    <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "#475569" }}>
                                        has successfully mastered and passed the official examination in
                                    </p>

                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                                        {selectedCert.courseTitle}
                                    </h3>

                                    {/* Grade & Score Badge */}
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "8px 18px", borderRadius: "20px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                            Score: {selectedCert.score} / 100
                                        </span>
                                        <span style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 800,
                                            padding: "2px 10px",
                                            borderRadius: "12px",
                                            background: selectedCert.grade === "DISTINCTION" ? "rgba(217, 119, 6, 0.2)" : selectedCert.grade === "HONORS" ? "rgba(99, 102, 241, 0.2)" : "rgba(16, 185, 129, 0.2)",
                                            color: selectedCert.grade === "DISTINCTION" ? "#b45309" : selectedCert.grade === "HONORS" ? "#4338ca" : "#047857"
                                        }}>
                                            {selectedCert.grade}
                                        </span>
                                    </div>

                                    {/* Skills validated */}
                                    <div style={{ marginBottom: "24px" }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                                            Skills Validated
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
                                            {selectedCert.skillsValidated.map((skill, i) => (
                                                <span key={i} style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.08)", color: "#4f46e5", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Certificate Footer: ID, QR code, Date */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "20px", fontSize: "0.78rem", color: "#64748b", textAlign: "left" }}>
                                        <div>
                                            <div><strong>Certificate ID:</strong> {selectedCert.certificateId}</div>
                                            <div><strong>Issued Date:</strong> {new Date(selectedCert.issuedAt).toLocaleDateString("en-IN")}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10b981", fontWeight: 700, marginTop: "4px" }}>
                                                <ShieldCheck size={14} /> Cryptographically Verified
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button
                                                type="button"
                                                onClick={handlePrint}
                                                className="wm-btn-secondary"
                                                style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                                            >
                                                <Printer size={14} /> Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CERTIFICATES LIST SELECTOR */}
                            <div>
                                <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                                    Your Earned Credentials ({certificates.length})
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                                    {certificates.map((cert) => (
                                        <div
                                            key={cert.certificateId}
                                            onClick={() => setSelectedCert(cert)}
                                            style={{
                                                background: "#ffffff",
                                                borderRadius: "12px",
                                                border: selectedCert?.certificateId === cert.certificateId ? "2px solid #6366f1" : "1px solid #e2e8f0",
                                                padding: "16px",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1" }}>{cert.courseId}</span>
                                                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#10b981" }}>Score: {cert.score}%</span>
                                            </div>
                                            <h4 style={{ margin: "0 0 6px 0", fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>{cert.courseTitle}</h4>
                                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>ID: {cert.certificateId}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: PATHWAY DIPLOMAS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "diplomas" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                    {EARNINGS_PATHWAYS.map((path) => {
                        const earned = diplomas.find(d => d.pathId === path.id);
                        const certsInPath = certificates.filter(c => path.courseIds.includes(c.courseId)).length;

                        return (
                            <div
                                key={path.id}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "16px",
                                    border: earned ? "2px solid #10b981" : "1px solid #e2e8f0",
                                    padding: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "1.8rem" }}>{path.icon}</span>
                                        {earned ? (
                                            <span style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "4px 10px", borderRadius: "12px", fontWeight: 800, fontSize: "0.75rem" }}>
                                                ✓ Diploma Earned
                                            </span>
                                        ) : (
                                            <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 10px", borderRadius: "12px", fontWeight: 700, fontSize: "0.75rem" }}>
                                                {certsInPath}/5 Certified
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                                        Pathway {path.code} Diploma
                                    </div>
                                    <h3 style={{ margin: "4px 0 8px 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                                        {path.diplomaName}
                                    </h3>
                                    <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#475569", lineHeight: "1.45" }}>
                                        {path.description}
                                    </p>

                                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginBottom: "16px" }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>Required Courses:</div>
                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                            {path.courseIds.map(cid => {
                                                const hasCert = certificates.some(c => c.courseId === cid);
                                                return (
                                                    <span
                                                        key={cid}
                                                        onClick={() => onSelectCourseById(cid)}
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            padding: "3px 8px",
                                                            borderRadius: "6px",
                                                            background: hasCert ? "rgba(16, 185, 129, 0.1)" : "#f1f5f9",
                                                            color: hasCert ? "#10b981" : "#475569",
                                                            fontWeight: 800,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        {cid} {hasCert && "✓"}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {earned && (
                                    <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700, background: "rgba(16, 185, 129, 0.08)", padding: "8px 12px", borderRadius: "8px" }}>
                                        Diploma ID: {earned.diplomaId}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: PROFESSIONAL TIERS */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "tiers" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {PROFESSIONAL_TIERS.map((tier) => {
                        const isCurrent = currentTier.tier === tier.tier;
                        const isUnlocked = certificates.length >= tier.requiredCerts;

                        return (
                            <div
                                key={tier.tier}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "16px",
                                    border: isCurrent ? `2px solid ${tier.color}` : "1px solid #e2e8f0",
                                    padding: "24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "16px"
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                        <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                                            {tier.name}
                                        </h3>
                                        {isCurrent && (
                                            <span style={{ background: tier.color, color: "#ffffff", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800 }}>
                                                Current Tier
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#475569" }}>
                                        {tier.description}
                                    </p>
                                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                        Requirements: <strong>{tier.requiredCerts} Course Certifications</strong> {tier.requiredDiplomas > 0 && `+ ${tier.requiredDiplomas} Pathway Diplomas`} {tier.requiresCapstone && `+ Grand Capstone`}
                                    </div>
                                </div>

                                <div>
                                    {isUnlocked ? (
                                        <span style={{ color: "#10b981", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem" }}>
                                            <CheckCircle2 size={18} /> Unlocked
                                        </span>
                                    ) : (
                                        <span style={{ color: "#94a3b8", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                                            <Lock size={16} /> Locked ({certificates.length}/{tier.requiredCerts})
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
