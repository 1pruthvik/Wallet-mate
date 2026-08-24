import React, { useState, useRef, useEffect } from "react";
import {
    FileUp,
    FileText,
    X,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    RefreshCw,
    Check,
} from "lucide-react";
import { parseBankStatement, importBatchTransactions } from "../api/transactions";
import type { Transaction } from "../api/transactions";
import "./BankStatementModal.css";

interface BankStatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: (
        imported: Transaction[],
        summary?: { newCount: number; duplicateCount: number; total: number; message: string }
    ) => void;
}

type ModalStep = "idle" | "processing" | "preview" | "error";

const CATEGORIES = [
    "Income",
    "Salary",
    "Freelance",
    "Investment",
    "Food",
    "Dining",
    "Shopping",
    "Transport",
    "Bills",
    "Utilities",
    "Entertainment",
    "Health",
    "Education",
    "Other",
];

export const BankStatementModal: React.FC<BankStatementModalProps> = ({
    isOpen,
    onClose,
    onImportSuccess,
}) => {
    const [step, setStep] = useState<ModalStep>("idle");
    const [processingStep, setProcessingStep] = useState<number>(1);
    const [fileName, setFileName] = useState<string>("");
    const [fileSizeStr, setFileSizeStr] = useState<string>("");
    const [pagesCount, setPagesCount] = useState<number>(1);
    const [extractedList, setExtractedList] = useState<Omit<Transaction, "_id">[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset modal state
    const resetModal = () => {
        setStep("idle");
        setProcessingStep(1);
        setFileName("");
        setFileSizeStr("");
        setPagesCount(1);
        setExtractedList([]);
        setErrorMessage("");
        setIsImporting(false);
        setIsDragOver(false);
    };

    // Close handler
    const handleClose = () => {
        if (isImporting) return;
        resetModal();
        onClose();
    };

    // Keyboard accessibility: ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isImporting) {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isImporting]);

    if (!isOpen) return null;

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isCsv =
            file.type === "text/csv" ||
            file.name.toLowerCase().endsWith(".csv") ||
            file.name.toLowerCase().endsWith(".txt");

        if (!isPdf && !isCsv) {
            setErrorMessage("Please upload a valid digital PDF or CSV bank statement.");
            setStep("error");
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            setErrorMessage("File size exceeds 15MB limit. Please upload a smaller statement.");
            setStep("error");
            return;
        }

        setFileName(file.name);
        setFileSizeStr(formatFileSize(file.size));
        setStep("processing");
        setProcessingStep(1);
        setErrorMessage("");

        // Multi-stage visual progress indicators
        const timer1 = setTimeout(() => setProcessingStep(2), 500);
        const timer2 = setTimeout(() => setProcessingStep(3), 1000);

        try {
            const result = await parseBankStatement(file);

            clearTimeout(timer1);
            clearTimeout(timer2);

            if (!result.transactions || result.transactions.length === 0) {
                setErrorMessage(
                    "No readable transactions were found in this statement. Please make sure the PDF contains digital text tables."
                );
                setStep("error");
                return;
            }

            setExtractedList(result.transactions);
            setPagesCount(result.pagesProcessed || 1);
            setStep("preview");
        } catch (err: any) {
            clearTimeout(timer1);
            clearTimeout(timer2);
            console.error("Statement upload error:", err);
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Unable to process the bank statement. Please make sure you uploaded a valid digital PDF and try again.";
            setErrorMessage(msg);
            setStep("error");
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onDragLeave = () => {
        setIsDragOver(false);
    };

    const handleCategoryChange = (index: number, newCategory: string) => {
        setExtractedList((prev) => {
            const updated = [...prev];
            const item = updated[index];
            const isIncome =
                newCategory === "Income" ||
                newCategory === "Salary" ||
                newCategory === "Freelance" ||
                newCategory === "Investment";
            updated[index] = {
                ...item,
                category: newCategory,
                type: isIncome ? "income" : item.type === "income" ? "expense" : item.type,
            };
            return updated;
        });
    };

    const handleRemoveItem = (index: number) => {
        setExtractedList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImportConfirmed = async () => {
        if (extractedList.length === 0) return;

        try {
            setIsImporting(true);
            setErrorMessage("");
            const result = await importBatchTransactions(extractedList, fileName);
            onImportSuccess(result.transactions, {
                newCount: result.count,
                duplicateCount: result.duplicatesSkipped,
                total: result.totalExtracted,
                message: result.message,
            });
            handleClose();
        } catch (err: any) {
            console.error("Batch import error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to save transactions. Please try again.";
            setErrorMessage(msg);
            setStep("error");
        } finally {
            setIsImporting(false);
        }
    };

    // Summary calculations for preview
    const totalInflow = extractedList
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalOutflow = extractedList
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const sanitizeDisplayNarration = (desc?: string, merchant?: string): string => {
        if (!desc) return "";
        const m = (merchant || "").toLowerCase().trim();
        let clean = desc
            .replace(/[-+]\s*[$€₹£]\s*[$€₹£]?/g, "")
            .replace(/[$€₹£]/g, "")
            .replace(/\b(?:dr|cr|inr|rs\.?)\b/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim();

        if (!clean || clean.toLowerCase() === m) return "";
        if (m && clean.toLowerCase().startsWith(m)) {
            clean = clean.slice(m.length).replace(/^[-/:\s]+/, "").trim();
        }
        return clean;
    };

    return (
        <div className="bsm-backdrop" onClick={handleClose}>
            <div
                className={`bsm-dialog ${step === "preview" ? "bsm-dialog-wide" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 1. MODAL HEADER */}
                <div className="bsm-header">
                    <div className="bsm-header-info">
                        <h3 className="bsm-title">Import Bank Statement</h3>
                        <p className="bsm-subtitle">
                            Upload a digital PDF bank statement to automatically extract and verify your transactions.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="bsm-close-btn"
                        onClick={handleClose}
                        disabled={isImporting}
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 2. MODAL BODY */}
                <div className="bsm-body">
                    {/* STEP 1: IDLE DROPZONE */}
                    {step === "idle" && (
                        <div className="bsm-upload-section">
                            <div
                                className={`bsm-dropzone ${isDragOver ? "bsm-dropzone-active" : ""}`}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    accept=".pdf,application/pdf,.csv,.txt"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                />

                                <div className="bsm-icon-circle">
                                    <FileUp size={28} />
                                </div>

                                <div className="bsm-dropzone-text">
                                    <h4 className="bsm-dropzone-title">Upload Bank Statement PDF</h4>
                                    <p className="bsm-dropzone-desc">
                                        Drag & drop your PDF statement here, or <span className="bsm-browse-link">browse files</span>
                                    </p>
                                    <span className="bsm-dropzone-hint">
                                        PDF & CSV files supported • Multi-page statement support • Max 15MB
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="bsm-choose-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <FileText size={16} />
                                    <span>Choose PDF File</span>
                                </button>
                            </div>

                            {/* Trust & Privacy Notice */}
                            <div className="bsm-trust-badge">
                                <ShieldCheck size={18} className="bsm-trust-icon" />
                                <span>
                                    Bank-grade processing: Statements are processed securely in memory and transactions are saved only after your review.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROCESSING */}
                    {step === "processing" && (
                        <div className="bsm-processing-section">
                            <div className="bsm-pulse-spinner-box">
                                <div className="bsm-pulse-ring" />
                                <div className="bsm-pulse-icon">
                                    <Sparkles size={24} />
                                </div>
                            </div>

                            <h4 className="bsm-processing-title">Processing Bank Statement...</h4>
                            <p className="bsm-processing-file">{fileName} ({fileSizeStr})</p>

                            <div className="bsm-stepper">
                                <div className={`bsm-step-node ${processingStep >= 1 ? "bsm-step-done" : ""}`}>
                                    <div className="bsm-step-badge">
                                        {processingStep > 1 ? <Check size={14} /> : 1}
                                    </div>
                                    <span className="bsm-step-label">Reading PDF document</span>
                                </div>
                                <div className={`bsm-step-line ${processingStep >= 2 ? "bsm-step-line-done" : ""}`} />
                                <div className={`bsm-step-node ${processingStep >= 2 ? "bsm-step-done" : ""}`}>
                                    <div className="bsm-step-badge">
                                        {processingStep > 2 ? <Check size={14} /> : 2}
                                    </div>
                                    <span className="bsm-step-label">Parsing multi-page tables</span>
                                </div>
                                <div className={`bsm-step-line ${processingStep >= 3 ? "bsm-step-line-done" : ""}`} />
                                <div className={`bsm-step-node ${processingStep >= 3 ? "bsm-step-done" : ""}`}>
                                    <div className="bsm-step-badge">3</div>
                                    <span className="bsm-step-label">Extracting & categorizing</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW TABLE */}
                    {step === "preview" && (
                        <div className="bsm-preview-section">
                            {/* Summary Metrics Bar */}
                            <div className={`bsm-summary-bar ${pagesCount > 1 ? "bsm-summary-bar-4col" : ""}`}>
                                <div className="bsm-summary-stat">
                                    <span className="bsm-stat-label">Transactions Found</span>
                                    <span className="bsm-stat-value">{extractedList.length}</span>
                                </div>
                                {pagesCount > 1 && (
                                    <div className="bsm-summary-stat">
                                        <span className="bsm-stat-label">Pages Processed</span>
                                        <span className="bsm-stat-value">{pagesCount} Pages</span>
                                    </div>
                                )}
                                <div className="bsm-summary-stat">
                                    <span className="bsm-stat-label">Total Inflow</span>
                                    <span className="bsm-stat-value bsm-stat-inflow">+₹{totalInflow.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="bsm-summary-stat">
                                    <span className="bsm-stat-label">Total Outflow</span>
                                    <span className="bsm-stat-value bsm-stat-outflow">-₹{totalOutflow.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* File Info & Instruction Banner */}
                            <div className="bsm-file-meta-banner">
                                <div className="bsm-file-tag">
                                    <FileText size={16} color="#635bff" />
                                    <span className="bsm-file-tag-name">{fileName}</span>
                                    {fileSizeStr && <span className="bsm-file-tag-size">• {fileSizeStr}</span>}
                                </div>
                                <button
                                    type="button"
                                    className="bsm-replace-btn"
                                    onClick={() => setStep("idle")}
                                    disabled={isImporting}
                                >
                                    <RefreshCw size={13} />
                                    <span>Upload Different File</span>
                                </button>
                            </div>

                            {/* Extracted Transactions Table Container */}
                            <div className="bsm-table-container">
                                {extractedList.length === 0 ? (
                                    <div className="bsm-empty-preview">
                                        <p>All extracted transactions were removed.</p>
                                        <button
                                            type="button"
                                            className="bsm-btn-cancel"
                                            onClick={() => setStep("idle")}
                                        >
                                            Upload Another Statement
                                        </button>
                                    </div>
                                ) : (
                                    <table className="bsm-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "120px" }}>Date</th>
                                                <th>Merchant / Narration</th>
                                                <th style={{ width: "150px" }}>Category</th>
                                                <th style={{ width: "120px" }}>Type</th>
                                                <th style={{ width: "140px", textAlign: "right" }}>Amount</th>
                                                <th style={{ width: "50px", textAlign: "center" }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {extractedList.map((item, idx) => {
                                                const subDesc = sanitizeDisplayNarration(item.description, item.merchant);
                                                return (
                                                    <tr key={idx}>
                                                        <td className="bsm-date-cell">{formatDate(item.date)}</td>
                                                        <td>
                                                            <div className="bsm-merchant-block">
                                                                <span className="bsm-merchant-name">{item.merchant}</span>
                                                                {subDesc && (
                                                                    <span className="bsm-merchant-narration" title={subDesc}>
                                                                        {subDesc}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="bsm-category-select"
                                                                value={item.category}
                                                                onChange={(e) => handleCategoryChange(idx, e.target.value)}
                                                            >
                                                                {CATEGORIES.map((c) => (
                                                                    <option key={c} value={c}>
                                                                        {c}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`bsm-type-badge ${
                                                                    item.type === "income"
                                                                        ? "bsm-type-income"
                                                                        : "bsm-type-expense"
                                                                }`}
                                                            >
                                                                {item.type === "income" ? (
                                                                    <>
                                                                        <ArrowUpRight size={12} />
                                                                        <span>Income</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ArrowDownRight size={12} />
                                                                        <span>Expense</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: "right" }}>
                                                            <span
                                                                className={`bsm-amount ${
                                                                    item.type === "income"
                                                                        ? "bsm-amount-income"
                                                                        : "bsm-amount-expense"
                                                                }`}
                                                            >
                                                                {item.type === "income" ? "+" : "-"}₹
                                                                {Number(item.amount).toLocaleString("en-IN", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <button
                                                                type="button"
                                                                className="bsm-delete-btn"
                                                                title="Remove transaction"
                                                                onClick={() => handleRemoveItem(idx)}
                                                                aria-label="Remove transaction"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ERROR */}
                    {step === "error" && (
                        <div className="bsm-error-section">
                            <div className="bsm-error-circle">
                                <AlertCircle size={28} />
                            </div>
                            <h4 className="bsm-error-title">Unable to Process Statement</h4>
                            <p className="bsm-error-desc">{errorMessage}</p>
                            <div className="bsm-error-actions">
                                <button
                                    type="button"
                                    className="bsm-btn-import"
                                    onClick={() => setStep("idle")}
                                >
                                    <RefreshCw size={15} />
                                    <span>Try Another File</span>
                                </button>
                                <button
                                    type="button"
                                    className="bsm-btn-cancel"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. MODAL FOOTER */}
                {step === "preview" && (
                    <div className="bsm-footer">
                        <button
                            type="button"
                            className="bsm-btn-cancel"
                            onClick={handleClose}
                            disabled={isImporting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="bsm-btn-import"
                            onClick={handleImportConfirmed}
                            disabled={isImporting || extractedList.length === 0}
                        >
                            {isImporting ? (
                                <>
                                    <div className="bsm-spinner" />
                                    <span>Saving to Database...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    <span>Import {extractedList.length} Transactions</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankStatementModal;
