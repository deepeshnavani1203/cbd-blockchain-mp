import React, { useState } from "react";

/**
 * Transfer tab — internal bank-to-bank transfer between users.
 * Tokens stay in the contract; only ledger balances change.
 */
function Transfer({ web3, account, bank, bankBalance, onTxComplete, addTransaction }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTransfer = async () => {
    if (!recipient || !web3.utils.isAddress(recipient)) {
      setStatus({ type: "error", message: "Please enter a valid Ethereum address." });
      return;
    }
    if (recipient.toLowerCase() === account.toLowerCase()) {
      setStatus({ type: "error", message: "Cannot transfer to your own account." });
      return;
    }
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

      setStatus({ type: "info", message: "Confirm the transfer in MetaMask…" });
      const receipt = await bank.methods
        .transfer(recipient, amountWei)
        .send({ from: account, gasPrice: '20000000000' });

      setStatus({
        type: "success",
        message: `Transferred ${amount} BNK to ${recipient.slice(0, 6)}…${recipient.slice(-4)}`,
        txHash: receipt.transactionHash,
      });
      addTransaction("transfer", amount, receipt.transactionHash);
      onTxComplete();
      setAmount("");
      setRecipient("");
    } catch (err) {
      console.error("Transfer error:", err);
      setStatus({
        type: "error",
        message: err.message?.includes("User denied")
          ? "Transaction rejected by user."
          : err.message || "Transfer failed.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="page-section">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon" style={{ background: "rgba(64,196,255,0.12)", color: "var(--info)" }}>
          <i className="bi bi-arrow-left-right"></i>
        </div>
        <div>
          <div className="section-title">Transfer BNK</div>
          <div className="section-subtitle">Send deposited BNK to another user's bank account</div>
        </div>
      </div>

      {/* Balance */}
      <div className="balance-display">
        <span className="balance-label">Available:</span>
        <span className="balance-amount">
          {parseFloat(bankBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="balance-label">BNK</span>
      </div>

      {/* Form */}
      <div className="glass-card no-hover">
        {/* Recipient */}
        <label className="form-label-bank" htmlFor="transfer-recipient">
          Recipient Address
        </label>
        <input
          id="transfer-recipient"
          type="text"
          className="form-control-bank mb-lg"
          placeholder="0x…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={loading}
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
        />

        {/* Amount */}
        <label className="form-label-bank" htmlFor="transfer-amount">
          Amount
        </label>
        <div className="input-group-bank mb-lg">
          <input
            id="transfer-amount"
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
          onClick={handleTransfer}
          disabled={loading || !amount || !recipient}
          id="btn-transfer"
        >
          {loading ? (
            <>
              <span className="spinner-bank"></span> Processing…
            </>
          ) : (
            <>
              <i className="bi bi-send"></i> Send Transfer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Transfer;
