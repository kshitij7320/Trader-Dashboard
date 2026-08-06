export const ACCOUNT_CONFIG = {
  startingBalance: 100000,
  maxDrawdown: 10000,
  dailyLossLimit: 5000,
};

export const INITIAL_TRADES = [
  { id: 1, symbol: 'BTC', side: 'Long', pnl: 1200 },
  { id: 2, symbol: 'ETH', side: 'Short', pnl: -450 },
  { id: 3, symbol: 'BTC', side: 'Short', pnl: 800 },
  { id: 4, symbol: 'SOL', side: 'Long', pnl: -300 },
  { id: 5, symbol: 'ETH', side: 'Long', pnl: 2000 },
];

export function calculateMetrics(trades, config) {
  const totalPnL = trades.reduce((acc, trade) => acc + trade.pnl, 0);
  const currentBalance = config.startingBalance + totalPnL;

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const largestWin = winningTrades.length ? Math.max(...winningTrades.map((t) => t.pnl)) : 0;
  const largestLoss = losingTrades.length ? Math.min(...losingTrades.map((t) => t.pnl)) : 0;

  // Track Peak-to-Trough Drawdown across trading session
  let peak = config.startingBalance;
  let maxPeakDrawdown = 0;
  let runningBalance = config.startingBalance;

  trades.forEach((trade) => {
    runningBalance += trade.pnl;
    if (runningBalance > peak) peak = runningBalance;
    const currentDd = peak - runningBalance;
    if (currentDd > maxPeakDrawdown) maxPeakDrawdown = currentDd;
  });

  const currentDrawdown = maxPeakDrawdown;
  const remainingDrawdown = Math.max(0, config.maxDrawdown - currentDrawdown);

  // Daily Loss calculation
  const currentDaysLoss = losingTrades.reduce((acc, t) => acc + Math.abs(t.pnl), 0);
  const remainingDailyLoss = Math.max(0, config.dailyLossLimit - currentDaysLoss);

  // Risk Classification
  const ddUsedPct = (currentDrawdown / config.maxDrawdown) * 100;
  const dailyLossUsedPct = (currentDaysLoss / config.dailyLossLimit) * 100;
  const maxRiskPct = Math.max(ddUsedPct, dailyLossUsedPct);

  let status = 'Safe';
  if (maxRiskPct >= 100) status = 'At Risk';
  else if (maxRiskPct >= 70) status = 'Approaching Limit';

  // Feature: Aggregated Asset Performance
  const assetPerformance = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) acc[trade.symbol] = { pnl: 0, count: 0 };
    acc[trade.symbol].pnl += trade.pnl;
    acc[trade.symbol].count += 1;
    return acc;
  }, {});

  return {
    totalPnL,
    currentBalance,
    winningCount: winningTrades.length,
    losingCount: losingTrades.length,
    winRate: winRate.toFixed(1),
    largestWin,
    largestLoss,
    currentDrawdown,
    remainingDrawdown,
    currentDaysLoss,
    remainingDailyLoss,
    status,
    assetPerformance,
  };
}