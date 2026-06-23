import { axiosInstance } from "./api";

import type {
    PageResponse,
    Project,
    ProjectSearchParams,
} from "../types/project";

export const searchProjects = async (
    params: ProjectSearchParams,
    signal?: AbortSignal,
): Promise<PageResponse<Project>> => {
    const response = await axiosInstance.get<PageResponse<Project>>("/projects/search", {
        params: {
            keyword: params.keyword,
            status: params.status,
            page: params.page,
            size: params.size,
        },
        signal,
     });
    return response.data;
}

export const getProjectById = async (id: number): Promise<Project> => {
    const response = await axiosInstance.get<Project>(`/projects/${id}`);
    return response.data;
}

