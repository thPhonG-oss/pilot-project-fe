import axios from "axios";
import { LANGUAGE_STORAGE_KEY } from "../i18n";

const baseURL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers.set(
    "Accept-Language",
    localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "en",
  );
  return config;
});
