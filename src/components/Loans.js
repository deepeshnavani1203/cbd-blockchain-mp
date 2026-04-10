import React, { useState } from "react";

/**
 * Loans tab — request a new loan (max 2× deposits), view active loan,
 * and repay with 10% interest.
 */
function Loans({
  web3,
  account,
  bankToken,
  bank,
  bnkBalance,
  bankBalance,
  loanBalance,
  onTxComplete,
  addTransaction,
}) {
  const [loanAmount, setLoanAmount] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingRepay, setLoadingRepay] = useState(false);
  const [status, setStatus] = useState(null);

  const hasActiveLoan = parseFloat(loanBalance) > 0;
  const maxLoan = parseFloat(bankBalance) * 2;
  const interest = parseFloat(loanBalance) * 0.1;
  const totalRepayment = parseFloat(loanBalance) + interest;

  // ── Request Loan ───────────────────────────────────────────
  const handleRequestLoan = async () => {
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid loan amount." });
      return;
    }
    if (parseFloat(loanAmount) > maxLoan) {
      setStatus({
        type: "error",
        message: `Loan exceeds maximum (2× your deposit = ${maxLoan.toLocaleString()} BNK).`,
      });
      return;
    }
    if (hasActiveLoan) {
      setStatus({ type: "error", message: "Repay your current loan before requesting a new one." });
      return;
    }

    setLoadingRequest(true);
    setStatus(null);

    try {
      const amountWei = web3.utils.toWei(loanAmount, "ether");

      setStatus({ type: "info", message: "Confirm loan request in MetaMask…" });
      const receipt = await bank.methods
        .requestLoan(amountWei)
        .send({ from: account, gasPrice: '20000000000' });

      setStatus({
        type: "success",
        message: `Loan of ${loanAmount} BNK approved!`,
        txHash: receipt.transactionHash,
      });
      addTransaction("loan", loanAmount, receipt.transactionHash);
      onTxComplete();
      setLoanAmount("");
    } catch (err) {
      console.error("Loan request error:", err);
      setStatus({
        type: "error",
        message: err.message?.includes("User denied")
          ? "Transaction rejected by user."
          : err.message || "Loan request failed.",
      });
    }

    setLoadingRequest(false);
  };

  // ── Repay Loan ─────────────────────────────────────────────
  const handleRepayLoan = async () => {
    if (!hasActiveLoan) return;

    setLoadingRepay(true);
    setStatus(null);

    try {
      const repaymentWei = web3.utils.toWei(totalRepayment.toString(), "ether");
      const bankAddress = bank.options.address;

      // Step 1: Approve repayment amount
      setStatus({ type: "info", message: "Step 1/2 — Approving repayment tokens…" });
      await bankToken.methods
        .approve(bankAddress, repaymentWei)
        .send({ from: account, gasPrice: '20000000000' });

      // Step 2: Repay
      setStatus({ type: "info", message: "Step 2/2 — Repaying loan…" });
      const receipt = await bank.methods
        .repayLoan()
        .send({ from: account, gasPrice: '20000000000' });

      setStatus({
        type: "success",
        message: `Loan repaid! Total: ${totalRepayment.toLocaleString()} BNK (incl. 10% interest)`,
        txHash: receipt.transactionHash,
      });
      addTransaction("repay", totalRepayment.toString(), receipt.transactionHash);
      onTxComplete();
    } catch (err) {
      console.error("Repay error:", err);
      setStatus({
        type: "error",
        message: err.message?.includes("User denied")
          ? "Transaction rejected by user."
          : err.message || "Loan repayment failed.",
      });
    }

    setLoadingRepay(false);
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: "rgba(255,215,64,0.12)", color: "var(--warning)" }}>
          <i className="bi bi-bank2"></i>
        </div>
        <div>
          <div className="section-title">Loans</div>
          <div className="section-subtitle">Borrow up to 2× your deposits — repay with 10% interest</div>
        </div>
      </div>

      {/* ── Active Loan Panel ─────────────────────────────── */}
      <div className="glass-card no-hover loan-panel mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Loan Status
          </h4>
          <span className={`loan-status ${hasActiveLoan ? "active" : "none"}`}>
            <i className={`bi ${hasActiveLoan ? "bi-exclamation-circle" : "bi-check-circle"}`}></i>
            {hasActiveLoan ? "Active Loan" : "No Loan"}
          </span>
        </div>

        <div className="row g-3">
          <div className="col-sm-4">
            <div className="stat-label">Principal</div>
            <div className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {parseFloat(loanBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="stat-label">Interest (10%)</div>
            <div className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--warning)" }}>
              {interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="stat-label">Total Repayment</div>
            <div className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--danger)" }}>
              {totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
        </div>

        {hasActiveLoan && (
          <button
            className="btn-bank-danger mt-3"
            onClick={handleRepayLoan}
            disabled={loadingRepay}
            id="btn-repay-loan"
          >
            {loadingRepay ? (
              <>
                <span className="spinner-bank"></span> Processing…
              </>
            ) : (
              <>
                <i className="bi bi-cash-coin"></i> Repay Full Loan ({totalRepayment.toLocaleString()} BNK)
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Request New Loan ──────────────────────────────── */}
      <div className="glass-card no-hover">
        <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-plus-circle me-2 text-accent"></i>
          Request New Loan
        </h4>

        <div className="balance-display mb-md">
          <span className="balance-label">Your Deposits:</span>
          <span className="balance-amount" style={{ fontSize: "1.1rem" }}>
            {parseFloat(bankBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="balance-label">BNK</span>
          <span style={{ margin: "0 12px", color: "var(--text-muted)" }}>→</span>
          <span className="balance-label">Max Loan:</span>
          <span className="balance-amount" style={{ fontSize: "1.1rem", color: "var(--accent-secondary)" }}>
            {maxLoan.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="balance-label">BNK</span>
        </div>

        <label className="form-label-bank" htmlFor="loan-amount">
          Loan Amount
        </label>
        <div className="input-group-bank mb-lg">
          <input
            id="loan-amount"
            type="number"
            className="form-control-bank"
            placeholder="0.00"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            min="0"
            max={maxLoan}
            step="any"
            disabled={loadingRequest || hasActiveLoan}
            style={{ paddingRight: "60px" }}
          />
          <button
            className="btn-max"
            onClick={() => setLoanAmount(maxLoan.toString())}
            disabled={loadingRequest || hasActiveLoan}
          >
            MAX
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className={`alert-bank ${status.type} mb-md`}>
            <i
              className={`bi ${
                status.type === "success"
                  ? "bi-check-circle-fill"
                  : status.type === "error"
                  ? "bi-exclamation-triangle-fill"
                  : "bi-info-circle-fill"
              }`}
            ></i>
            <div>
              {status.message}
              {status.txHash && (
                <div className="tx-hash mt-1">
                  <i className="bi bi-link-45deg"></i>
                  Tx: {status.txHash}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          className="btn-bank-primary"
          onClick={handleRequestLoan}
          disabled={loadingRequest || hasActiveLoan || !loanAmount}
          id="btn-request-loan"
        >
          {loadingRequest ? (
            <>
              <span className="spinner-bank"></span> Processing…
            </>
          ) : hasActiveLoan ? (
            <>
              <i className="bi bi-lock"></i> Repay Existing Loan First
            </>
          ) : (
            <>
              <i className="bi bi-bank2"></i> Request Loan
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Loans;
