import React, { useState } from "react";
import {
  PlusCircle,
  FileUp,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BudgetDashboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState("3000");
  const [tempCategories, setTempCategories] = useState([
    { name: "Food & Dining", limit: 500 },
    { name: "Transportation", limit: 300 },
    { name: "Entertainment", limit: 200 },
    { name: "Utilities", limit: 250 },
    { name: "Shopping", limit: 400 },
  ]);

  const [state, setState] = useState({
    user_id: "alexa",
    budget: 4000,
    spent: 850,
    transactions: [
      {
        name: "Grocery Store",
        amount: 85.5,
        date: "2025-09-12",
        category: "Food & Dining",
      },
      {
        name: "Gas Station",
        amount: 45.0,
        date: "2025-09-11",
        category: "Transportation",
      },
      {
        name: "Movie Tickets",
        amount: 28.0,
        date: "2025-09-10",
        category: "Entertainment",
      },
    ],

    newExpense: { name: "", info: {} },
    receipt: "",
    categories: [
      { name: "Food & Dining", limit: 500, spent: 285.5 },
      { name: "Transportation", limit: 300, spent: 145.0 },
      { name: "Entertainment", limit: 200, spent: 28.0 },
      { name: "Utilities", limit: 250, spent: 125.0 },
      { name: "Shopping", limit: 400, spent: 266.5 },
    ],
  });

  const remaining = state.budget - state.spent;
  const avgDaily = state.spent > 0 ? (state.spent / 30).toFixed(2) : 0;
  const daysLeft = 16;

  const sendStateToBackend = async (updatedState) => {
    try {
      console.log("current state: ", updatedState);
      const response = await fetch("/api/update-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: updatedState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send data to backend");
      }

      const data = await response.json();
      console.log("Backend response:", data);
      setState(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        sendStateToBackend({ ...state, receipt: base64Image });
      };
      reader.readAsDataURL(file);
    }
  };

  const openSettings = () => {
    setTempBudget(state.budget.toString());
    setTempCategories([...state.categories]);
    setSettingsOpen(true);
  };

  const addNewCategory = () => {
    setTempCategories([...tempCategories, { name: "", limit: 0 }]);
  };

  const updateCategory = (index, field, value) => {
    const updated = [...tempCategories];
    if (field === "limit") {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setTempCategories(updated);
  };

  const removeCategory = (index) => {
    setTempCategories(tempCategories.filter((_, i) => i !== index));
  };

  const saveSettings = () => {
    const validCategories = tempCategories.filter(
      (cat) => cat.name.trim() !== ""
    );
    const updatedState = {
      ...state,
      budget: parseFloat(tempBudget) || 0,
      categories: validCategories.map((cat) => ({
        ...cat,
        spent:
          state.categories.find((existing) => existing.name === cat.name)
            ?.spent || 0,
      })),
    };

    setState(updatedState);
    sendStateToBackend(updatedState);
    setSettingsOpen(false);
  };

  const getCategorySpentPercentage = (category) => {
    return category.limit > 0 ? (category.spent / category.limit) * 100 : 0;
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded">
              <span className="text-white font-bold">B</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">Budget Tracker</h1>
              <p className="text-sm text-gray-500">
                Stay on top of your finances
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Good morning,</p>
            <p className="font-semibold">Alex Johnson</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Monthly Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Monthly Budget</span>
              <span className="text-green-600 text-xl font-bold">
                ${remaining.toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Spent: ${state.spent}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (state.spent / state.budget) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Avg. Daily</p>
                <p className="text-lg font-semibold">${avgDaily}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Left</p>
                <p className="text-lg font-semibold">{daysLeft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="h-4 w-4" /> Upload Receipt
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleReceiptUpload}
          />
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <PlusCircle className="h-4 w-4" /> Add Expense
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <BarChart3 className="h-4 w-4" /> Analytics
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={openSettings}
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>

        {state.receipt && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Uploaded Receipt:</p>
            <img
              src={state.receipt}
              alt="Receipt Preview"
              className="mt-2 max-h-40 rounded shadow"
            />
          </div>
        )}

        {/* Spending Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.categories.map((cat, index) => {
            const percentage = getCategorySpentPercentage(cat);
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">{cat.name}</p>
                    <span className="text-sm text-gray-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    ${cat.spent?.toFixed(2) || 0} of ${cat.limit}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
                        percentage
                      )}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Recent Transactions</span>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.transactions.length === 0 ? (
              <p className="text-gray-500">
                No transactions yet. Add your first transaction to get started!
              </p>
            ) : (
              <ul className="space-y-3">
                {state.transactions.map((tx, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <span className="font-medium">{tx.name}</span>
                      <p className="text-sm text-gray-500">
                        {tx.category} • {tx.date}
                      </p>
                    </div>
                    <span className="font-medium text-red-600">
                      -${tx.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold">Budget Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Total Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Budget
                </label>
                <Input
                  type="number"
                  placeholder="Enter your monthly budget"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Budget Categories</h3>
                  <Button
                    onClick={addNewCategory}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Category
                  </Button>
                </div>

                <div className="space-y-3">
                  {tempCategories.map((category, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) =>
                          updateCategory(index, "name", e.target.value)
                        }
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <Input
                          type="number"
                          placeholder="Budget"
                          value={category.limit || ""}
                          onChange={(e) =>
                            updateCategory(index, "limit", e.target.value)
                          }
                          className="w-24"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveSettings}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;