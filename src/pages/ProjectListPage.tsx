import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Pagination } from "../components/Pagination";
import { ProjectFilter } from "../components/ProjectFilter";
import { ProjectsTable } from "../components/ProjectsTable";
import { PROJECT_PAGE_SIZE, DEFAULT_PROJECT_SORT, isProjectSortField, type ProjectSort, type ProjectSortField } from "../constant/project";
import {
  isCancelledRequest,
  resolveApiErrorMessage,
  resolveDeleteErrorMessage,
} from "../services/apiError";
import {
  deleteProject,
  deleteProjects,
  searchProjects,
} from "../services/projects";
import type {
  Project,
  ProjectFilters as ProjectFiltersValue,
  ProjectStatus,
} from "../types/project";

const EMPTY_FILTERS: ProjectFiltersValue = {
  keyword: "",
  status: "",
};

type PendingDelete =
  | { type: "single"; project: Project }
  | { type: "bulk"; projects: Project[] };

export function ProjectListPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProjectFiltersValue>(() =>
    readFilters(searchParams),
  );
  const appliedFilters = useMemo(
    () => readFilters(searchParams),
    [searchParams],
  );
  const appliedSort = useMemo(() => readSort(searchParams), [searchParams]);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await searchProjects(
          {
            keyword: appliedFilters.keyword.trim(),
            status: appliedFilters.status || undefined,
            page,
            size: PROJECT_PAGE_SIZE,
            sortBy: appliedSort.sortBy,
            asc: appliedSort.asc,
          },
          controller.signal,
        );

        const nextProjects = response.data ?? [];
        const nextTotalPages = Math.max(response.totalPages, 1);

        if (nextProjects.length === 0 && page > 1 && nextTotalPages < page) {
          setSearchParams(buildSearchParams(appliedFilters, page - 1, appliedSort));
          return;
        }

        setProjects(nextProjects);
        setTotalPages(nextTotalPages);
      } catch (error) {
        if (isCancelledRequest(error)) {
          return;
        }

        setProjects([]);
        setTotalPages(1);
        setErrorMessage(resolveApiErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      controller.abort();
    };
  }, [appliedFilters, appliedSort, page, refreshToken, setSearchParams]);

  const refetchProjects = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  function handleSearch() {
    if (isLoading) {
      return;
    }

    const nextFilters = { ...filters, keyword: filters.keyword.trim() };
    const nextParams = buildSearchParams(nextFilters, 1, appliedSort);

    if (areSearchParamsEqual(searchParams, nextParams)) {
      refetchProjects();
      return;
    }

    setSearchParams(nextParams);
  }

  function handleReset() {
    if (isLoading) {
      return;
    }

    if (areSearchParamsEqual(searchParams, new URLSearchParams())) {
      setFilters(EMPTY_FILTERS);
      refetchProjects();
      return;
    }

    setFilters(EMPTY_FILTERS);
    setSearchParams({});
  }

  function handlePageChange(nextPage: number) {
    if (isLoading || nextPage === page) {
      return;
    }

    setSearchParams(buildSearchParams(appliedFilters, nextPage, appliedSort));
  }

  function handleSortChange(field: ProjectSortField) {
    if (isLoading || isDeleting) {
      return;
    }

    const nextSort: ProjectSort = {
      sortBy: field,
      asc: appliedSort.sortBy === field ? !appliedSort.asc : true,
    };
    const nextParams = buildSearchParams(appliedFilters, 1, nextSort);

    if (areSearchParamsEqual(searchParams, nextParams)) {
      refetchProjects();
      return;
    }

    setSearchParams(nextParams);
  }

  function handleRequestDeleteProject(project: Project) {
    setPendingDelete({ type: "single", project });
  }

  function handleRequestBulkDelete(selectedProjects: Project[]) {
    setPendingDelete({ type: "bulk", projects: selectedProjects });
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      if (pendingDelete.type === "single") {
        await deleteProject(pendingDelete.project.id);
        toast.success(
          t("delete.successSingle", {
            projectNumber: pendingDelete.project.projectNumber,
          }),
        );
      } else {
        const ids = pendingDelete.projects.map((project) => project.id);
        await deleteProjects(ids);
        toast.success(
          t("delete.successBulk", {
            count: pendingDelete.projects.length,
          }),
        );
      }

      setPendingDelete(null);
      refetchProjects();
    } catch (error) {
      if (isCancelledRequest(error)) {
        return;
      }

      const message = resolveDeleteErrorMessage(error);

      if (message) {
        toast.error(message);
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const confirmDialog = pendingDelete
    ? pendingDelete.type === "single"
      ? {
          title: t("delete.confirmTitle"),
          message: t("delete.confirmSingle", {
            projectNumber: pendingDelete.project.projectNumber,
          }),
        }
      : {
          title: t("delete.confirmTitle"),
          message: t("delete.confirmBulk", {
            count: pendingDelete.projects.length,
          }),
        }
    : null;

  return (
    <main className="max-w-[90%] px-5 py-8 lg:ml-10 lg:px-0">
      <div className="mb-4 border-b border-slate-300">
        <h1 className="mb-3 text-base font-semibold text-slate-500">
          {t("project.listTitle")}
        </h1>
      </div>

      <ProjectFilter
        value={filters}
        isLoading={isLoading || isDeleting}
        onChange={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {errorMessage && (
        <div className="mb-4 whitespace-pre-line rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {!errorMessage && (
        <>
          <ProjectsTable
            projects={projects}
            isLoading={isLoading}
            isDeleting={isDeleting}
            sortBy={appliedSort.sortBy}
            sortAsc={appliedSort.asc}
            onSortChange={handleSortChange}
            getEditPath={(project) =>
              `/projects/${project.id}/edit?returnTo=${encodeURIComponent(returnTo)}`
            }
            onRequestDeleteProject={handleRequestDeleteProject}
            onRequestBulkDelete={handleRequestBulkDelete}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading || isDeleting}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete != null}
        title={confirmDialog?.title ?? ""}
        message={confirmDialog?.message ?? ""}
        confirmLabel={t("delete.confirmButton")}
        isConfirming={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setPendingDelete(null);
          }
        }}
      />
    </main>
  );
}

function readFilters(searchParams: URLSearchParams): ProjectFiltersValue {
  const status = searchParams.get("status");

  return {
    keyword: searchParams.get("keyword") ?? "",
    status: isProjectStatus(status) ? status : "",
  };
}

function readSort(searchParams: URLSearchParams): ProjectSort {
  const sortBy = searchParams.get("sortBy");
  const ascParam = searchParams.get("asc");

  if (isProjectSortField(sortBy)) {
    return {
      sortBy,
      asc: ascParam !== "false",
    };
  }

  return DEFAULT_PROJECT_SORT;
}

function buildSearchParams(
  filters: ProjectFiltersValue,
  page: number,
  sort: ProjectSort = DEFAULT_PROJECT_SORT,
) {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (
    sort.sortBy !== DEFAULT_PROJECT_SORT.sortBy ||
    sort.asc !== DEFAULT_PROJECT_SORT.asc
  ) {
    params.set("sortBy", sort.sortBy);
    params.set("asc", String(sort.asc));
  }

  return params;
}

function areSearchParamsEqual(current: URLSearchParams, next: URLSearchParams) {
  return current.toString() === next.toString();
}

function isProjectStatus(value: string | null): value is ProjectStatus {
  return (
    value === "NEW" || value === "PLA" || value === "INP" || value === "FIN"
  );
}
