import { useLayoutStore } from "../store/layoutStore";

export function useMultiSelect() {
  const selectedIds = useLayoutStore((s) => s.selectedIds);
  const boxSelect = useLayoutStore((s) => s.boxSelect);
  return { selectedIds, boxSelect };
}
