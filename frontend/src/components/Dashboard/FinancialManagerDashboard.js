// components/Dashboard/FinancialManagerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const FinancialManagerDashboard = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [financials, setFinancials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    projectPayments: 0,
    pendingPayments: 0,
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "Income",
    category: "Project Payment",
    amount: "",
    description: "",
    project: "",
    paymentMethod: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    income: [],
    expense: [],
  });

  useEffect(() => {
    fetchFinancialData();
    const interval = setInterval(fetchFinancialData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [financialsRes, summaryRes, projectsRes, clientsRes] =
        await Promise.all([
          axios.get("http://localhost:5000/financials"),
          axios.get("http://localhost:5000/financials/summary"),
          axios.get("http://localhost:5000/projects"),
          axios.get("http://localhost:5000/clients"),
        ]);

      const financialsData = financialsRes.data.financials || [];
      const projectsData = projectsRes.data.projects || [];
      const clientsData = clientsRes.data.clients || [];

      // Calculate monthly stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTransactions = financialsData.filter((f) => {
        const transDate = new Date(f.date);
        return (
          transDate.getMonth() === currentMonth &&
          transDate.getFullYear() === currentYear
        );
      });

      const monthlyIncome = monthlyTransactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpense = monthlyTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate project payments
      const projectPayments = financialsData
        .filter((t) => t.category === "Project Payment")
        .reduce((sum, t) => sum + t.amount, 0);

      // Prepare chart data (last 6 months)
      const chartLabels = [];
      const incomeData = [];
      const expenseData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString("default", { month: "short" });
        chartLabels.push(month);

        const monthTransactions = financialsData.filter((f) => {
          const transDate = new Date(f.date);
          return (
            transDate.getMonth() === date.getMonth() &&
            transDate.getFullYear() === date.getFullYear()
          );
        });

        incomeData.push(
          monthTransactions
            .filter((t) => t.type === "Income")
            .reduce((sum, t) => sum + t.amount, 0)
        );

        expenseData.push(
          monthTransactions
            .filter((t) => t.type === "Expense")
            .reduce((sum, t) => sum + t.amount, 0)
        );
      }

      setStats({
        totalIncome: summaryRes.data.totalIncome || 0,
        totalExpense: summaryRes.data.totalExpense || 0,
        balance: summaryRes.data.balance || 0,
        monthlyIncome,
        monthlyExpense,
        projectPayments,
        pendingPayments: calculatePendingPayments(projectsData, clientsData),
      });

      setFinancials(financialsData);
      setProjects(projectsData);
      setClients(clientsData);
      setChartData({
        labels: chartLabels,
        income: incomeData,
        expense: expenseData,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setLoading(false);
    }
  };

  const calculatePendingPayments = (projects, clients) => {
    // Calculate based on project budgets vs received payments
    const totalProjectBudgets = projects
      .filter((p) => p.status === "Active" || p.status === "Completed")
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const receivedPayments = financials
      .filter((f) => f.category === "Project Payment")
      .reduce((sum, f) => sum + f.amount, 0);

    return Math.max(0, totalProjectBudgets - receivedPayments);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/financials", {
        ...newTransaction,
        createdBy: authUser._id || authUser.id,
      });
      alert("Transaction recorded successfully!");
      setShowTransactionModal(false);
      setNewTransaction({
        type: "Income",
        category: "Project Payment",
        amount: "",
        description: "",
        project: "",
        paymentMethod: "Bank Transfer",
        date: new Date().toISOString().split("T")[0],
      });
      fetchFinancialData();
    } catch (err) {
      alert(
        "Error creating transaction: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const getCategoryOptions = () => {
    if (newTransaction.type === "Income") {
      return [
        "Project Payment",
        "Material Sales",
        "Equipment Rental",
        "Other Income",
      ];
    } else {
      return [
        "Material Purchase",
        "Equipment Purchase",
        "Salary",
        "Transportation",
        "Utilities",
        "Maintenance",
        "Other Expense",
      ];
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  if (loading) return <div>Loading financial data...</div>;

  return (
    <div className="inventory-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Financial Management Dashboard</h1>
          <h3>Welcome, {authUser?.name} | Financial Manager</h3>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => setActiveView("overview")}
          className={`nav-tab ${activeView === "overview" ? "active" : ""}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView("transactions")}
          className={`nav-tab ${activeView === "transactions" ? "active" : ""}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveView("reports")}
          className={`nav-tab ${activeView === "reports" ? "active" : ""}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveView("projects")}
          className={`nav-tab ${activeView === "projects" ? "active" : ""}`}
        >
          Project Financials
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <div>
          {/* Financial Summary Cards */}
          <div className="financial-summary-grid">
            <div className="financial-card income">
              <h3>Total Income</h3>
              <p className="financial-card-amount income">
                {formatCurrency(stats.totalIncome)}
              </p>
              <p className="financial-card-description">
                This Month: {formatCurrency(stats.monthlyIncome)}
              </p>
            </div>
            <div className="financial-card expense">
              <h3>Total Expenses</h3>
              <p className="financial-card-amount expense">
                {formatCurrency(stats.totalExpense)}
              </p>
              <p className="financial-card-description">
                This Month: {formatCurrency(stats.monthlyExpense)}
              </p>
            </div>
            <div
              className={`financial-card balance ${
                stats.balance < 0 ? "negative" : ""
              }`}
            >
              <h3>Current Balance</h3>
              <p
                className={`financial-card-amount balance ${
                  stats.balance < 0 ? "negative" : ""
                }`}
              >
                {formatCurrency(stats.balance)}
              </p>
              <p className="financial-card-description">
                Profit Margin:{" "}
                {stats.totalIncome > 0
                  ? ((stats.balance / stats.totalIncome) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="financial-card pending">
              <h3>Pending Payments</h3>
              <p className="financial-card-amount pending">
                {formatCurrency(stats.pendingPayments)}
              </p>
              <p className="financial-card-description">From active projects</p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="financial-chart-container">
            <h3>Monthly Income vs Expenses (Last 6 Months)</h3>
            <div className="financial-chart">
              {chartData.labels.map((label, idx) => (
                <div key={idx} className="financial-chart-bar">
                  <div className="financial-chart-bar-group">
                    <div
                      className="financial-chart-bar-income"
                      style={{
                        height: `${
                          (chartData.income[idx] /
                            Math.max(
                              ...chartData.income,
                              ...chartData.expense
                            )) *
                          150
                        }px`,
                      }}
                    />
                    <div
                      className="financial-chart-bar-expense"
                      style={{
                        height: `${
                          (chartData.expense[idx] /
                            Math.max(
                              ...chartData.income,
                              ...chartData.expense
                            )) *
                          150
                        }px`,
                      }}
                    />
                  </div>
                  <p className="financial-chart-label">{label}</p>
                </div>
              ))}
            </div>
            <div className="financial-chart-legend">
              <span className="financial-chart-legend-item">
                <span className="financial-chart-legend-color income"></span>
                Income
              </span>
              <span className="financial-chart-legend-item">
                <span className="financial-chart-legend-color expense"></span>
                Expenses
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="financial-quick-actions">
            <button
              onClick={() => {
                setNewTransaction({ ...newTransaction, type: "Income" });
                setShowTransactionModal(true);
              }}
              className="financial-btn income"
            >
              Record Income
            </button>
            <button
              onClick={() => {
                setNewTransaction({ ...newTransaction, type: "Expense" });
                setShowTransactionModal(true);
              }}
              className="financial-btn expense"
            >
              Record Expense
            </button>
            <button
              onClick={() => navigate("/financials")}
              className="financial-btn primary"
            >
              View All Transactions
            </button>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeView === "transactions" && (
        <div>
          <div className="financial-transactions-header">
            <h2>Recent Transactions</h2>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="financial-btn success"
            >
              + New Transaction
            </button>
          </div>

          <div className="financial-table-container">
            <table className="financial-table">
              <thead>
                <tr className="financial-table-header">
                  <th className="financial-table-th">Date</th>
                  <th className="financial-table-th">Transaction ID</th>
                  <th className="financial-table-th">Type</th>
                  <th className="financial-table-th">Category</th>
                  <th className="financial-table-th">Description</th>
                  <th className="financial-table-th">Project</th>
                  <th className="financial-table-th">Amount</th>
                  <th className="financial-table-th">Payment Method</th>
                  <th className="financial-table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {financials.slice(0, 20).map((transaction) => (
                  <tr key={transaction._id} className="financial-table-row">
                    <td className="financial-table-td">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="financial-table-td">
                      {transaction.transactionId}
                    </td>
                    <td className="financial-table-td">
                      <span
                        className={`financial-transaction-type ${
                          transaction.type === "Income" ? "income" : "expense"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="financial-table-td">
                      {transaction.category}
                    </td>
                    <td className="financial-table-td">
                      {transaction.description}
                    </td>
                    <td className="financial-table-td">
                      {transaction.project?.name || "-"}
                    </td>
                    <td
                      className={`financial-table-td financial-amount ${
                        transaction.type === "Income" ? "income" : "expense"
                      }`}
                    >
                      {transaction.type === "Income" ? "+" : "-"}{" "}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="financial-table-td">
                      {transaction.paymentMethod}
                    </td>
                    <td className="financial-table-td">
                      <Link to={`/financial/${transaction._id}`}>
                        <button className="view-btn">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeView === "reports" && (
        <div>
          <h2>Financial Reports</h2>

          {/* Category Breakdown */}
          <div className="financial-category-breakdown">
            <div className="financial-category-card">
              <h3>Income by Category</h3>
              {[
                "Project Payment",
                "Material Sales",
                "Equipment Rental",
                "Other Income",
              ].map((category) => {
                const categoryAmount = financials
                  .filter((f) => f.type === "Income" && f.category === category)
                  .reduce((sum, f) => sum + f.amount, 0);
                const percentage =
                  stats.totalIncome > 0
                    ? (categoryAmount / stats.totalIncome) * 100
                    : 0;
                return (
                  <div key={category} className="financial-category-item">
                    <div className="financial-category-header">
                      <span>{category}</span>
                      <span>{formatCurrency(categoryAmount)}</span>
                    </div>
                    <div className="financial-progress-bar">
                      <div
                        className="financial-progress-fill income"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="financial-category-card">
              <h3>Expense by Category</h3>
              {[
                "Material Purchase",
                "Equipment Purchase",
                "Salary",
                "Transportation",
                "Utilities",
                "Maintenance",
              ]
                .slice(0, 4)
                .map((category) => {
                  const categoryAmount = financials
                    .filter(
                      (f) => f.type === "Expense" && f.category === category
                    )
                    .reduce((sum, f) => sum + f.amount, 0);
                  const percentage =
                    stats.totalExpense > 0
                      ? (categoryAmount / stats.totalExpense) * 100
                      : 0;
                  return (
                    <div key={category} className="financial-category-item">
                      <div className="financial-category-header">
                        <span>{category}</span>
                        <span>{formatCurrency(categoryAmount)}</span>
                      </div>
                      <div className="financial-progress-bar">
                        <div
                          className="financial-progress-fill expense"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Export Options */}
          <div className="financial-export-section">
            <h3>Export Reports</h3>
            <div className="financial-export-buttons">
              <button className="financial-btn success">
                Export Monthly Report (PDF)
              </button>
              <button className="financial-btn primary">
                Export Transactions (Excel)
              </button>
              <button className="financial-btn secondary">
                Generate Tax Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Financials Tab */}
      {activeView === "projects" && (
        <div className="management-section">
          <h2>Project Financial Overview</h2>
          <div className="card-grid">
            {projects.map((project) => {
              const projectIncome = financials
                .filter(
                  (f) => f.type === "Income" && f.project?._id === project._id
                )
                .reduce((sum, f) => sum + f.amount, 0);
              const projectExpense = financials
                .filter(
                  (f) => f.type === "Expense" && f.project?._id === project._id
                )
                .reduce((sum, f) => sum + f.amount, 0);
              const projectBalance = projectIncome - projectExpense;
              const profitMargin =
                project.budget > 0
                  ? (projectBalance / project.budget) * 100
                  : 0;

              return (
                <div key={project._id} className="card">
                  <h3>{project.name}</h3>
                  <p>
                    <strong>Client:</strong> {project.client?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Budget:</strong>{" "}
                    {formatCurrency(project.budget || 0)}
                  </p>
                  <div className="financial-project-summary">
                    <div className="financial-project-row">
                      <span>Income:</span>
                      <span className="revenue-amount">
                        +{formatCurrency(projectIncome)}
                      </span>
                    </div>
                    <div className="financial-project-row">
                      <span>Expenses:</span>
                      <span className="pending-amount">
                        -{formatCurrency(projectExpense)}
                      </span>
                    </div>
                    <div className="financial-project-balance">
                      <span>
                        <strong>Balance:</strong>
                      </span>
                      <span
                        className={
                          projectBalance >= 0
                            ? "revenue-amount"
                            : "pending-amount"
                        }
                      >
                        {formatCurrency(projectBalance)}
                      </span>
                    </div>
                  </div>
                  <div className="financial-profit-margin">
                    <div className="financial-profit-margin-header">
                      <span>Profit Margin</span>
                      <span>{profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="financial-profit-bar">
                      <div
                        className={`financial-profit-fill ${
                          profitMargin >= 0 ? "positive" : "negative"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, profitMargin))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Financial Transaction</h2>
            <form onSubmit={handleCreateTransaction}>
              <div className="form-group">
                <label>Transaction Type *</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value,
                      category:
                        e.target.value === "Income"
                          ? "Project Payment"
                          : "Material Purchase",
                    })
                  }
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: e.target.value,
                    })
                  }
                >
                  {getCategoryOptions().map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter transaction description"
                />
              </div>

              <div className="form-group">
                <label>Project (Optional)</label>
                <select
                  value={newTransaction.project}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      project: e.target.value,
                    })
                  }
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={newTransaction.paymentMethod}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="button-group">
                <button type="submit" className="action-btn">
                  Record Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setNewTransaction({
                      type: "Income",
                      category: "Project Payment",
                      amount: "",
                      description: "",
                      project: "",
                      paymentMethod: "Bank Transfer",
                      date: new Date().toISOString().split("T")[0],
                    });
                  }}
                  className="action-btn secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagerDashboard;
