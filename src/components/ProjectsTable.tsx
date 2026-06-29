import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { ProjectSortField } from "../constant/project";
import type { Project } from "../types/project";
import { formatProjectDate } from "../utils/dateUtils";

type ProjectsTableProps = {
  projects: Project[];
  isLoading: boolean;
  isDeleting?: boolean;
  sortBy: ProjectSortField;
  sortAsc: boolean;
  onSortChange: (field: ProjectSortField) => void;
  getEditPath: (project: Project) => string;
  onRequestDeleteProject: (project: Project) => void;
  onRequestBulkDelete: (projects: Project[]) => void;
};

export function ProjectsTable({
  projects,
  isLoading,
  isDeleting = false,
  sortBy,
  sortAsc,
  onSortChange,
  getEditPath,
  onRequestDeleteProject,
  onRequestBulkDelete,
}: ProjectsTableProps) {
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(
    new Set(),
  );
  const selectAllRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const visibleProjectIds = useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );
  const selectedCount = selectedProjectIds.size;
  const selectedProjects = useMemo(
    () => projects.filter((project) => selectedProjectIds.has(project.id)),
    [projects, selectedProjectIds],
  );
  const canBulkDelete =
    selectedCount > 0 &&
    selectedProjects.every((project) => project.status === "NEW");
  const blockedBulkNumbers = useMemo(
    () =>
      selectedProjects
        .filter((project) => project.status !== "NEW")
        .map((project) => project.projectNumber)
        .join(", "),
    [selectedProjects],
  );
  const hasBlockedBulkSelection =
    selectedCount > 0 && blockedBulkNumbers.length > 0;
  const allVisibleSelected =
    visibleProjectIds.length > 0 &&
    visibleProjectIds.every((projectId) => selectedProjectIds.has(projectId));
  const someVisibleSelected = visibleProjectIds.some((projectId) =>
    selectedProjectIds.has(projectId),
  );
  const isSelectAllIndeterminate = someVisibleSelected && !allVisibleSelected;

  useEffect(() => {
    setSelectedProjectIds(new Set());
  }, [projects]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSelectAllIndeterminate;
    }
  }, [isSelectAllIndeterminate]);

  const handleSelectProject = (projectId: number, checked: boolean) => {
    setSelectedProjectIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(projectId);
      } else {
        next.delete(projectId);
      }

      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedProjectIds((current) => {
      const next = new Set(current);

      for (const projectId of visibleProjectIds) {
        if (checked) {
          next.add(projectId);
        } else {
          next.delete(projectId);
        }
      }

      return next;
    });
  };

  return (
    <section className="min-h-72" aria-label={t("project.projectsTable")}>
      <table className="w-full border-collapse border border-slate-300 bg-white text-left text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="h-8 w-9 border-b border-r border-slate-200 px-2 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                aria-label={t("table.selectAll")}
                checked={allVisibleSelected}
                disabled={isLoading || isDeleting || projects.length === 0}
                onChange={(event) => handleSelectAll(event.target.checked)}
              />
            </th>
            <SortableColumnHeader
              label={t("table.number")}
              field="projectNumber"
              sortBy={sortBy}
              sortAsc={sortAsc}
              disabled={isLoading || isDeleting}
              className="h-8 w-20 border-b border-r border-slate-200 px-3 font-semibold"
              onSortChange={onSortChange}
            />
            <SortableColumnHeader
              label={t("table.name")}
              field="name"
              sortBy={sortBy}
              sortAsc={sortAsc}
              disabled={isLoading || isDeleting}
              className="h-8 border-b border-r border-slate-200 px-4 font-semibold"
              onSortChange={onSortChange}
            />
            <SortableColumnHeader
              label={t("table.status")}
              field="status"
              sortBy={sortBy}
              sortAsc={sortAsc}
              disabled={isLoading || isDeleting}
              className="h-8 w-32 border-b border-r border-slate-200 px-4 font-semibold"
              onSortChange={onSortChange}
            />
            <SortableColumnHeader
              label={t("table.customer")}
              field="customer"
              sortBy={sortBy}
              sortAsc={sortAsc}
              disabled={isLoading || isDeleting}
              className="h-8 w-56 border-b border-r border-slate-200 px-4 font-semibold"
              onSortChange={onSortChange}
            />
            <SortableColumnHeader
              label={t("table.startDate")}
              field="startDate"
              sortBy={sortBy}
              sortAsc={sortAsc}
              disabled={isLoading || isDeleting}
              className="h-8 w-28 border-b border-r border-slate-200 px-4 font-semibold"
              onSortChange={onSortChange}
            />
            <th className="h-8 w-16 border-b border-slate-200 px-3 text-center font-semibold">
              {t("table.delete")}
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7} className="h-32 text-center text-slate-400">
                {t("project.loadingProjects")}
              </td>
            </tr>
          )}

          {!isLoading && projects.length === 0 && (
            <tr>
              <td colSpan={7} className="h-32 text-center text-slate-400">
                {t("project.noProjects")}
              </td>
            </tr>
          )}

          {!isLoading &&
            projects.map((project) => (
              <tr key={project.id} className="text-slate-600">
                <td className="h-10 border-r border-t border-slate-200 px-2 text-center">
                  <input
                    type="checkbox"
                    aria-label={t("table.selectProject", {
                      projectNumber: project.projectNumber,
                    })}
                    checked={selectedProjectIds.has(project.id)}
                    disabled={isDeleting}
                    onChange={(event) =>
                      handleSelectProject(project.id, event.target.checked)
                    }
                  />
                </td>
                <td className="h-10 border-r border-t border-slate-200 px-3 text-right">
                  <Link
                    className="font-semibold text-sky-700 no-underline hover:underline"
                    to={getEditPath(project)}
                  >
                    {project.projectNumber}
                  </Link>
                </td>
                <td className="h-10 border-r border-t border-slate-200 px-4">
                  {project.name}
                </td>
                <td className="h-10 border-r border-t border-slate-200 px-4">
                  {t(`status.${project.status}`)}
                </td>
                <td className="h-10 border-r border-t border-slate-200 px-4">
                  {project.customer}
                </td>
                <td className="h-10 border-r border-t border-slate-200 px-4">
                  {formatProjectDate(project.startDate)}
                </td>
                <td className="h-10 border-t border-slate-200 px-3 text-center">
                  {project.status === "NEW" && (
                    <button
                      type="button"
                      aria-label={t("table.deleteProject", {
                        projectNumber: project.projectNumber,
                      })}
                      className="text-[#d96a5d] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isDeleting}
                      onClick={() => onRequestDeleteProject(project)}
                    >
                      <FaRegTrashAlt className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}

          {!isLoading && selectedCount > 0 && (
            <tr className="bg-sky-50 text-sm">
              <td
                colSpan={6}
                className="border-t border-r border-slate-200 px-4 py-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-sky-600">
                    {t("table.itemsSelected", { count: selectedCount })}
                  </span>
                  {canBulkDelete && (
                    <button
                      type="button"
                      aria-label={t("table.deleteSelected")}
                      className="text-[#d96a5d] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isDeleting}
                      onClick={() => onRequestBulkDelete(selectedProjects)}
                    >
                      <span className="text-[#d96a5d] hover:text-[#ff7777] hover:underline">
                        {t("table.deleteSelected")}
                      </span>
                    </button>
                  )}
                  {hasBlockedBulkSelection && (
                    <span className="text-right text-[#d96a5d]">
                      {t("delete.notAllowed", { numbers: blockedBulkNumbers })}
                    </span>
                  )}
                </div>
              </td>
              <td className="h-10 border-t border-slate-200 px-3 text-center">
                {canBulkDelete && (
                  <button
                    type="button"
                    aria-label={t("table.deleteSelected")}
                    className="text-[#d96a5d] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDeleting}
                    onClick={() => {}}
                  >
                    <FaRegTrashAlt className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

type SortableColumnHeaderProps = {
  label: string;
  field: ProjectSortField;
  sortBy: ProjectSortField;
  sortAsc: boolean;
  disabled?: boolean;
  className: string;
  onSortChange: (field: ProjectSortField) => void;
};

function SortableColumnHeader({
  label,
  field,
  sortBy,
  sortAsc,
  disabled = false,
  className,
  onSortChange,
}: SortableColumnHeaderProps) {
  const { t } = useTranslation();
  const isActive = sortBy === field;

  return (
    <th
      className={className}
      aria-sort={isActive ? (sortAsc ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className="inline-flex w-full items-center gap-1 text-left text-slate-500 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => onSortChange(field)}
      >
        <span>{label}</span>
        <span className="text-xs text-sky-600" aria-hidden="true">
          {isActive ? (sortAsc ? "▲" : "▼") : "↕"}
        </span>
        <span className="sr-only">
          {isActive
            ? t("table.sortActive", {
                column: label,
                direction: sortAsc
                  ? t("table.sortAscending")
                  : t("table.sortDescending"),
              })
            : t("table.sortByColumn", { column: label })}
        </span>
      </button>
    </th>
  );
}
