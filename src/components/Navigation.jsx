import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  DollarSignIcon,
  DollarSignIconSmall,
  ListTodoIcon,
  ShoppingBagIcon,
  RefrigeratorIcon,
} from "./Icons.jsx";

const Navigation = () => {
  const location = useLocation(); // Get the current URL location

  // Determine the active path based on the current URL
  const getPath = (tabName) => {
    switch (tabName) {
      case "home":
        return "/";
      case "expenses":
        return "/expenses";
      case "payments":
        return "/payments";
      case "chores":
        return "/chores";
      case "shopping":
        return "/shopping";
      case "fridge":
        return "/fridge";
      default:
        return "/";
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex bg-gray-200 dark:bg-gray-700 p-2 overflow-x-auto">
      <Link
        to={getPath("home")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <HomeIcon className="w-5 h-5 mr-2" />
        Home
      </Link>
      <Link
        to={getPath("expenses")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/expenses")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <DollarSignIcon className="w-5 h-5 mr-2" />
        Expenses
      </Link>
      <Link
        to={getPath("payments")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/payments")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <DollarSignIconSmall className="w-5 h-5 mr-2" />
        Payments
      </Link>
      <Link
        to={getPath("chores")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/chores")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <ListTodoIcon className="w-5 h-5 mr-2" />
        Chores
      </Link>
      <Link
        to={getPath("shopping")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/shopping")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <ShoppingBagIcon className="w-5 h-5 mr-2" />
        Shopping List
      </Link>
      <Link
        to={getPath("fridge")}
        className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive("/fridge")
            ? "bg-purple-500 text-white shadow-lg"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <RefrigeratorIcon className="w-5 h-5 mr-2" />
        Fridge
      </Link>
    </div>
  );
};

export default Navigation;
