import { axiosInstance } from "./api";

import type {
  PageResponse,
  Project,
  ProjectCreationRequest,
  ProjectSearchParams,
  ProjectUpdateRequest,
} from "../types/project";

export const searchProjects = async (
  params: ProjectSearchParams,
  signal?: AbortSignal,
): Promise<PageResponse<Project>> => {
  const response = await axiosInstance.get<PageResponse<Project>>(
    "/projects/search",
    {
      params: {
        keyword: params.keyword,
        status: params.status,
        page: params.page,
        size: params.size,
      },
      signal,
    },
  );
  return response.data;
};

export const getProjectById = async (
  id: number,
  signal?: AbortSignal,
): Promise<Project> => {
  const response = await axiosInstance.get<Project>(`/projects/${id}`, {
    signal,
  });
  return response.data;
};

export const createProject = async (
  payload: ProjectCreationRequest,
): Promise<Project> => {
  const response = await axiosInstance.post<Project>("/projects", payload);
  return response.data;
};

export const updateProject = async (
  id: number,
  payload: ProjectUpdateRequest,
): Promise<Project> => {
  const response = await axiosInstance.put<Project>(`/projects/${id}`, payload);
  return response.data;
};
