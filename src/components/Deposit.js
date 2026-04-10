import React, { useState } from "react";

/**
 * Deposit tab — approve BNK to bank contract, then deposit.
 * Two-step flow: approve → deposit, both trigger MetaMask popups.
 */
function Deposit({ web3, account, bankToken, bank, bnkBalance, bankBalance, onTxComplete, addTransaction }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message, txHash? }

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount." });
      return;
    }
    if (parseFloat(amount) > parseFloat(bnkBalance)) {
      setStatus({ type: "error", message: "Amount exceeds wallet BNK balance." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const amountWei = web3.utils.toWei(amount, "ether");
      const bankAddress = bank.options.address;

      // Step 1: Approve
      setStatus({ type: "info", message: "Step 1/2 — Approving BNK tokens…" });
      await bankToken.methods
        .approve(bankAddress, amountWei)
        .send({ from: account, gasPrice: '20000000000' });

      // Step 2: Deposit
      setStatus({ type: "info", message: "Step 2/2 — Depositing BNK tokens…" });
      const receipt = await bank.methods
        .deposit(amountWei)
        .send({ from: account, gasPrice: '20000000000' });

      setStatus({
        type: "success",
        message: `Successfully deposited ${amount} BNK!`,
        txHash: receipt.transactionHash,
      });
      addTransaction("deposit", amount, receipt.transactionHash);
      onTxComplete();
      setAmount("");
    } catch (err) {
      console.error("Deposit error:", err);
      setStatus({
        type: "error",
        message: err.message?.includes("User denied")
          ? "Transaction rejected by user."
          : err.message || "Deposit failed.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: "rgba(0,230,118,0.12)", color: "var(--success)" }}>
          <i className="bi bi-box-arrow-in-down"></i>
        </div>
        <div>
          <div className="section-title">Deposit BNK</div>
          <div className="section-subtitle">Move tokens from your wallet into the bank</div>
        </div>
      </div>

      {/* Balance */}
      <div className="balance-display">
        <span className="balance-label">Wallet:</span>
        <span className="balance-amount">
          {parseFloat(bnkBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="balance-label">BNK</span>
        <span style={{ margin: "0 12px", color: "var(--text-muted)" }}>|</span>
        <span className="balance-label">Bank:</span>
        <span className="balance-amount" style={{ fontSize: "1.1rem" }}>
          {parseFloat(bankBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="balance-label">BNK</span>
      </div>

      {/* Form */}
      <div className="glass-card no-hover">
        <label className="form-label-bank" htmlFor="deposit-amount">
          Amount to Deposit
        </label>
        <div className="input-group-bank mb-lg">
          <input
            id="deposit-amount"
            type="number"
            className="form-control-bank"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            disabled={loading}
            style={{ paddingRight: "60px" }}
          />
          <button
            className="btn-max"
            onClick={() => setAmount(bnkBalance)}
            disabled={loading}
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
          onClick={handleDeposit}
          disabled={loading || !amount}
          id="btn-deposit"
        >
          {loading ? (
            <>
              <span className="spinner-bank"></span> Processing…
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-down"></i> Approve & Deposit
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Deposit;
