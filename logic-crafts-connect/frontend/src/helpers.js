// src/utils/helpers.js

export const formatPrice = (price) => {
  return `₹${Number(price).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN");
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
};

export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};