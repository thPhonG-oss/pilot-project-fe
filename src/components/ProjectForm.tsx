import type { ReactNode, SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_STATUS_OPTIONS } from "../constant/project";
import type { GroupOption, ProjectStatus } from "../types/project";

type FieldWidth = "full" | "short" | "half" | "date";

const FIELD_WIDTH_CLASS: Record<FieldWidth, string> = {
  full: "w-full",
  short: "w-full max-w-[140px]",
  half: "w-full max-w-[50%]",
  date: "w-full max-w-[180px]",
};
export type ProjectFormValue = {
  projectNumber: string;
  name: string;
  customer: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  visas: string;
  groupId: string;
};

type ProjectFormProps = {
  mode: "create" | "edit";
  value: ProjectFormValue;
  groups: GroupOption[];
  isGroupsLoading: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onChange: (value: ProjectFormValue) => void;
  onCancel: () => void;
};

export function ProjectForm({
  mode,
  value,
  groups,
  isGroupsLoading,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: ProjectFormProps) {
  const { t } = useTranslation();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 items-center gap-y-8 text-sm sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-10">
        <FormLabel required>{t("project.number")}</FormLabel>
        <FieldControl>
          <input
            type="number"
            min={1}
            max={9999}
            required
            className={inputClass("short")}
            value={value.projectNumber}
            onChange={(event) =>
              onChange({ ...value, projectNumber: event.target.value })
            }
            disabled={mode === "edit"}
          />
        </FieldControl>

        <FormLabel required>{t("project.name")}</FormLabel>
        <FieldControl>
          <input
            className={inputClass("full")}
            value={value.name}
            onChange={(event) =>
              onChange({ ...value, name: event.target.value })
            }
            required
            maxLength={50}
          />
        </FieldControl>

        <FormLabel required>{t("project.customer")}</FormLabel>
        <FieldControl>
          <input
            className={inputClass("full")}
            value={value.customer}
            onChange={(event) =>
              onChange({ ...value, customer: event.target.value })
            }
            required
            maxLength={50}
          />
        </FieldControl>

        <FormLabel required>{t("project.group")}</FormLabel>
        <FieldControl>
          <select
            className={inputClass("short")}
            value={value.groupId}
            onChange={(event) =>
              onChange({ ...value, groupId: event.target.value })
            }
            required
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
        <FieldControl>
          <input
            type="text"
            className={inputClass("full")}
            value={value.visas}
            onChange={(event) =>
              onChange({ ...value, visas: event.target.value })
            }
          />
        </FieldControl>

        <FormLabel required>{t("project.status")}</FormLabel>
        <FieldControl>
          <div className="relative">
            <select
              className={inputClass("short")}
              value={value.status}
              onChange={(event) =>
                onChange({
                  ...value,
                  status: event.target.value as ProjectStatus,
                })
              }
              disabled={mode === "create"}
              required
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
        <FieldControl>
          <input
            type="date"
            className={inputClass("date")}
            value={value.startDate}
            onChange={(event) =>
              onChange({ ...value, startDate: event.target.value })
            }
            required
          />
        </FieldControl>
        <FormLabel>{t("project.endDate")}</FormLabel>
        <FieldControl>
          <input
            type="date"
            className={inputClass("date")}
            value={value.endDate}
            onChange={(event) =>
              onChange({ ...value, endDate: event.target.value })
            }
          />
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
}: {
  children: ReactNode;
  error?: string;
}) {
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

function inputClass(width: FieldWidth, error?: string) {
  return [
    "h-7 rounded border border-slate-300 bg-white px-3 text-slate-700 shadow-inner disabled:bg-slate-100 outline-none focus:border-sky-500",
    error ? "border-red-500" : "border-slate-300",
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
