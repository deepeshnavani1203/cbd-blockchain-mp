import React from "react";

/**
 * Top navigation bar — shows branding, network status, and connected wallet info.
 */
function Navbar({ account, ethBalance, networkId, onConnect, loading }) {
  const truncate = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const isLocalNetwork =
    Number(networkId) === 1337 || Number(networkId) === 5777;

  return (
    <nav className="navbar-bank">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand */}
        <a href="/" className="navbar-brand-custom">
          <span className="brand-icon">
            <i className="bi bi-bank"></i>
          </span>
          Block<span className="text-gradient">Bank</span>
        </a>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-sm">
          {account ? (
            <>
              {/* Network Badge */}
              <span
                className={`network-badge ${
                  isLocalNetwork ? "correct" : "wrong"
                }`}
              >
                <i
                  className={`bi ${
                    isLocalNetwork ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"
                  }`}
                ></i>
                {isLocalNetwork ? "Localhost" : "Wrong Network"}
              </span>

              {/* ETH Balance */}
              <div
                className="wallet-badge d-none d-md-flex"
                title={`${parseFloat(ethBalance).toFixed(4)} ETH`}
              >
                <i className="bi bi-currency-exchange text-cyan"></i>
                {parseFloat(ethBalance).toFixed(3)} ETH
              </div>

              {/* Account */}
              <div className="wallet-badge" title={account}>
                <span className="wallet-dot"></span>
                {truncate(account)}
              </div>
            </>
          ) : (
            <button
              className="btn-connect"
              onClick={onConnect}
              disabled={loading}
              id="navbar-connect"
            >
              {loading ? (
                <>
                  <span className="spinner-bank"></span>
                </>
              ) : (
                <>
                  <i className="bi bi-wallet2"></i> Connect
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
