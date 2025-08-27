import React from "react";

import {
  ShoppingBagIcon,
  DollarSignIcon,
  ListTodoIcon,
} from "../components/Icons.jsx";

const HomePage = ({ expenseSummary, unpaidChoresCount, shoppingListCount }) => {
  // Replace the custom calendar with an iframe embed
  // Get the embed link from your Google Calendar -> Settings -> Integrate Calendar -> Embed code
  // Make sure the calendar is shared with all house members
  const calendarEmbedSrc =
    "https://calendar.google.com/calendar/embed?src=your_calendar_id%40group.calendar.google.com&ctz=America%2FNew_York"; // <- replace with your calendar ID

  // Compute total outstanding balances (absolute values)
  const totalBalances = expenseSummary?.transactions
    ? expenseSummary.transactions.reduce((sum, t) => sum + t.amount, 0)
    : 0;

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Expenses
            </div>
            <div className="text-3xl font-bold mt-1">
              ${totalBalances.toFixed(2)}
            </div>
          </div>
          <DollarSignIcon className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-70" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Chores to Do
            </div>
            <div className="text-3xl font-bold mt-1">{unpaidChoresCount}</div>
          </div>
          <ListTodoIcon className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-70" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shopping Items
            </div>
            <div className="text-3xl font-bold mt-1">{shoppingListCount}</div>
          </div>
          <ShoppingBagIcon className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-70" />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">House Calendar</h3>
        <div className="aspect-video">
          <iframe
            src={calendarEmbedSrc}
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
            title="House Calendar"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
