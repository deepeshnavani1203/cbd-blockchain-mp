import React from "react";

/**
 * Dashboard — overview cards (wallet BNK, deposited BNK, active loan, account)
 * and recent transaction history.
 */
function Dashboard({
  account,
  ethBalance,
  bnkBalance,
  bankBalance,
  loanBalance,
  transactions,
}) {
  const truncate = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <div>
      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* Wallet BNK */}
        <div className="col-md-6 col-lg-3">
          <div className="glass-card stat-card stagger-1">
            <div className="stat-icon purple">
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="stat-label">Wallet Balance</div>
            <div className="stat-value">
              {parseFloat(bnkBalance).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
        </div>

        {/* Deposited BNK */}
        <div className="col-md-6 col-lg-3">
          <div className="glass-card stat-card stagger-2">
            <div className="stat-icon cyan">
              <i className="bi bi-safe2"></i>
            </div>
            <div className="stat-label">Bank Deposits</div>
            <div className="stat-value">
              {parseFloat(bankBalance).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
        </div>

        {/* Active Loan */}
        <div className="col-md-6 col-lg-3">
          <div className="glass-card stat-card stagger-3">
            <div className="stat-icon red">
              <i className="bi bi-credit-card-2-back"></i>
            </div>
            <div className="stat-label">Active Loan</div>
            <div className="stat-value">
              {parseFloat(loanBalance).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              <span className="stat-unit">BNK</span>
            </div>
          </div>
        </div>

        {/* ETH Balance */}
        <div className="col-md-6 col-lg-3">
          <div className="glass-card stat-card stagger-4">
            <div className="stat-icon green">
              <i className="bi bi-currency-exchange"></i>
            </div>
            <div className="stat-label">ETH Balance</div>
            <div className="stat-value">
              {parseFloat(ethBalance).toFixed(3)}
              <span className="stat-unit">ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Account Info ──────────────────────────────────── */}
      <div className="glass-card no-hover mb-4">
        <div className="d-flex align-items-center gap-md flex-wrap">
          <div>
            <div className="stat-label mb-sm">Connected Account</div>
            <div className="font-mono" style={{ fontSize: "0.95rem" }}>
              {account}
            </div>
          </div>
        </div>
      </div>

      {/* ── Transaction History ────────────────────────────── */}
      <div className="glass-card no-hover">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-clock-history me-2 text-accent"></i>
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-inbox"></i>
            </div>
            <p>No transactions yet. Make your first deposit to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`tx-type-badge ${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="font-mono">
                      {parseFloat(tx.amount).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      BNK
                    </td>
                    <td>
                      <span className="tx-hash">
                        {truncate(tx.txHash)}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
