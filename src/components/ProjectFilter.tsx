import type { SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_STATUS_OPTIONS } from "../constant/project";
import type { ProjectFilters as ProjectFiltersValue } from "../types/project";

type ProjectFilterProps = {
  value: ProjectFiltersValue;
  isLoading?: boolean;
  onChange: (value: ProjectFiltersValue) => void;
  onSearch: () => void;
  onReset: () => void;
};

export function ProjectFilter({
  value,
  isLoading = false,
  onChange,
  onSearch,
  onReset,
}: ProjectFilterProps) {
  const { t } = useTranslation();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      className="mb-8 grid grid-cols-1 items-center gap-3 lg:grid-cols-[310px_180px_164px_120px] lg:gap-4"
      onSubmit={handleSubmit}
    >
      <input
        className="h-7 rounded border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-sky-500"
        aria-label={t("project.searchPlaceholder")}
        placeholder={t("project.searchPlaceholder")}
        value={value.keyword}
        onChange={(event) =>
          onChange({ ...value, keyword: event.target.value })
        }
      />

      <div className="relative">
        <select
          className={`h-7 w-full appearance-none rounded border border-slate-300 bg-white py-0 pl-3 pr-8 text-xs outline-none focus:border-sky-500 ${
            value.status ? "text-slate-700" : "text-slate-400"
          }`}
          aria-label={t("project.statusPlaceholder")}
          value={value.status}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as ProjectFiltersValue["status"],
            })
          }
        >
          <option value="">{t("project.statusPlaceholder")}</option>
          {PROJECT_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {t(`status.${status.value}`)}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center"
          aria-hidden="true"
        >
          <span className="h-0 w-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-slate-500" />
        </span>
      </div>

      <button
        className="h-8 rounded border border-sky-700 bg-gradient-to-b from-sky-500 to-sky-700 px-4 text-sm font-semibold text-white hover:from-sky-600 hover:to-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {t("project.searchButton")}
      </button>

      <button
        className="h-8 bg-transparent px-2 text-sm text-sky-600 font-medium disabled:cursor-not-allowed disabled:opacity-60 hover:text-sky-700"
        type="button"
        disabled={isLoading}
        onClick={onReset}
      >
        {t("project.resetSearch")}
      </button>
    </form>
  );
}
