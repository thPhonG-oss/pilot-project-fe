import type { ReactNode, SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_STATUS_OPTIONS } from "../constant/project";
import { MembersField } from "./MembersField";
import type { EmployeeSuggestion, GroupOption, ProjectStatus } from "../types/project";
import type {
  ProjectFormErrors,
  ProjectFormField,
  ProjectFormValue,
} from "../types/projectForm";

type FieldWidth = "full" | "short" | "half" | "date";

const FIELD_WIDTH_CLASS: Record<FieldWidth, string> = {
  full: "w-full",
  short: "w-full max-w-[180px]",
  half: "w-full max-w-[50%]",
  date: "w-[180px] shrink-0",
};
export type { ProjectFormValue } from "../types/projectForm";

type ProjectFormProps = {
  mode: "create" | "edit";
  value: ProjectFormValue;
  errors: ProjectFormErrors;
  groups: GroupOption[];
  isGroupsLoading: boolean;
  isSubmitting: boolean;
  memberSuggestions: EmployeeSuggestion[];
  isSearchingMembers: boolean;
  onMemberSearchKeywordChange: (keyword: string) => void;
  onSubmit: () => void;
  onChange: (value: ProjectFormValue) => void;
  onCancel: () => void;
  onDismissGlobalError: () => void;
};

export function ProjectForm({
  mode,
  value,
  errors,
  groups,
  isGroupsLoading,
  isSubmitting,
  memberSuggestions,
  isSearchingMembers,
  onMemberSearchKeywordChange,
  onSubmit,
  onChange,
  onCancel,
  onDismissGlobalError,
}: ProjectFormProps) {
  const { t } = useTranslation();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="w-full" onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <div
          className="mb-6 flex items-start justify-between gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <span>{errors.form}</span>
          <button
            type="button"
            className="text-lg leading-none text-red-500"
            aria-label={t("validation.dismissError")}
            onClick={onDismissGlobalError}
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-center gap-y-8 text-sm sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-10">
        <FormLabel required>{t("project.number")}</FormLabel>
        <FieldControl
          error={fieldErrorMessage(errors, "projectNumber")}
          inlineError
        >
          <input
            type="number"
            min={1}
            max={9999}
            className={inputClass(
              "short",
              hasFieldError(errors, "projectNumber"),
            )}
            value={value.projectNumber}
            onChange={(event) =>
              onChange({ ...value, projectNumber: event.target.value })
            }
            disabled={mode === "edit"}
          />
        </FieldControl>

        <FormLabel required>{t("project.name")}</FormLabel>
        <FieldControl error={fieldErrorMessage(errors, "name")}>
          <input
            className={inputClass("full", hasFieldError(errors, "name"))}
            value={value.name}
            onChange={(event) =>
              onChange({ ...value, name: event.target.value })
            }
            maxLength={50}
          />
        </FieldControl>

        <FormLabel required>{t("project.customer")}</FormLabel>
        <FieldControl error={fieldErrorMessage(errors, "customer")}>
          <input
            className={inputClass("full", hasFieldError(errors, "customer"))}
            value={value.customer}
            onChange={(event) =>
              onChange({ ...value, customer: event.target.value })
            }
            maxLength={50}
          />
        </FieldControl>

        <FormLabel required>{t("project.group")}</FormLabel>
        <FieldControl error={fieldErrorMessage(errors, "groupId")}>
          <select
            className={inputClass("short", hasFieldError(errors, "groupId"))}
            value={value.groupId}
            onChange={(event) =>
              onChange({ ...value, groupId: event.target.value })
            }
            disabled={isGroupsLoading}
          >
            <option value="">
              {isGroupsLoading
                ? t("project.loadingGroups")
                : t("project.selectGroup")}
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {formatGroupLabel(group, t)}
              </option>
            ))}
          </select>
        </FieldControl>

        <FormLabel>{t("project.members")}</FormLabel>
        <FieldControl error={fieldErrorMessage(errors, "visas")}>
          <MembersField
            members={value.members}
            hasError={hasFieldError(errors, "visas")}
            suggestions={memberSuggestions}
            isSearching={isSearchingMembers}
            onChange={(members) => onChange({ ...value, members })}
            onSearchKeywordChange={onMemberSearchKeywordChange}
          />
        </FieldControl>

        <FormLabel required>{t("project.status")}</FormLabel>
        <FieldControl error={fieldErrorMessage(errors, "status")}>
          <div className="relative">
            <select
              className={inputClass("short", hasFieldError(errors, "status"))}
              value={value.status}
              onChange={(event) =>
                onChange({
                  ...value,
                  status: event.target.value as ProjectStatus,
                })
              }
              disabled={mode === "create"}
            >
              {PROJECT_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {t(`status.${status.value}`)}
                </option>
              ))}
            </select>
          </div>
        </FieldControl>

        <FormLabel required>{t("project.startDate")}</FormLabel>
        <FieldControl
          error={
            fieldErrorMessage(errors, "endDate") ??
            fieldErrorMessage(errors, "startDate")
          }
        >
          <div className="flex w-full items-center justify-between">
            <input
              type="date"
              className={inputClass("date", hasFieldError(errors, "startDate"))}
              value={value.startDate}
              onChange={(event) =>
                onChange({ ...value, startDate: event.target.value })
              }
            />

            <div className="ml-20 flex items-center gap-3">
              <span className="shrink-0 whitespace-nowrap font-semibold text-slate-500">
                {t("project.endDate")}
              </span>

              <input
                type="date"
                className={inputClass("date", hasFieldError(errors, "endDate"))}
                value={value.endDate}
                onChange={(event) =>
                  onChange({ ...value, endDate: event.target.value })
                }
              />
            </div>
          </div>
        </FieldControl>
      </div>
      <div className="mt-10 border-t border-slate-200 pt-8">
        <div className="flex justify-end gap-12">
          <button
            className="h-8 min-w-[156px] rounded border border-slate-300 bg-gradient-to-b from-white to-slate-100 px-5 text-sm font-semibold text-slate-600"
            type="button"
            onClick={onCancel}
          >
            {t("project.cancelButton")}
          </button>
          <button
            className="h-8 min-w-[156px] rounded border border-sky-700 bg-gradient-to-b from-sky-500 to-sky-700 px-5 text-sm font-semibold text-white disabled:from-sky-300 disabled:to-sky-300"
            type="submit"
            disabled={isSubmitting}
          >
            {mode === "create"
              ? t("project.createButton")
              : t("project.saveButton")}
          </button>
        </div>
      </div>
    </form>
  );
}

function FormLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <label className="font-semibold text-slate-500">
      {children}
      {required && <span className="ml-2 text-red-500">*</span>}
    </label>
  );
}

function FieldControl({
  children,
  error,
  inlineError = false,
}: {
  children: ReactNode;
  error?: string;
  inlineError?: boolean;
}) {
  if (inlineError) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {children}
        {error && (
          <span className="text-sm font-semibold text-red-500">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {children}
      {error && (
        <span className="mt-1 block text-sm font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

function hasFieldError(errors: ProjectFormErrors, field: ProjectFormField | "visas") {
  return field in errors;
}

function fieldErrorMessage(errors: ProjectFormErrors, field: ProjectFormField | "visas") {
  const message = errors[field];
  return message ? message : undefined;
}

function inputClass(width: FieldWidth, hasError = false) {
  return [
    "h-7 rounded border bg-white px-3 text-slate-700 shadow-inner disabled:bg-slate-100 outline-none",
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-300 focus:border-sky-500",
    FIELD_WIDTH_CLASS[width],
  ].join(" ");
}

function formatGroupLabel(
  group: GroupOption,
  t: (key: string, options?: Record<string, string | number>) => string,
) {
  if (group.leaderVisa) {
    return t("project.groupLabelWithLeader", {
      id: group.id,
      visa: group.leaderVisa,
    });
  }

  return t("project.groupLabel", { id: group.id });
}
