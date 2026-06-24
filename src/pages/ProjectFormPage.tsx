import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProjectForm } from "../components/ProjectForm";
import { isCancelledRequest } from "../services/apiError";
import { getEmployeeSuggestions } from "../services/employees";
import { getGroups } from "../services/groups";
import {
  createProject,
  getProjectById,
  updateProject,
} from "../services/projects";
import type {
  EmployeeSuggestion,
  GroupOption,
  Project,
  ProjectCreationRequest,
  ProjectUpdateRequest,
} from "../types/project";
import type { ProjectFormErrors, ProjectFormValue } from "../types/projectForm";
import {
  MAX_MEMBER_SEARCH_KEYWORD_LENGTH,
  MEMBER_SEARCH_DEBOUNCE_MS,
  membersToVisas,
} from "../utils/memberUtils";
import { resolveReturnTo } from "../utils/navigationUtils";
import {
  hasFormErrors,
  mapApiErrorToFormErrors,
  validateProjectForm,
} from "../utils/projectFormUtils";

type ProjectFormPageProps = { mode: "create" | "edit" };

const EMPTY_FORM: ProjectFormValue = {
  projectNumber: "",
  name: "",
  customer: "",
  status: "NEW",
  startDate: "",
  endDate: "",
  members: [],
  groupId: "",
};

export function ProjectFormPage({ mode }: ProjectFormPageProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProjectFormValue>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState("");
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberSuggestions, setMemberSuggestions] = useState<EmployeeSuggestion[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [memberSearchKeyword, setMemberSearchKeyword] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = resolveReturnTo(searchParams);

  const { projectId } = useParams();
  const numericProjectId = Number(projectId);

  useEffect(() => {
    if (mode === "create") {
      setForm(EMPTY_FORM);
      setErrors({});
      setLoadError("");
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    if (!Number.isFinite(numericProjectId) || numericProjectId < 1) {
      setLoadError(t("error.projectNotFound"));
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProject() {
      setIsLoading(true);
      setLoadError("");

      try {
        const project = await getProjectById(numericProjectId);

        if (controller.signal.aborted) {
          return;
        }

        setForm({
          projectNumber: String(project.projectNumber ?? ""),
          name: project.name ?? "",
          customer: project.customer ?? "",
          status: project.status ?? "NEW",
          startDate: project.startDate ?? "",
          endDate: project.endDate ?? "",
          members: readProjectMembers(project),
          groupId: readProjectGroupId(project),
        });
      } catch (error) {
        if (isCancelledRequest(error)) {
          return;
        }

        const mapped = mapApiErrorToFormErrors(error);

        if (mapped.isUnexpected) {
          navigate("/error", {
            replace: true,
            state: { detail: mapped.unexpectedDetail },
          });
          return;
        }

        setLoadError(mapped.errors.form ?? t("error.projectNotFound"));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      controller.abort();
    };
  }, [mode, navigate, numericProjectId, t]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGroups() {
      setIsGroupsLoading(true);

      try {
        const response = await getGroups(controller.signal);
        setGroups(response);
      } catch (error) {
        if (isCancelledRequest(error)) {
          return;
        }

        const mapped = mapApiErrorToFormErrors(error);

        if (mapped.isUnexpected) {
          navigate("/error", {
            replace: true,
            state: { detail: mapped.unexpectedDetail },
          });
          return;
        }

        setErrors((current) => ({
          ...current,
          form: mapped.errors.form ?? t("error.fallback"),
        }));
      } finally {
        if (!controller.signal.aborted) {
          setIsGroupsLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      controller.abort();
    };
  }, [navigate, t]);

  useEffect(() => {
    const keyword = memberSearchKeyword.slice(0, MAX_MEMBER_SEARCH_KEYWORD_LENGTH);

    if (!keyword) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchingMembers(true);

      try {
        const suggestions = await getEmployeeSuggestions(keyword, controller.signal);

        if (!controller.signal.aborted) {
          setMemberSuggestions(suggestions);
        }
      } catch (error) {
        if (!isCancelledRequest(error) && !controller.signal.aborted) {
          setMemberSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingMembers(false);
        }
      }
    }, MEMBER_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [memberSearchKeyword]);

  const handleChange = (nextForm: ProjectFormValue) => {
    setForm(nextForm);

    if (nextForm.members !== form.members) {
      setErrors((current) => {
        if (!("visas" in current)) {
          return current;
        }

        const next = { ...current };
        delete next.visas;
        return next;
      });
    }
  };

  const handleDismissGlobalError = () => {
    setErrors((current) => {
      const next = { ...current };
      delete next.form;
      return next;
    });
  };

  const handleSubmit = async () => {
    const validationErrors = validateProjectForm(form, mode);
    setErrors(validationErrors);

    if (hasFormErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createProject(toCreateProjectRequest(form));
      } else {
        await updateProject(numericProjectId, toUpdateProjectRequest(form));
      }

      navigate(returnTo);
    } catch (error) {
      if (isCancelledRequest(error)) {
        return;
      }

      const mapped = mapApiErrorToFormErrors(error);

      if (mapped.isUnexpected) {
        navigate("/error", {
          state: { detail: mapped.unexpectedDetail },
        });
        return;
      }

      setErrors(mapped.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="px-5 py-7 sm:max-w-[640px] md:max-w-[720px] lg:ml-10 lg:max-w-[880px] lg:px-0">
      <div className="mb-10 border-b border-slate-300">
        <h1 className="mb-4 text-lg font-semibold text-slate-500">
          {mode === "create" ? t("project.newTitle") : t("project.editTitle")}
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("project.loading")}</p>
      ) : loadError ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : (
        <ProjectForm
          mode={mode}
          value={form}
          errors={errors}
          groups={groups}
          isGroupsLoading={isGroupsLoading}
          isSubmitting={isSubmitting}
          memberSuggestions={memberSearchKeyword ? memberSuggestions : []}
          isSearchingMembers={memberSearchKeyword ? isSearchingMembers : false}
          onMemberSearchKeywordChange={setMemberSearchKeyword}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={() => navigate(returnTo)}
          onDismissGlobalError={handleDismissGlobalError}
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
    visas: membersToVisas(form.members),
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
    visas: membersToVisas(form.members),
    groupId: Number(form.groupId),
  };
}

function readProjectGroupId(project: Project) {
  return String(
    project.groupId ?? project.groupDto?.id ?? project.group?.id ?? "",
  );
}

function readProjectMembers(project: Project): EmployeeSuggestion[] {
  const employees = readProjectEmployees(project);

  if (employees.length > 0) {
    return employees;
  }

  return (project.visas ?? []).map((visa, index) => ({
    id: index,
    visa,
    firstName: "",
    lastName: "",
  }));
}

function readProjectEmployees(project: Project) {
  return project.employeeDtos ?? project.employees ?? [];
}
