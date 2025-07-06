import { useCallback, useState } from "react";
import type { LogFilters } from "../types";

const initialFilters: LogFilters = {
  level: "",
  message: "",
  resourceId: "",
  timestampStart: "",
  timestampEnd: "",
  traceId: "",
  spanId: "",
  commit: "",
};

export function useFilters() {
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const updateFilter = useCallback(
    <K extends keyof LogFilters>(key: K, value: LogFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some((value) => value !== "");
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}
