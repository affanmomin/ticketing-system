import { useCallback, useEffect, useState } from "react";
import * as taxonomyApi from "@/api/taxonomy";
import type { Priority, Status } from "@/types/api";

type TaxonomyState = {
  priorities: Priority[];
  statuses: Status[];
  loading: boolean;
  error?: string;
};

const cache: { priorities?: Priority[]; statuses?: Status[] } = {};

export function useTaxonomy() {
  const [state, setState] = useState<TaxonomyState>({
    priorities: cache.priorities ?? [],
    statuses: cache.statuses ?? [],
    loading: !cache.priorities || !cache.statuses,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const [prioritiesRes, statusesRes] = await Promise.all([
        taxonomyApi.listPriorities(),
        taxonomyApi.listStatuses(),
      ]);
      cache.priorities = prioritiesRes.data;
      cache.statuses = statusesRes.data;
      setState({
        priorities: prioritiesRes.data,
        statuses: statusesRes.data,
        loading: false,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error?.response?.data?.message || "Failed to load taxonomy",
      }));
    }
  }, []);

  useEffect(() => {
    if (!cache.priorities || !cache.statuses) {
      void load();
    }
  }, [load]);

  return {
    priorities: state.priorities,
    statuses: state.statuses,
    loading: state.loading,
    error: state.error,
    refresh: load,
  };
}

