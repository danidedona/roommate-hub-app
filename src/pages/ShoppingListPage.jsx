import React from "react";
import { CheckIcon } from "../components/Icons.jsx";

const ShoppingListPage = ({
  shoppingList,
  newShoppingItemName,
  setNewShoppingItemName,
  newShoppingItemDueDate,
  setNewShoppingItemDueDate,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  deleteBoughtItems,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Shared Shopping List</h2>

      {/* Add Item */}
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Add a New Item</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Item name (e.g., 'Tortillas')"
            value={newShoppingItemName}
            onChange={(e) => setNewShoppingItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addShoppingItem(newShoppingItemName, newShoppingItemDueDate);
                setNewShoppingItemName("");
                setNewShoppingItemDueDate("");
                setNewShoppingCategory(""); // optional
              }
            }}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            value={newShoppingItemDueDate}
            onChange={(e) => setNewShoppingItemDueDate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addShoppingItem(newShoppingItemName, newShoppingItemDueDate);
                setNewShoppingItemName("");
                setNewShoppingItemDueDate("");
                setNewShoppingCategory(""); // optional
              }
            }}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={() => {
            addShoppingItem(newShoppingItemName, newShoppingItemDueDate);
            // reset inputs
            setNewShoppingItemName("");
            setNewShoppingItemDueDate("");
            setNewShoppingCategory(""); // optional if you want to reset category too
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addShoppingItem(newShoppingItemName, newShoppingItemDueDate);
              setNewShoppingItemName("");
              setNewShoppingItemDueDate("");
              setNewShoppingCategory("");
            }
          }}
          className="mt-4 w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md"
        >
          Add Item
        </button>

        {shoppingList.some((item) => item.isCompleted) && (
          <button
            onClick={deleteBoughtItems}
            className="mt-2 w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
          >
            Delete All Bought Items
          </button>
        )}
      </div>

      {/* Items */}
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Items to Buy</h3>
        {shoppingList.length > 0 ? (
          <ul className="space-y-3">
            {shoppingList.map((item) => (
              <li
                key={item.id}
                className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                  item.isCompleted
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleShoppingItem(item.id, item.isCompleted)
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                      item.isCompleted
                        ? "border-green-500 bg-green-500"
                        : "border-gray-400"
                    }`}
                  >
                    {item.isCompleted && (
                      <CheckIcon className="w-full h-full text-white" />
                    )}
                  </button>
                  <div
                    className={`font-medium ${
                      item.isCompleted
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : ""
                    }`}
                  >
                    {item.name}
                    {item.dueDate && (
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteShoppingItem(item.id)}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            The list is empty!
          </p>
        )}
      </div>
    </section>
  );
};

export default ShoppingListPage;
