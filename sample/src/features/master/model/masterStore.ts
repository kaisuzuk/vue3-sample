import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Worker,
  Machine,
  Material,
  Unit,
  MasterVersions,
  MasterType,
  MastersResponse,
  MasterCheckResponse,
} from "../types";

export const useMasterStoreInternal = defineStore("master", () => {
  // ===================================
  // State
  // ===================================
  const workers = ref<Worker[]>([]);
  const machines = ref<Machine[]>([]);
  const materials = ref<Material[]>([]);
  const units = ref<Unit[]>([]);
  const versions = ref<MasterVersions>({
    workers: "",
    machines: "",
    materials: "",
    units: "",
  });
  const initialized = ref(false);
  const loading = ref(false);

  // ===================================
  // Actions
  // ===================================

  /**
   * 全マスタを取得して初期化
   */
  async function initialize(): Promise<void> {
    if (initialized.value) return;

    loading.value = true;
    try {
      const response = await fetch("/api/masters");
      if (!response.ok) {
        throw new Error("Failed to fetch masters");
      }

      const data: MastersResponse = await response.json();

      workers.value = data.workers;
      machines.value = data.machines;
      materials.value = data.materials;
      units.value = data.units;
      versions.value = data.versions;
      initialized.value = true;
    } catch (error) {
      console.error("Failed to initialize masters:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * マスタ更新チェックと差分更新
   */
  async function checkAndUpdate(): Promise<void> {
    if (!initialized.value) return;

    try {
      const params = new URLSearchParams({
        workersVersion: versions.value.workers,
        machinesVersion: versions.value.machines,
        materialsVersion: versions.value.materials,
        unitsVersion: versions.value.units,
      });

      const response = await fetch(`/api/masters/check?${params}`);
      if (!response.ok) {
        throw new Error("Failed to check masters");
      }

      const data: MasterCheckResponse = await response.json();

      // 更新が必要なマスタを個別取得
      for (const masterType of data.updatedMasters) {
        await fetchMaster(masterType);
      }
    } catch (error) {
      console.error("Failed to check and update masters:", error);
    }
  }

  /**
   * 個別マスタ取得
   */
  async function fetchMaster(type: MasterType): Promise<void> {
    const response = await fetch(`/api/masters/${type}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}`);
    }

    const data = await response.json();

    switch (type) {
      case "workers":
        workers.value = data.workers;
        versions.value.workers = data.version;
        break;
      case "machines":
        machines.value = data.machines;
        versions.value.machines = data.version;
        break;
      case "materials":
        materials.value = data.materials;
        versions.value.materials = data.version;
        break;
      case "units":
        units.value = data.units;
        versions.value.units = data.version;
        break;
    }
  }

  return {
    // State
    workers,
    machines,
    materials,
    units,
    versions,
    initialized,
    loading,
    // Actions
    initialize,
    checkAndUpdate,
    fetchMaster,
  };
});
