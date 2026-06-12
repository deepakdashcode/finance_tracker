import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DashboardSkeleton } from "@/components/Skeleton";

function formatCurrency(value: number) {
  return "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div className="p-6"><p className="text-muted-foreground">No data available.</p></div>;

  const savingsRate = data.monthlyIncome > 0
    ? ((data.monthlyIncome - data.monthlyExpense) / data.monthlyIncome * 100).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.monthlyIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(data.monthlyExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{savingsRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expense (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Income", amount: data.monthlyIncome },
                { name: "Expense", amount: data.monthlyExpense },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            {data.categoryBreakdown.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">No expense data this month</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.expenseTrend.length > 0 ? data.expenseTrend : [{ date: "No data", amount: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCategories.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No spending this month</p>
            ) : (
              <div className="space-y-3">
                {data.topCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm">{cat.category}</span>
                    <span className="text-sm font-medium">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent transactions</p>
          ) : (
            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Date</th>
                    <th className="text-left p-3 text-sm font-medium">Title</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-right p-3 text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{new Date(txn.transaction_date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{txn.title}</td>
                      <td className="p-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          txn.type === "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>{txn.type}</span>
                      </td>
                      <td className={`p-3 text-sm text-right font-medium ${
                        txn.type === "CREDIT" ? "text-green-600" : "text-red-600"
                      }`}>
                        {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
