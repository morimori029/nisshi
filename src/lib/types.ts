// =====================
// スタッフ関連
// =====================

export interface Role {
  id: string;
  name: string;
  color: string;
  order: number;
  floor?: '1F' | '2F' | '';
}

export interface StaffMember {
  id: string;
  name: string;
  roleId: string;
  order: number;
  status?: 'active' | 'retired';
}

// 出勤区分
export type AttendanceType =
  | '早番'
  | '日勤'
  | '遅番'
  | '夜勤'
  | '研修・出張'
  | '公休'
  | '年休'
  | '欠勤'
  | '';

export interface StaffAttendance {
  staffId: string;
  attendance: AttendanceType;
  workFloor?: '1F' | '2F';  // 当日の実際の勤務フロア（マスタと異なる場合に設定）
}

// =====================
// 入居者数
// =====================

export interface FloorResidents {
  male: number;
  female: number;
}

export interface ResidentCounts {
  floor1: FloorResidents;
  floor2: FloorResidents;
}

// =====================
// 避難区分
// =====================

export interface EvacuationCounts {
  tanso: number;   // 担送
  goso: number;    // 護送
  dokuho: number;  // 独歩
}

export interface FloorEvacuation {
  floor1: EvacuationCounts;
  floor2: EvacuationCounts;
}

// =====================
// 介護度
// =====================

export interface CareLevelCounts {
  shien: number;       // 支援
  care1: number;       // 要介護1
  care2: number;       // 要介護2
  care3: number;       // 要介護3
  care4: number;       // 要介護4
  care5: number;       // 要介護5
}

export interface FloorCareLevels {
  floor1: CareLevelCounts;
  floor2: CareLevelCounts;
}

// =====================
// 入浴者数
// =====================

export interface BathingCounts {
  floor1: number;
  floor2: number;
}

// 職種別休日カウント（数値入力）
export interface RoleHolidayCounts {
  kokyu: number;    // 公休
  nenkyu: number;   // 年休
  kekkinn: number;  // 欠勤
}

// =====================
// 日報全体
// =====================

export interface DailyReport {
  date: string; // YYYY-MM-DD
  attendance: StaffAttendance[];
  holidayCounts: Record<string, RoleHolidayCounts>; // roleId → counts
  residents: ResidentCounts;
  evacuation: FloorEvacuation;
  careLevels: FloorCareLevels;
  roomTransfer: string;    // 居室移動
  admission: string;       // 入所者
  discharge: string;       // 退所者
  medicalVisit: string;    // 受診
  outing?: string;          // 外出・外泊
  temperature: number | null;
  humidity: number | null;
  bathing: BathingCounts;
  remarks: string;          // 備考
  nightRounds: { floor1: Record<string, string>; floor2: Record<string, string> }; // 夜勤巡視サイン（1F/2F × 18〜8時）
  updatedAt?: string;
}

// =====================
// API レスポンス
// =====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
