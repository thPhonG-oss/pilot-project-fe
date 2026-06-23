import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProjectsTable } from "../components/ProjectsTable";
import { getAllProjects } from "../services/projects";
import type { Project } from "../types/project";

export function ProjectListPage() {

    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('')


    useEffect(() => {
        async function fetchProjects() {
            setIsLoading(true);
            setErrorMessage('');
        try{
            const response = await getAllProjects();
            setProjects(response.data);
        } catch (error: unknown) {
            if (error instanceof Error  ) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
        }
        fetchProjects();
    }, []);


    return (
    <main className="max-w-[1010px] px-5 py-8 lg:ml-10 lg:px-0">
      <div className="mb-4 border-b border-slate-300">
        <h1 className="mb-3 text-base font-semibold text-slate-500">{t('project.listTitle')}</h1>
      </div>
      {errorMessage && (
        <div className="mb-4 whitespace-pre-line rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {!errorMessage && (
        <ProjectsTable
        projects={projects}
        isLoading={isLoading}
      />
      )}
    </main>
  )
}
