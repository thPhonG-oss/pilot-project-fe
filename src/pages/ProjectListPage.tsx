import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "../components/Pagination";
import { ProjectFilter } from "../components/ProjectFilter";
import { ProjectsTable } from "../components/ProjectsTable";
import { PROJECT_PAGE_SIZE } from "../constant/project";
import { isCancelledRequest, resolveApiErrorMessage } from "../services/apiError";
import { searchProjects } from "../services/projects";
import type { Project, ProjectFilters as ProjectFiltersValue, ProjectStatus } from "../types/project";

const EMPTY_FILTERS: ProjectFiltersValue = {
  keyword: '',
  status: '',
}

export function ProjectListPage() {

    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState<ProjectFiltersValue>(() => readFilters(searchParams))
    const appliedFilters = useMemo(() => readFilters(searchParams), [searchParams])
    const page = Number(searchParams.get('page') ?? '1') || 1

    useEffect(() => {
      setFilters(readFilters(searchParams))
    }, [searchParams])

    useEffect(() => {
      const controller = new AbortController()

      async function loadProjects() {
        setIsLoading(true)
        setErrorMessage('')

        try {
          const response = await searchProjects({
            keyword: appliedFilters.keyword.trim(),
            status: appliedFilters.status || undefined,
            page,
            size: PROJECT_PAGE_SIZE,
          }, controller.signal)

          setProjects(response.data ?? [])
          setTotalPages(Math.max(response.totalPages, 1))
        } catch (error) {
          if (isCancelledRequest(error)) {
            return
          }

          setProjects([])
          setTotalPages(1)
          setErrorMessage(resolveApiErrorMessage(error))
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false)
          }
        }
      }

      void loadProjects()

      return () => {
        controller.abort()
      }
    }, [appliedFilters, page])

    function handleSearch() {
      if (isLoading) {
        return
      }

      const nextFilters = { ...filters, keyword: filters.keyword.trim() }
      const nextParams = buildSearchParams(nextFilters, 1)

      if (areSearchParamsEqual(searchParams, nextParams)) {
        return
      }

      setSearchParams(nextParams)
    }

    function handleReset() {
      if (isLoading) {
        return
      }

      if (areSearchParamsEqual(searchParams, new URLSearchParams())) {
        setFilters(EMPTY_FILTERS)
        return
      }

      setFilters(EMPTY_FILTERS)
      setSearchParams({})
    }

    function handlePageChange(nextPage: number) {
      if (isLoading || nextPage === page) {
        return
      }

      setSearchParams(buildSearchParams(appliedFilters, nextPage))
    }


    return (
    <main className="max-w-[1010px] px-5 py-8 lg:ml-10 lg:px-0">
      <div className="mb-4 border-b border-slate-300">
        <h1 className="mb-3 text-base font-semibold text-slate-500">{t('project.listTitle')}</h1>
      </div>

      <ProjectFilter
      value={filters}
      isLoading={isLoading}
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
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            disabled={isLoading}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  )
}

function readFilters(searchParams: URLSearchParams): ProjectFiltersValue {
  const status = searchParams.get('status')

  return {
    keyword: searchParams.get('keyword') ?? '',
    status: isProjectStatus(status) ? status : '',
  }
}

function buildSearchParams(filters: ProjectFiltersValue, page: number) {
  const params = new URLSearchParams()

  if (filters.keyword) {
    params.set('keyword', filters.keyword)
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  return params
}

function areSearchParamsEqual(current: URLSearchParams, next: URLSearchParams) {
  return current.toString() === next.toString()
}

function isProjectStatus(value: string | null): value is ProjectStatus {
  return value === 'NEW' || value === 'PLA' || value === 'INP' || value === 'FIN'
}
