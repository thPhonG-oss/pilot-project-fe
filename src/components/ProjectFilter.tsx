import { useState, type SubmitEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_STATUS_OPTIONS } from "../constant/project";
import type { ProjectFilters as ProjectFiltersValue } from "../types/project";
import { EmployeeFilterField } from "./EmployeeFilterField";
import { useMemberSuggestions } from "../hooks/useMemberSuggestions";

type ProjectFilterProps = {
  value: ProjectFiltersValue;
  isLoading?: boolean;
  onChange: (value: ProjectFiltersValue) => void;
  onSearch: () => void;
  onReset: () => void;
};

const ADVANCED_FIELDS: Array<keyof ProjectFiltersValue> = [
  "leaderVisa",
  "memberVisa",
  "startDateFrom",
  "startDateTo",
  "endDateFrom",
  "endDateTo",
];

function hasAdvancedCriteria(value: ProjectFiltersValue) {
  return ADVANCED_FIELDS.some((field) => value[field]);
}

export function ProjectFilter({
  value,
  isLoading = false,
  onChange,
  onSearch,
  onReset,
}: ProjectFilterProps) {
  const { t } = useTranslation();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() =>
    hasAdvancedCriteria(value),
  );
  const [leaderKeyword, setLeaderKeyword] = useState("");
  const [memberKeyword, setMemberKeyword] = useState("");
  const leaderSuggestions = useMemberSuggestions(leaderKeyword);
  const memberSuggestions = useMemberSuggestions(memberKeyword);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="mb-8" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[310px_180px_164px_120px] lg:gap-4">
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
      </div>

      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
        aria-expanded={isAdvancedOpen}
        onClick={() => setIsAdvancedOpen((current) => !current)}
      >
        <span aria-hidden="true">{isAdvancedOpen ? "▾" : "▸"}</span>
        {t("project.advancedFilters")}
      </button>

      {isAdvancedOpen && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t("project.leader")}
            </label>
            <EmployeeFilterField
              value={value.leaderVisa}
              placeholder={t("project.leaderPlaceholder")}
              ariaLabel={t("project.leader")}
              suggestions={leaderSuggestions.suggestions}
              isSearching={leaderSuggestions.isSearching}
              disabled={isLoading}
              onSearchKeywordChange={setLeaderKeyword}
              onChange={(visa) => onChange({ ...value, leaderVisa: visa })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t("project.containingMember")}
            </label>
            <EmployeeFilterField
              value={value.memberVisa}
              placeholder={t("project.memberPlaceholder")}
              ariaLabel={t("project.containingMember")}
              suggestions={memberSuggestions.suggestions}
              isSearching={memberSuggestions.isSearching}
              disabled={isLoading}
              onSearchKeywordChange={setMemberKeyword}
              onChange={(visa) => onChange({ ...value, memberVisa: visa })}
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              {t("project.startDate")}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-500"
                aria-label={t("filters.fromDate", { field: t("project.startDate") })}
                value={value.startDateFrom}
                disabled={isLoading}
                onChange={(event) =>
                  onChange({ ...value, startDateFrom: event.target.value })
                }
              />
              <span className="shrink-0 text-xs text-slate-400">
                {t("filters.to")}
              </span>
              <input
                type="date"
                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-500"
                aria-label={t("filters.toDate", { field: t("project.startDate") })}
                value={value.startDateTo}
                disabled={isLoading}
                onChange={(event) =>
                  onChange({ ...value, startDateTo: event.target.value })
                }
              />
            </div>
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              {t("project.endDate")}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-500"
                aria-label={t("filters.fromDate", { field: t("project.endDate") })}
                value={value.endDateFrom}
                disabled={isLoading}
                onChange={(event) =>
                  onChange({ ...value, endDateFrom: event.target.value })
                }
              />
              <span className="shrink-0 text-xs text-slate-400">
                {t("filters.to")}
              </span>
              <input
                type="date"
                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-sky-500"
                aria-label={t("filters.toDate", { field: t("project.endDate") })}
                value={value.endDateTo}
                disabled={isLoading}
                onChange={(event) =>
                  onChange({ ...value, endDateTo: event.target.value })
                }
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
