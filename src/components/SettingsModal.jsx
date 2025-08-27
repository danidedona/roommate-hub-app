// src/components/SettingsModal.jsx

import React from "react";
import Modal from "./Modal";
import { PlusIcon, TrashIcon } from "./Icons.jsx";

const SettingsModal = ({
  show,
  onClose,
  roommates,
  handleSignOut, // <-- added prop
  userEmail, // optional: show current signed-in email
}) => {
  return (
    <Modal show={show} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="space-y-6">
        {/* Show signed-in email */}
        {userEmail && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center">
            <span>Signed in as: {userEmail}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner">
          <h3 className="text-xl font-semibold mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">
            Manage Roommates
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4"></div>
          <ul className="space-y-2">
            {roommates.map((rm) => (
              <li
                key={rm.id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <span className="font-medium">{rm.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
