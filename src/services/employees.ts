import type { EmployeeSuggestion } from "../types/project";
import { axiosInstance } from "./api";

export const getEmployeeSuggestions = async (
    keyword?: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> => {
    const response = await axiosInstance.get<EmployeeSuggestion[]>('/employees/suggestions', {
        params: keyword ? { keyword } : undefined,
        signal,
    });
    return response.data;
}
