// src/utils/constants.js

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const USER_ROLES = {
  ADMIN: "admin",
  ARTISAN: "artisan",
  BUYER: "buyer",
};

export const ORDER_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const CRAFT_CATEGORIES = [
  "Pottery",
  "Woodwork",
  "Textiles",
  "Jewelry",
  "Metalwork",
  "Basketry",
  "Other",
];