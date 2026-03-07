# 介護施設 日報管理システム — 機能仕様書

## 目次

1. [システム概要](#1-システム概要)
2. [技術スタック](#2-技術スタック)
3. [データモデル](#3-データモデル)
4. [出勤職員管理](#4-出勤職員管理)
5. [夜勤巡視サイン](#5-夜勤巡視サイン)
6. [各種記録項目](#6-各種記録項目)
7. [職員管理ページ](#7-職員管理ページ)
8. [API 仕様](#8-api-仕様)
9. [Google Sheets 構成](#9-google-sheets-構成)

---

## 1. システム概要

| 項目 | 内容 |
|------|------|
| システム名 | 介護施設 日報管理システム |
| 目的 | 介護施設の日次業務記録（出勤、入居者数、夜勤巡視等）をブラウザで入力し、Google Sheets に保存・共有する |
| 利用端末 | 施設内 LAN 上の PC（複数台）からブラウザでアクセス。各 PC で Next.js をローカル起動 |
| データ保存先 | Google Spreadsheet（サービスアカウント認証） |
| URL 構成 | `/report/YYYY-MM-DD` … 日報 / `/settings` … 職員管理 / `/manual` … 操作マニュアル |

---

## 2. 技術スタック

| 区分 | 内容 |
|------|------|
| フレームワーク | Next.js 16.1.6（App Router）/ React 19.2.3 / TypeScript 5 |
| スタイル | カスタム CSS（globals.css）、CSS 変数でテーマ管理、Tailwind CSS v4 |
| バックエンド | Next.js API Routes（/api/roles, /api/staff, /api/report, /api/setup） |
| 外部サービス | Google Sheets API v4（googleapis ^171.4.0） |
| 認証 | Google Service Account（環境変数: `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`） |
| 起動 | Node.js インストール済み PC で `npm run dev`（または start.bat） |

---

## 3. データモデル

### Role（職種）

```typescript
interface Role {
  id: string;       // UUID
  name: string;     // 職種名（例: "介護 1F"）
  color: string;    // カラーコード
  order: number;    // 表示順
  floor?: '1F' | '2F' | '';  // 夜勤巡視の絞り込みに使用
}
```

### StaffMember（職員）

```typescript
interface StaffMember {
  id: string;
  name: string;
  roleId: string;   // 所属職種
  order: number;
}
```

### StaffAttendance（当日の出勤記録）

```typescript
interface StaffAttendance {
  staffId: string;
  attendance: '日勤' | '遅番' | '夜勤' | '研修・出張' | '公休' | '年休' | '欠勤' | '';
  workFloor?: '1F' | '2F';  // 当日の実際の勤務フロア（マスタと異なる場合に設定）
}
```

**workFloor** は他フロアへの応援時に使用します。通常は職種マスタの `floor` が参照されますが、このフィールドが設定されている場合は `workFloor` が優先されます。出勤選択モーダルで他フロアの職員を選択すると自動的に記録されます。

### DailyReport（日報）

```typescript
interface DailyReport {
  date: string;               // YYYY-MM-DD
  attendance: StaffAttendance[];
  holidayCounts: Record<string, { kokyu: number; nenkyu: number; kekkinn: number }>;
  residents: {
    floor1: { male: number; female: number };
    floor2: { male: number; female: number };
  };
  evacuation: {
    floor1: { tanso: number; goso: number; dokuho: number };
    floor2: { tanso: number; goso: number; dokuho: number };
  };
  careLevels: {
    floor1: { shien: number; care1: number; care2: number; care3: number; care4: number; care5: number };
    floor2: { shien: number; care1: number; care2: number; care3: number; care4: number; care5: number };
  };
  roomTransfer: string;       // 居室移動（自由入力）
  admission: string;          // 入所者（自由入力）
  discharge: string;          // 退所者（自由入力）
  medicalVisit: string;       // 受診（自由入力）
  outing?: string;            // 外出・外泊（自由入力）
  temperature: number | null;
  humidity: number | null;
  bathing: { floor1: number; floor2: number };
  remarks: string;            // 備考
  nightRounds: {              // 夜勤巡視サイン
    floor1: Record<string, string>;  // キー: "18"|"20"|"22"|"0"|"2"|"4"|"6"|"8"、値: 職員名
    floor2: Record<string, string>;
  };
  updatedAt?: string;
}
```

---

## 4. 出勤職員管理

### シフト種別と表示順

シフト種別: **日勤 → 遅番 → 夜勤 → 研修・出張** の順で表示・ソート。

公休・年休・欠勤は職種ごとに数値のみ入力（職員名不要）。

### 他フロア応援（workFloor）

- 看護以外の職種は、出勤選択モーダルに **1F・2F 両方の職員** が表示されます。
- モーダルを開いた職種と同フロアの職員が先頭に並びます（クロスフロア職員は後方）。
- 他フロアの職員を選択すると `workFloor` にそのフロアが記録されます。チップはそのフロアの行に表示され、夜勤巡視サインの絞り込みにも反映されます。
- 看護職種は自職種の職員のみ選択可能です（フロア混在なし）。

### チップ（名前タグ）の表示ルール

各職種行のチップ:
- その行の職種に所属する職員（かつ `workFloor` が別フロアに設定されていない）
- または `workFloor` がその職種のフロアと一致する他職種の職員

チップは勤務種別（日勤 → 遅番 → 夜勤 → 研修）の順にソート。

---

## 5. 夜勤巡視サイン

### 記録対象時間帯

18:00 〜 翌 8:00 を 2 時間ごとに記録（18, 20, 22, 0, 2, 4, 6, 8 の計 8 コマ）。

### フロア別絞り込み

- 1F 行には **1F で勤務している夜勤者のみ**、2F 行には **2F で勤務している夜勤者のみ** が表示されます。
- 勤務フロアの判定優先順: `workFloor`（当日設定） > 職種マスタの `floor`
- フロア未設定の夜勤者はどちらの行にも表示されません。

### UI

セルをクリックするとポップオーバーが開き、該当フロアの夜勤者一覧からクリックで選択。ポップオーバー下部の「× クリア」で入力を削除できます。

---

## 6. 各種記録項目

| フィールド | 型 | 説明 |
|---|---|---|
| admission | string | 入所者氏名・詳細（自由入力） |
| discharge | string | 退所者氏名・詳細（自由入力） |
| outing | string（省略可） | 外出・外泊した入居者情報（自由入力） |
| medicalVisit | string | 受診内容・同行者等（自由入力） |
| roomTransfer | string | 居室移動（自由入力） |
| temperature | number \| null | 気温（℃）、小数点可 |
| humidity | number \| null | 湿度（%） |
| bathing.floor1/2 | number | 各フロア入浴者数。画面で合計を自動表示 |
| remarks | string | 備考・特記事項（自由入力） |

---

## 7. 職員管理ページ

### パスワード認証

`/settings` ページにアクセスするとパスワード入力画面が表示されます。

| 項目 | 値 |
|------|------|
| パスワード | `ajisaistaff` |
| セッション保持 | ブラウザタブを閉じるまで再認証不要（sessionStorage） |

> パスワードを変更する場合は `src/app/settings/page.tsx` 内の `SETTINGS_PASSWORD` 定数を編集してください。

### 職種・職員の並び替え

職種一覧・職員リストの各行左端にある `⠿` ハンドルをドラッグ&ドロップで並び順を変更できます。変更は即時 Google Sheets に保存されます。

### API

| メソッド | エンドポイント | 説明 |
|---|---|---|
| PATCH | `/api/roles` | 職種の並び順を一括更新（body: `{ ids: string[] }`） |
| PATCH | `/api/staff` | 職員の並び順を一括更新（body: `{ ids: string[] }`） |

---

## 8. API 仕様

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/roles` | GET | 職種一覧取得 |
| `/api/roles` | POST | 職種作成 |
| `/api/roles` | PUT | 職種更新 |
| `/api/roles` | PATCH | 職種並び順一括更新（body: `{ ids: string[] }`） |
| `/api/roles` | DELETE | 職種削除 |
| `/api/staff` | GET | 職員一覧取得 |
| `/api/staff` | POST | 職員作成 |
| `/api/staff` | PUT | 職員更新 |
| `/api/staff` | PATCH | 職員並び順一括更新（body: `{ ids: string[] }`） |
| `/api/staff` | DELETE | 職員削除 |
| `/api/report?date=YYYY-MM-DD` | GET | 指定日の日報取得（存在しない場合は 404） |
| `/api/report` | POST | 日報保存（date が一致する行を上書き、なければ追加） |
| `/api/setup` | POST | スプレッドシートの初期シート作成（初回のみ） |

---

## 9. Google Sheets 構成

| シート名 | 列 | 説明 |
|---|---|---|
| roles | id, name, color, order, floor | 職種マスタ。1行1職種。 |
| staff_master | id, name, roleId, order | 職員マスタ。1行1職員。 |
| daily_reports | date, data | 日報データ。date列: YYYY-MM-DD、data列: DailyReport の JSON 文字列 |
