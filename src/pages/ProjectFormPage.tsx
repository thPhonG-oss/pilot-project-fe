import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProjectForm, type ProjectFormValue } from "../components/ProjectForm";
import { getGroups } from "../services/groups";
import {
  createProject,
  getProjectById,
  updateProject,
} from "../services/projects";
import type {
  GroupOption,
  Project,
  ProjectCreationRequest,
  ProjectUpdateRequest,
} from "../types/project";

type ProjectFormPageProps = { mode: "create" | "edit" };

const EMPTY_FORM: ProjectFormValue = {
  projectNumber: "",
  name: "",
  customer: "",
  status: "NEW",
  startDate: "",
  endDate: "",
  visas: "",
  groupId: "",
};

export function ProjectFormPage({ mode }: ProjectFormPageProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProjectFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/projects";

  const { projectId } = useParams();
  const numericProjectId = Number(projectId);

  useEffect(() => {
    if (mode === "create") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(EMPTY_FORM);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    if (!Number.isFinite(numericProjectId) || numericProjectId < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let isCurrentRequest = true;

    async function loadProject() {
      setIsLoading(true);
      try {
        const project = await getProjectById(numericProjectId);

        if (!isCurrentRequest) {
          return;
        }

        setForm({
          projectNumber: String(project.projectNumber ?? ""),
          name: project.name ?? "",
          customer: project.customer ?? "",
          status: project.status ?? "NEW",
          startDate: project.startDate ?? "",
          endDate: project.endDate ?? "",
          visas: readProjectVisas(project).join(", "),
          groupId: readProjectGroupId(project),
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      isCurrentRequest = false;
    };
  }, [mode, numericProjectId]);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadGroups() {
      setIsGroupsLoading(true);
      try {
        const response = await getGroups();
        setGroups(response);
      } catch (error) {
        console.error(error);
      } finally {
        if (isCurrentRequest) {
          setIsGroupsLoading(false);
        }
      }
    }
    loadGroups();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const handleChange = (nextForm: ProjectFormValue) => {
    setForm(nextForm);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const request = toCreateProjectRequest(form);
        const response = await createProject(request);
        console.log(response);
      }
      if (mode === "edit") {
        const request = toUpdateProjectRequest(form);
        const response = await updateProject(numericProjectId, request);
        console.log(response);
      }
      navigate(returnTo);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="px-5 py-7 lg:ml-10 lg:px-0 lg:max-w-[880px] md:max-w-[720px] sm:max-w-[640px]">
      <div className="mb-10 border-b border-slate-300">
        <h1 className="mb-4 text-lg font-semibold text-slate-500">
          {mode === "create" ? t("project.newTitle") : t("project.editTitle")}
        </h1>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <ProjectForm
          mode={mode}
          value={form}
          groups={groups}
          isGroupsLoading={isGroupsLoading}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={() => navigate(returnTo)}
        />
      )}
    </main>
  );
}

function toCreateProjectRequest(
  form: ProjectFormValue,
): ProjectCreationRequest {
  return {
    projectNumber: Number(form.projectNumber),
    name: form.name.trim(),
    customer: form.customer.trim(),
    startDate: form.startDate,
    endDate: form.endDate || null,
    visas: parseVisas(form.visas),
    groupId: Number(form.groupId),
  };
}

function toUpdateProjectRequest(form: ProjectFormValue): ProjectUpdateRequest {
  return {
    name: form.name.trim(),
    customer: form.customer.trim(),
    status: form.status,
    startDate: form.startDate,
    endDate: form.endDate || null,
    visas: parseVisas(form.visas),
    groupId: Number(form.groupId),
  };
}

function parseVisas(value: string) {
  return value
    .split(",")
    .map((visa) => visa.trim().toUpperCase())
    .filter(Boolean);
}

function readProjectGroupId(project: Project) {
  return String(
    project.groupId ?? project.groupDto?.id ?? project.group?.id ?? "",
  );
}

function readProjectVisas(project: Project) {
  if (project.visas?.length) {
    return project.visas;
  }

  return readProjectEmployees(project).map((employee) => employee.visa);
}

function readProjectEmployees(project: Project) {
  return project.employeeDtos ?? project.employees ?? [];
}
