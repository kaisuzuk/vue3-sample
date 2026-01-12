import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useMasterStoreInternal } from "./masterStore";

/**
 * マスタストアを利用するための Composable
 *
 * 使用例:
 * ```ts
 * const { workers, machines, loading, initializeMasters } = useMasterStore()
 * ```
 */
export function useMasterStore() {
  const store = useMasterStoreInternal();
  const { workers, machines, materials, units, initialized, loading } =
    storeToRefs(store);

  return {
    // State（リアクティブな参照）
    workers: computed(() => workers.value),
    machines: computed(() => machines.value),
    materials: computed(() => materials.value),
    units: computed(() => units.value),
    initialized: computed(() => initialized.value),
    loading: computed(() => loading.value),

    // Actions
    initializeMasters: () => store.initialize(),
    checkAndUpdateMasters: () => store.checkAndUpdate(),

    // ヘルパー: IDから名前を取得
    getWorkerName: (id: string) =>
      workers.value.find((w) => w.id === id)?.name ?? "",
    getMachineName: (id: string) =>
      machines.value.find((m) => m.id === id)?.name ?? "",
    getMaterialName: (id: string) =>
      materials.value.find((m) => m.id === id)?.name ?? "",
    getUnitName: (id: string) =>
      units.value.find((u) => u.id === id)?.name ?? "",
    getUnitSymbol: (id: string) =>
      units.value.find((u) => u.id === id)?.symbol ?? "",
  };
}
