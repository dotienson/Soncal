export interface Preset {
  id: string;
  name: string;
  dosePerKg?: number;
  concentrationMg?: number;
  concentrationMl?: number;
  timesPerDay?: number;
  bottleVolume?: number;
  unit?: string;
  isSpecial?: boolean;
  isSolid?: boolean;
  color?: string;
  maxDoseMg?: number;
}

export interface HistoryItem {
  id: string;
  type: 'math' | 'preset';
  title?: string;
  expression: string | string[];
  result: string;
  totalVolume?: string;
  volumeNum?: number;
  timesPerDay?: number;
  unit?: string;
  bottleVolume?: number;
  isMaxDoseLimited?: boolean;
  maxDoseStr?: string;
  hasRounded?: boolean;
  warning?: string;
}

