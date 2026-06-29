import { axiosInstance } from "./api";

import type {
  PageResponse,
  Project,
  ProjectCreationRequest,
  ProjectDeleteRequest,
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
        leaderVisa: params.leaderVisa,
        memberVisa: params.memberVisa,
        startDateFrom: params.startDateFrom,
        startDateTo: params.startDateTo,
        endDateFrom: params.endDateFrom,
        endDateTo: params.endDateTo,
        page: params.page,
        size: params.size,
        sortBy: params.sortBy,
        asc: params.asc,
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

export const deleteProject = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/projects/${id}`);
};

export const deleteProjects = async (ids: number[]): Promise<void> => {
  const payload: ProjectDeleteRequest = { ids };
  await axiosInstance.delete("/projects", { data: payload });
};
