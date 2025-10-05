// React & React Router
import React, { useState, useEffect, useMemo } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// Icons
import { SettingsIcon } from "./components/Icons.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import ChoresPage from "./pages/ChoresPage.jsx";
import FridgePage from "./pages/FridgePage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";

// Components / Modals
import Navigation from "./components/Navigation.jsx";
import ExpenseModal from "./components/ExpenseModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

// Custom Hooks
import { useRoommates } from "./firebase/useRoommates.js";
import { useExpenses } from "./firebase/useExpenses.js";
import { useChores } from "./firebase/useChores.js";
import { useShoppingList } from "./firebase/useShoppingList.js";
import { usePayments } from "./firebase/usePayments.js";
import { useFridgeInventory } from "./firebase/useFridgeInventory.js";
import { useAuth } from "./firebase/useAuth.js";

// Utils
import { calculateNonRoommateBalances } from "./utils/calculateNonRoommateBalances.js";
import { openExpenseModal } from "./utils/expenseModalUtils.js";

// --- App Component ---
function App() {
  // Data state variables
  const { roommates, addRoommate, deleteRoommate } = useRoommates();
  const { payments, addPayment, deletePayment, updatePayment } = usePayments();
  const { expenses, expenseSummary, addOrUpdateExpense, deleteExpense } =
    useExpenses(roommates, payments);
  const {
    chores,
    addChore,
    toggleChoreStatus,
    assignChore,
    deleteChore,
    deleteCompletedChores,
  } = useChores();

  const {
    shoppingList,
    groupShoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem, // <-- add this
    deleteBoughtItems, // <-- add this
  } = useShoppingList();

  const {
    fridgeInventory,
    filteredFridgeInventory,
    newFridgeItem,
    setNewFridgeItem,
    addFridgeItem,
    updateFridgeItem,
    deleteFridgeItem,
    toggleFridgeOwner,
    fridgeFilter,
    toggleFilterOwner,
    toggleFilterType,
  } = useFridgeInventory();

  const nonRoommateBalances = useMemo(
    () => calculateNonRoommateBalances(payments, roommates),
    [payments, roommates]
  );

  // Form state variables
  const [newRoommateName, setNewRoommateName] = useState("");
  const [newChore, setNewChore] = useState("");
  const [newShoppingCategory, setNewShoppingCategory] = useState("");
  const [newShoppingItemName, setNewShoppingItemName] = useState("");
  const [newShoppingItemDueDate, setNewShoppingItemDueDate] = useState("");
  const [newPayment, setNewPayment] = useState({
    from: "",
    to: "",
    amount: "",
    date: "",
    notes: "",
  });
  const [newNonRoommate, setNewNonRoommate] = useState("");

  // Modal state for adding new expenses
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseSplitType, setExpenseSplitType] = useState("Equally");
  const [expenseItems, setExpenseItems] = useState([
    { name: "", cost: "", participants: [] },
  ]);
  const [percentages, setPercentages] = useState({});
  const [expenseModalErrors, setExpenseModalErrors] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [expenseDate, setExpenseDate] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseNotes, setExpenseNotes] = useState("");

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const { userId, userEmail, loading, handleGoogleSignIn, handleSignOut } =
    useAuth();

  const handleExpenseModalOpen = (expense = null) => {
    openExpenseModal({
      expense,
      setEditingExpenseId,
      setExpenseDescription,
      setExpensePaidBy,
      setExpenseSplitType,
      setExpenseItems,
      setPercentages,
      setSelectedParticipants,
      setExpenseDate,
      setExpenseModalErrors,
      setShowExpenseModal,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, show sign-in page
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl mb-4">Roommate Hub</h1>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 antialiased p-4 sm:p-8">
        <div className="max-w-6xl mx-auto rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
          <div>
            <header className="p-4 sm:p-6 bg-purple-600 text-white flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2 sm:mb-0">
                Roommate Hub
              </h1>
              <div className="flex items-center gap-4">
                {userId && (
                  <div className="text-sm opacity-80 hidden sm:block">
                    User:{" "}
                    <span className="font-mono break-all">
                      {roommates.find((r) => r.uid === userId)?.name ||
                        userEmail ||
                        userId}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-white hover:text-purple-200 transition-colors p-2 rounded-full"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-6 h-6" />
                </button>
              </div>
            </header>
            <Navigation />
            <main className="p-4 sm:p-8">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      expenseSummary={expenseSummary}
                      unpaidChoresCount={
                        chores.filter((c) => !c.isCompleted).length
                      }
                      shoppingListCount={
                        shoppingList.filter((s) => !s.isCompleted).length
                      }
                    />
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ExpensesPage
                      expenses={expenses}
                      expenseSummary={expenseSummary}
                      handleExpenseModalOpen={handleExpenseModalOpen}
                      deleteExpense={deleteExpense}
                      addOrUpdateExpense={addOrUpdateExpense}
                    />
                  }
                />
                <Route
                  path="/chores"
                  element={
                    <ChoresPage
                      chores={chores}
                      newChore={newChore}
                      setNewChore={setNewChore}
                      addChore={addChore}
                      toggleChoreStatus={toggleChoreStatus}
                      assignChore={assignChore}
                      deleteChore={deleteChore}
                      deleteCompletedChores={deleteCompletedChores}
                      roommates={roommates}
                    />
                  }
                />
                <Route
                  path="/shopping"
                  element={
                    <ShoppingListPage
                      shoppingList={shoppingList}
                      groupShoppingList={groupShoppingList}
                      newShoppingCategory={newShoppingCategory}
                      setNewShoppingCategory={setNewShoppingCategory}
                      newShoppingItemName={newShoppingItemName}
                      setNewShoppingItemName={setNewShoppingItemName}
                      newShoppingItemDueDate={newShoppingItemDueDate}
                      setNewShoppingItemDueDate={setNewShoppingItemDueDate}
                      addShoppingItem={addShoppingItem}
                      toggleShoppingItem={toggleShoppingItem}
                      deleteShoppingItem={deleteShoppingItem}
                      deleteBoughtItems={deleteBoughtItems}
                    />
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <PaymentsPage
                      payments={payments}
                      expenses={expenses}
                      newPayment={newPayment}
                      setNewPayment={setNewPayment}
                      addPayment={addPayment}
                      deletePayment={deletePayment}
                      updatePayment={updatePayment}
                      roommates={roommates}
                    />
                  }
                />
                <Route
                  path="/fridge"
                  element={
                    <FridgePage
                      fridgeInventory={fridgeInventory}
                      filteredFridgeInventory={filteredFridgeInventory}
                      newFridgeItem={newFridgeItem}
                      setNewFridgeItem={setNewFridgeItem}
                      addFridgeItem={addFridgeItem}
                      updateFridgeItem={updateFridgeItem}
                      deleteFridgeItem={deleteFridgeItem} // <-- added
                      toggleFridgeOwner={toggleFridgeOwner}
                      fridgeFilter={fridgeFilter}
                      toggleFilterOwner={toggleFilterOwner} // <-- updated
                      toggleFilterType={toggleFilterType} // <-- updated
                      roommates={roommates}
                    />
                  }
                />
              </Routes>
            </main>
          </div>
          <ExpenseModal
            show={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            editingExpenseId={editingExpenseId}
            roommates={roommates}
            addExpense={addOrUpdateExpense}
            expensePaidBy={expensePaidBy}
            setExpensePaidBy={setExpensePaidBy}
            expenseSplitType={expenseSplitType}
            setExpenseSplitType={setExpenseSplitType}
            expenseDate={expenseDate}
            setExpenseDate={setExpenseDate}
            expenseDescription={expenseDescription}
            setExpenseDescription={setExpenseDescription}
            expenseItems={expenseItems}
            setExpenseItems={setExpenseItems}
            percentages={percentages}
            setPercentages={setPercentages}
            selectedParticipants={selectedParticipants}
            setSelectedParticipants={setSelectedParticipants}
            newNonRoommate={newNonRoommate}
            setNewNonRoommate={setNewNonRoommate}
            expenseModalErrors={expenseModalErrors}
            setExpenseModalErrors={setExpenseModalErrors}
            expenseNotes={expenseNotes}
            setExpenseNotes={setExpenseNotes}
          />
          <SettingsModal
            show={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            roommates={roommates}
            handleSignOut={handleSignOut} // pass hook function
            userEmail={userEmail} // pass current email
          />
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
