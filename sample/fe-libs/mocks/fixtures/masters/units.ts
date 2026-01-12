// ===================================
// 単位マスタ fixture
// ===================================

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export const unitsFixture: Unit[] = [
  { id: "u001", name: "キログラム", symbol: "kg" },
  { id: "u002", name: "グラム", symbol: "g" },
  { id: "u003", name: "メートル", symbol: "m" },
  { id: "u004", name: "センチメートル", symbol: "cm" },
  { id: "u005", name: "ミリメートル", symbol: "mm" },
  { id: "u006", name: "個", symbol: "個" },
  { id: "u007", name: "枚", symbol: "枚" },
  { id: "u008", name: "本", symbol: "本" },
  { id: "u009", name: "リットル", symbol: "L" },
  { id: "u010", name: "ミリリットル", symbol: "mL" },
];

export const unitsVersion = "v1.0.0";
