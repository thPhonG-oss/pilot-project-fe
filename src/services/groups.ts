import type { GroupOption } from "../types/project";
import { axiosInstance } from "./api";

export const getGroups = async (signal?: AbortSignal): Promise<GroupOption[]> => {
    const response = await axiosInstance.get<GroupOption[]>('/groups', { signal });
    return response.data;
}
