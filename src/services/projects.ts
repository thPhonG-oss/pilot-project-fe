import { axiosInstance } from "./api";

import type {
    PageResponse,
    Project,
    ProjectSearchParams,
} from "../types/project";

export const getAllProjects = async (): Promise<PageResponse<Project>> => {
    const response = await axiosInstance.get<PageResponse<Project>>("/projects");
    return response.data;
}

export const searchProjects = async (params: ProjectSearchParams): Promise<PageResponse<Project>> => {
    const response = await axiosInstance.get<PageResponse<Project>>("/projects/search", {
        params: {
            keyword: params.keyword,
            status: params.status,
            page: params.page,
            size: params.size,
        },
     });
    return response.data;
}

export const getProjectById = async (id: number): Promise<Project> => {
    const response = await axiosInstance.get<Project>(`/projects/${id}`);
    return response.data;
}
