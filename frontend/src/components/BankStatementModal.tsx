import React, { useState, useRef } from "react";
import { parseBankStatement, importBatchTransactions } from "../api/transactions";
import type { Transaction } from "../api/transactions";

interface BankStatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: (imported: Transaction[]) => void;
}

type ModalStep = "idle" | "processing" | "preview" | "error";

const CATEGORIES = [
    "Income",
    "Food",
    "Shopping",
    "Transport",
    "Entertainment",
    "Bills",
    "Other",
];

const BankStatementModal: React.FC<BankStatementModalProps> = ({
    isOpen,
    onClose,
    onImportSuccess,
}) => {
    const [step, setStep] = useState<ModalStep>("idle");
    const [processingStep, setProcessingStep] = useState<number>(1);
    const [fileName, setFileName] = useState<string>("");
    const [extractedList, setExtractedList] = useState<Omit<Transaction, "_id">[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const resetModal = () => {
        setStep("idle");
        setProcessingStep(1);
        setFileName("");
        setExtractedList([]);
        setErrorMessage("");
        setIsImporting(false);
        setIsDragOver(false);
    };

    const handleClose = () => {
        if (isImporting) return;
        resetModal();
        onClose();
    };

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt");

        if (!isPdf && !isCsv) {
            setErrorMessage("Please upload a valid PDF or CSV bank statement.");
            setStep("error");
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            setErrorMessage("File size exceeds 15MB limit. Please upload a smaller statement.");
            setStep("error");
            return;
        }

        setFileName(file.name);
        setStep("processing");
        setProcessingStep(1);
        setErrorMessage("");

        // Multi-stage progress indicators
        const timer1 = setTimeout(() => setProcessingStep(2), 700);
        const timer2 = setTimeout(() => setProcessingStep(3), 1400);

        try {
            const result = await parseBankStatement(file);

            clearTimeout(timer1);
            clearTimeout(timer2);

            if (!result.transactions || result.transactions.length === 0) {
                setErrorMessage("No readable transactions were found in this statement. Please check the file format.");
                setStep("error");
                return;
            }

            setExtractedList(result.transactions);
            setStep("preview");
        } catch (err: any) {
            clearTimeout(timer1);
            clearTimeout(timer2);
            console.error("Statement upload error:", err);
            const msg = err.response?.data?.message || err.message || "Unable to process the bank statement. Please try again.";
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
            const isIncome = newCategory === "Income";
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
            const imported = await importBatchTransactions(extractedList);
            onImportSuccess(imported);
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

    return (
        <div className="statement-modal-overlay" onClick={handleClose}>
            <div
                className={`statement-modal-container ${step === "preview" ? "statement-modal-wide" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* MODAL HEADER */}
                <div className="statement-modal-header">
                    <div>
                        <h2>Import Bank Statement</h2>
                        <p>Upload your PDF or CSV bank statement to auto-extract transactions</p>
                    </div>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={isImporting}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="statement-modal-body">
                    {/* IDLE STATE: DROPZONE */}
                    {step === "idle" && (
                        <div className="statement-upload-section">
                            <div
                                className={`statement-dropzone ${isDragOver ? "dropzone-active" : ""}`}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    accept=".pdf,.csv,.txt,application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                />

                                <div className="dropzone-icon-wrapper">
                                    <svg
                                        width="44"
                                        height="44"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <path d="M12 18v-6" />
                                        <path d="m9 15 3-3 3 3" />
                                    </svg>
                                </div>

                                <div className="dropzone-text">
                                    <h3>Upload Bank Statement</h3>
                                    <p>Drag & drop your PDF statement here, or <span className="browse-link">browse files</span></p>
                                    <span className="file-hints">Supported: PDF & CSV (HDFC, SBI, ICICI, Axis, Kotak, etc.) • Max 15MB</span>
                                </div>

                                <button
                                    type="button"
                                    className="choose-pdf-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    Choose PDF
                                </button>
                            </div>

                            <div className="statement-privacy-note">
                                <span className="lock-icon">🔒</span>
                                <span>Your financial statements are parsed securely in-memory. Data is never shared or stored until you verify and click Import.</span>
                            </div>
                        </div>
                    )}

                    {/* PROCESSING STATE */}
                    {step === "processing" && (
                        <div className="statement-processing-view">
                            <div className="processing-spinner-wrapper">
                                <div className="processing-pulse-ring" />
                                <div className="processing-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </div>
                            </div>

                            <h3>Analyzing Statement: {fileName}</h3>

                            <div className="processing-stepper">
                                <div className={`step-item ${processingStep >= 1 ? "step-active" : ""}`}>
                                    <div className="step-dot">{processingStep > 1 ? "✓" : "1"}</div>
                                    <span>Uploading statement</span>
                                </div>
                                <div className={`step-line ${processingStep >= 2 ? "line-active" : ""}`} />
                                <div className={`step-item ${processingStep >= 2 ? "step-active" : ""}`}>
                                    <div className="step-dot">{processingStep > 2 ? "✓" : "2"}</div>
                                    <span>Processing text structure</span>
                                </div>
                                <div className={`step-line ${processingStep >= 3 ? "line-active" : ""}`} />
                                <div className={`step-item ${processingStep >= 3 ? "step-active" : ""}`}>
                                    <div className="step-dot">3</div>
                                    <span>Extracting transactions</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PREVIEW STATE */}
                    {step === "preview" && (
                        <div className="statement-preview-view">
                            {/* PREVIEW STATS BAR */}
                            <div className="preview-stats-bar">
                                <div className="preview-stat-chip">
                                    <span className="stat-label">Transactions Found</span>
                                    <span className="stat-value count-value">{extractedList.length}</span>
                                </div>
                                <div className="preview-stat-chip">
                                    <span className="stat-label">Total Inflow</span>
                                    <span className="stat-value income-value">+₹{totalInflow.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="preview-stat-chip">
                                    <span className="stat-label">Total Outflow</span>
                                    <span className="stat-value expense-value">-₹{totalOutflow.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <p className="preview-instruction">
                                Review the extracted transactions below. You can adjust categories or remove any unwanted rows before importing.
                            </p>

                            {/* PREVIEW TABLE */}
                            <div className="preview-table-container">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Merchant / Description</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th style={{ textAlign: "right" }}>Amount</th>
                                            <th style={{ width: "40px", textAlign: "center" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extractedList.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="preview-merchant-cell">
                                                        <span className="preview-merchant-name">{item.merchant}</span>
                                                        {item.description && item.description !== item.merchant && (
                                                            <span className="preview-merchant-desc">{item.description}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="preview-category-select"
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
                                                <td className="preview-date-cell">{formatDate(item.date)}</td>
                                                <td>
                                                    <span className={`preview-type-badge ${item.type === "income" ? "type-income" : "type-expense"}`}>
                                                        {item.type === "income" ? "Income" : "Expense"}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <span className={`preview-amount ${item.type === "income" ? "income-value" : "expense-value"}`}>
                                                        {item.type === "income" ? "+" : "-"}₹{Number(item.amount).toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        className="row-delete-btn"
                                                        title="Remove transaction"
                                                        onClick={() => handleRemoveItem(idx)}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {step === "error" && (
                        <div className="statement-error-view">
                            <div className="error-icon-circle">!</div>
                            <h3>Statement Processing Failed</h3>
                            <p>{errorMessage}</p>
                            <div className="error-actions">
                                <button type="button" className="btn-secondary" onClick={() => setStep("idle")}>
                                    Try Another Statement
                                </button>
                                <button type="button" className="btn-outline" onClick={handleClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                {step === "preview" && (
                    <div className="statement-modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setStep("idle")}
                            disabled={isImporting}
                        >
                            Upload Another File
                        </button>
                        <div className="footer-right-actions">
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={handleClose}
                                disabled={isImporting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleImportConfirmed}
                                disabled={isImporting || extractedList.length === 0}
                            >
                                {isImporting
                                    ? "Importing..."
                                    : `Import ${extractedList.length} Transactions`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankStatementModal;
