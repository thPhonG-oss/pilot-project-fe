import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegTrashAlt } from "react-icons/fa";
import type { Project } from "../types/project";
import { formatProjectDate } from "../utils/dateUtils";

type ProjectsTableProps = {
    projects: Project[],
    isLoading: boolean,
}

export function ProjectsTable({projects, isLoading}: ProjectsTableProps) {
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(new Set())
  const { t } = useTranslation();
  const selectedCount = selectedProjectIds.size
  const selectedProjects = projects.filter((project) => selectedProjectIds.has(project.id))
  const canBulkDelete =
    selectedCount > 0 && selectedProjects.every((project) => project.status === 'NEW')

  useEffect(() => {
    setSelectedProjectIds(new Set());
  }, [projects]);

  const handleSelectProject = (projectId: number, checked: boolean) => {
    setSelectedProjectIds((current) => {
      const next = new Set(current)

      if (checked) {
        next.add(projectId)
      } else {
        next.delete(projectId)
      }

      return next
    })
  }


    return (
        <section className="min-h-72" aria-label={t('project.projectsTable')}>
          <table className="w-full border-collapse border border-slate-300 bg-white text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="h-8 w-9 border-b border-r border-slate-200 px-2" aria-label={t('table.selection')}></th>
                <th className="h-8 w-20 border-b border-r border-slate-200 px-3 font-semibold">{t('table.number')}</th>
                <th className="h-8 border-b border-r border-slate-200 px-4 font-semibold">{t('table.name')}</th>
                <th className="h-8 w-32 border-b border-r border-slate-200 px-4 font-semibold">{t('table.status')}</th>
                <th className="h-8 w-56 border-b border-r border-slate-200 px-4 font-semibold">{t('table.customer')}</th>
                <th className="h-8 w-28 border-b border-r border-slate-200 px-4 font-semibold">{t('table.startDate')}</th>
                <th className="h-8 w-16 border-b border-slate-200 px-3 text-center font-semibold">{t('table.delete')}</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400">{t('project.loadingProjects')}</td>
                </tr>
              )}

              {!isLoading && projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400">{t('project.noProjects')}</td>
                </tr>
              )}

              {!isLoading && projects.map((project) => (
                <tr key={project.id} className="text-slate-600">
                  <td className="h-10 border-r border-t border-slate-200 px-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={t('table.selectProject', { projectNumber: project.projectNumber })}
                      checked={selectedProjectIds.has(project.id)}
                      onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                    />
                  </td>
                  <td className="h-10 border-r border-t border-slate-200 px-3 text-right">
                      {project.projectNumber}
                  </td>
                  <td className="h-10 border-r border-t border-slate-200 px-4">{project.name}</td>
                  <td className="h-10 border-r border-t border-slate-200 px-4">
                    {t(`status.${project.status}`)}
                  </td>
                  <td className="h-10 border-r border-t border-slate-200 px-4">{project.customer}</td>
                  <td className="h-10 border-r border-t border-slate-200 px-4">{formatProjectDate(project.startDate)}</td>
                  <td className="h-10 border-t border-slate-200 px-3 text-center">
                      {project.status === 'NEW' && selectedProjectIds.has(project.id) && (
                        <button
                        type="button"
                        aria-label={t('table.deleteProject', { projectNumber: project.projectNumber })}
                        className="text-[#d96a5d]"
                        >
                          <FaRegTrashAlt className="h-4 w-4" />
                        </button>
                  )}
                  </td>
                </tr>
              ))}

              {!isLoading && selectedCount > 0 && (
                <tr className="bg-sky-50 text-sm">
                  <td colSpan={6} className="border-t border-r border-slate-200 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sky-600">
                        {t('table.itemsSelected', { count: selectedCount })}
                      </span>
                      {canBulkDelete && (
                        <span className="text-[#d96a5d]">{t('table.deleteSelected')}</span>
                      )}
                    </div>
                  </td>
                  <td className="h-10 border-t border-slate-200 px-3 text-center">
                    {canBulkDelete && (
                      <button
                        type="button"
                        aria-label={t('table.deleteSelected')}
                        className="text-[#d96a5d]"
                        onClick={() => {
                          // wire up delete handler in parent when ready
                        }}
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
      )
}
