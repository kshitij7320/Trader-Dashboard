import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { ACCOUNT_CONFIG, INITIAL_TRADES, calculateMetrics } from './utils/tradingMetrics';
import './App.scss';

export default function App() {
  const [trades] = useState(INITIAL_TRADES);
  const metrics = calculateMetrics(trades, ACCOUNT_CONFIG);

  const formatUSD = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusIcon = (status) => {
    if (status === 'At Risk') return <ShieldAlert size={18} />;
    if (status === 'Approaching Limit') return <AlertTriangle size={18} />;
    return <ShieldCheck size={18} />;
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Tradescape Risk Control</h1>
          <p className="subtitle">Evaluation Account #TRD-9042</p>
        </div>
        <div className={`status-badge status-badge--${metrics.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {getStatusIcon(metrics.status)}
          <span>Status: {metrics.status}</span>
        </div>
      </header>

      {/* Account Overview Cards */}
      <section className="metrics-grid">
        <div className="card">
          <span className="card__label">Starting Balance</span>
          <span className="card__value">{formatUSD(ACCOUNT_CONFIG.startingBalance)}</span>
        </div>
        <div className="card">
          <span className="card__label">Current Balance</span>
          <span className="card__value">{formatUSD(metrics.currentBalance)}</span>
        </div>
        <div className="card">
          <span className="card__label">Total P&L</span>
          <span className={`card__value ${metrics.totalPnL >= 0 ? 'text-green' : 'text-red'}`}>
            {metrics.totalPnL >= 0 ? '+' : ''}{formatUSD(metrics.totalPnL)}
          </span>
        </div>
        <div className="card">
          <span className="card__label">Win Rate</span>
          <span className="card__value">{metrics.winRate}%</span>
          <span className="card__subtext">{metrics.winningCount} Wins / {metrics.losingCount} Losses</span>
        </div>
      </section>

      {/* Risk Limit Indicators */}
      <section className="card risk-indicator">
        <h2>Account Risk & Compliance Limits</h2>
        <div className="risk-indicator__grid">
          <div className="risk-box">
            <div className="risk-box__header">
              <span>Current Peak Drawdown</span>
              <span>{formatUSD(metrics.currentDrawdown)} / {formatUSD(ACCOUNT_CONFIG.maxDrawdown)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar__fill progress-bar__fill--drawdown"
                style={{ width: `${Math.min(100, (metrics.currentDrawdown / ACCOUNT_CONFIG.maxDrawdown) * 100)}%` }}
              />
            </div>
            <span className="risk-box__remaining">
              Remaining drawdown buffer: <strong>{formatUSD(metrics.remainingDrawdown)}</strong>
            </span>
          </div>

          <div className="risk-box">
            <div className="risk-box__header">
              <span>Current Day's Loss</span>
              <span>{formatUSD(metrics.currentDaysLoss)} / {formatUSD(ACCOUNT_CONFIG.dailyLossLimit)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar__fill progress-bar__fill--loss"
                style={{ width: `${Math.min(100, (metrics.currentDaysLoss / ACCOUNT_CONFIG.dailyLossLimit) * 100)}%` }}
              />
            </div>
            <span className="risk-box__remaining">
              Remaining daily limit: <strong>{formatUSD(metrics.remainingDailyLoss)}</strong>
            </span>
          </div>
        </div>
      </section>

      <div className="two-column">
        {/* Trade Log */}
        <section className="card">
          <h2>Trade Performance</h2>
          <div className="trade-stats">
            <div className="stat-item">
              <span>Largest Win</span>
              <strong className="text-green"><TrendingUp size={14} /> +{formatUSD(metrics.largestWin)}</strong>
            </div>
            <div className="stat-item">
              <span>Largest Loss</span>
              <strong className="text-red"><TrendingDown size={14} /> {formatUSD(metrics.largestLoss)}</strong>
            </div>
          </div>
          <table className="trades-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Side</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td><strong>{trade.symbol}</strong></td>
                  <td><span className={`side-tag ${trade.side.toLowerCase()}`}>{trade.side}</span></td>
                  <td className={trade.pnl >= 0 ? 'text-green' : 'text-red'}>
                    {trade.pnl >= 0 ? '+' : ''}{formatUSD(trade.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Feature: Asset Breakdown */}
        <section className="card">
          <h2>Performance by Asset</h2>
          <p className="card__desc">Aggregated session breakdown per crypto pair.</p>
          <ul className="asset-list">
            {Object.entries(metrics.assetPerformance).map(([symbol, data]) => (
              <li key={symbol} className="asset-item">
                <div className="asset-item__info">
                  <span className="asset-item__symbol">{symbol}</span>
                  <span className="asset-item__count">{data.count} trade{data.count > 1 ? 's' : ''}</span>
                </div>
                <span className={`asset-item__pnl ${data.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                  {data.pnl >= 0 ? '+' : ''}{formatUSD(data.pnl)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}