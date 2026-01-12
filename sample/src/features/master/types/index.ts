// ===================================
// マスタデータ型定義
// ===================================

/** 作業者マスタ */
export interface Worker {
  /** 作業者ID */
  id: string;
  /** 作業者名 */
  name: string;
  /** 部署 */
  department: string;
}

/** 機械マスタ */
export interface Machine {
  /** 機械ID */
  id: string;
  /** 機械名 */
  name: string;
  /** 機械カテゴリ */
  category: string;
}

/** 材料マスタ */
export interface Material {
  /** 材料ID */
  id: string;
  /** 材料名 */
  name: string;
  /** 材料カテゴリ */
  category: string;
  /** デフォルト単位ID */
  defaultUnitId: string;
}

/** 単位マスタ */
export interface Unit {
  /** 単位ID */
  id: string;
  /** 単位名（表示用） */
  name: string;
  /** 単位記号 */
  symbol: string;
}

/** マスタ種別 */
export type MasterType = "workers" | "machines" | "materials" | "units";

/** マスタバージョン */
export interface MasterVersions {
  workers: string;
  machines: string;
  materials: string;
  units: string;
}

/** 全マスタ取得レスポンス */
export interface MastersResponse {
  workers: Worker[];
  machines: Machine[];
  materials: Material[];
  units: Unit[];
  versions: MasterVersions;
}

/** マスタ更新チェックレスポンス */
export interface MasterCheckResponse {
  updatedMasters: MasterType[];
}

/** 個別マスタ取得レスポンス */
export interface WorkersResponse {
  workers: Worker[];
  version: string;
}

export interface MachinesResponse {
  machines: Machine[];
  version: string;
}

export interface MaterialsResponse {
  materials: Material[];
  version: string;
}

export interface UnitsResponse {
  units: Unit[];
  version: string;
}
