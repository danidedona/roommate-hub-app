import React, { useState } from "react";
import { PlusIcon, CheckIcon, TrashIcon } from "../components/Icons.jsx";

const ChoresPage = ({
  chores,
  newChore,
  setNewChore,
  addChore,
  roommates,
  toggleChoreStatus,
  assignChore,
  deleteChore,
  deleteCompletedChores,
}) => {
  const [newDueDate, setNewDueDate] = useState("");

  const toggleAssignee = (chore, name) => {
    const newAssigned = chore.assignedTo.includes(name)
      ? chore.assignedTo.filter((n) => n !== name)
      : [...chore.assignedTo, name];
    assignChore(chore.id, newAssigned);
  };

  const handleAddChore = () => {
    addChore(newChore, [], newDueDate);
    setNewChore("");
    setNewDueDate("");
  };

  const completedExists = chores.some((chore) => chore.isCompleted);

  return (
    <section className="flex flex-col gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Chore Tracker</h2>

        {/* Add New Chore */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Add a New Chore</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g., Take out the trash"
                value={newChore}
                onChange={(e) => setNewChore(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChore()}
                className="flex-grow p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddChore()}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              />
              <button
                onClick={handleAddChore}
                className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Chores */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Current Chores</h3>
            {completedExists && (
              <button
                onClick={deleteCompletedChores}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Delete All Completed
              </button>
            )}
          </div>

          <ul className="space-y-3">
            {chores.length > 0 ? (
              chores.map((chore) => (
                <li
                  key={chore.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-grow">
                    <div
                      className={`font-bold text-lg ${
                        chore.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {chore.name}
                    </div>
                    {chore.dueDate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        Due: {new Date(chore.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Assigned To Multi-select */}
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    {roommates.map((rm) => (
                      <button
                        key={rm.id}
                        onClick={() => toggleAssignee(chore, rm.name)}
                        className={`py-1 px-3 rounded-full text-sm font-medium transition-colors ${
                          chore.assignedTo.includes(rm.name)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {rm.name}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() =>
                        toggleChoreStatus(chore.id, chore.isCompleted)
                      }
                      className={`p-2 rounded-full transition-colors ${
                        chore.isCompleted
                          ? "bg-green-200 hover:bg-green-300"
                          : "bg-purple-200 hover:bg-purple-300"
                      }`}
                    >
                      <CheckIcon
                        className={`w-5 h-5 ${
                          chore.isCompleted
                            ? "text-green-600"
                            : "text-purple-600"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteChore(chore.id)}
                      className="p-2 rounded-full bg-red-200 hover:bg-red-300"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No chores added yet.
              </p>
            )}
          </ul>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg flex flex-col justify-center items-center h-[500px]">
        <h3 className="text-lg font-semibold mb-2">Shared Chore Schedule</h3>
        <iframe
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSIzz-KiLrR6s_8TUsdQ1CIvJAq4X9BCiRofNzWpFsZGGADCUH4lyvBQUuy6gW7NRp_4tdlCJafj7W_/pubhtml"
          width="100%"
          height="400"
          frameBorder="0"
          className="rounded-lg shadow-md"
        ></iframe>
        <a
          href="https://docs.google.com/spreadsheets/d/1ixEHt7EBscO_HCn8pGykNjgIiD6inMrf70Z-bkk0HZM/edit?gid=1644513197#gid=1644513197"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Open Full Sheet
        </a>
      </div>
    </section>
  );
};

export default ChoresPage;
