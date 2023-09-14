import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHTML(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function newlineToBreak(str) {
  return escapeHTML(str).replace(/\n/g, "<br/>");
}

export function debounce(func, wait) {
  let timeout;

  function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }

  executedFunction.cancel = function () {
    clearTimeout(timeout);
  };

  return executedFunction;
}
