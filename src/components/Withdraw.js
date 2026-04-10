import React, { useState } from "react";

/**
 * Withdraw tab — pull BNK tokens from the bank back to the connected wallet.
 */
function Withdraw({ web3, account, bank, bnkBalance, bankBalance, onTxComplete, addTransaction }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount." });
      return;
    }
    if (parseFloat(amount) > parseFloat(bankBalance)) {
      setStatus({ type: "error", message: "Amount exceeds your bank deposit balance." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const amountWei = web3.utils.toWei(amount, "ether");

      setStatus({ type: "info", message: "Confirm the withdrawal in MetaMask…" });
      const receipt = await bank.methods
        .withdraw(amountWei)
        .send({ from: account, gasPrice: '20000000000' });

      setStatus({
        type: "success",
        message: `Successfully withdrew ${amount} BNK!`,
        txHash: receipt.transactionHash,
      });
      addTransaction("withdrawal", amount, receipt.transactionHash);
      onTxComplete();
      setAmount("");
    } catch (err) {
      console.error("Withdraw error:", err);
      setStatus({
        type: "error",
        message: err.message?.includes("User denied")
          ? "Transaction rejected by user."
          : err.message || "Withdrawal failed.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: "rgba(255,82,82,0.12)", color: "var(--danger)" }}>
          <i className="bi bi-box-arrow-up"></i>
        </div>
        <div>
          <div className="section-title">Withdraw BNK</div>
          <div className="section-subtitle">Move tokens from the bank back to your wallet</div>
        </div>
      </div>

      {/* Balance */}
      <div className="balance-display">
        <span className="balance-label">Bank:</span>
        <span className="balance-amount">
          {parseFloat(bankBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="balance-label">BNK</span>
        <span style={{ margin: "0 12px", color: "var(--text-muted)" }}>|</span>
        <span className="balance-label">Wallet:</span>
        <span className="balance-amount" style={{ fontSize: "1.1rem" }}>
          {parseFloat(bnkBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="balance-label">BNK</span>
      </div>

      {/* Form */}
      <div className="glass-card no-hover">
        <label className="form-label-bank" htmlFor="withdraw-amount">
          Amount to Withdraw
        </label>
        <div className="input-group-bank mb-lg">
          <input
            id="withdraw-amount"
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
            onClick={() => setAmount(bankBalance)}
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
          onClick={handleWithdraw}
          disabled={loading || !amount}
          id="btn-withdraw"
        >
          {loading ? (
            <>
              <span className="spinner-bank"></span> Processing…
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-up"></i> Withdraw
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Withdraw;
