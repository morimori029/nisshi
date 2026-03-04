export default function SpecPage() {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', fontFamily: 'inherit', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>📄 仕様書</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>介護施設 日報管理システム — 機能仕様</p>
            </div>

            {/* 目次 */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 36 }}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>目次</p>
                <ol style={{ paddingLeft: 20, lineHeight: 2, fontSize: '0.9rem' }}>
                    <li><a href="#overview" style={{ color: 'var(--accent)' }}>システム概要</a></li>
                    <li><a href="#tech" style={{ color: 'var(--accent)' }}>技術スタック</a></li>
                    <li><a href="#datamodel" style={{ color: 'var(--accent)' }}>データモデル</a></li>
                    <li><a href="#attendance" style={{ color: 'var(--accent)' }}>出勤職員管理</a></li>
                    <li><a href="#nightrounds" style={{ color: 'var(--accent)' }}>夜勤巡視サイン</a></li>
                    <li><a href="#records" style={{ color: 'var(--accent)' }}>各種記録項目</a></li>
                    <li><a href="#api" style={{ color: 'var(--accent)' }}>API 仕様</a></li>
                    <li><a href="#sheets" style={{ color: 'var(--accent)' }}>Google Sheets 構成</a></li>
                </ol>
            </div>

            <S id="overview" title="1. システム概要">
                <table style={tbl}>
                    <tbody>
                        <Row k="システム名" v="介護施設 日報管理システム" />
                        <Row k="目的" v="介護施設の日次業務記録（出勤、入居者数、夜勤巡視等）をブラウザで入力し、Google Sheetsに保存・共有する" />
                        <Row k="利用端末" v="施設内LAN上のPC（複数台）からブラウザでアクセス。サーバーPC 1台で Next.js を起動" />
                        <Row k="データ保存先" v="Google Spreadsheet（サービスアカウント認証）" />
                        <Row k="URL構成" v="/report/YYYY-MM-DD … 日報　/settings … 職員管理　/manual … 操作マニュアル　/spec … 仕様書" />
                    </tbody>
                </table>
            </S>

            <S id="tech" title="2. 技術スタック">
                <table style={tbl}>
                    <thead><tr style={{ background: 'var(--bg-input)' }}><Th>区分</Th><Th>内容</Th></tr></thead>
                    <tbody>
                        <Row k="フレームワーク" v="Next.js 16.1.6（App Router）/ React 19.2.3 / TypeScript 5" />
                        <Row k="スタイル" v="カスタムCSS（globals.css）、CSS変数でテーマ管理、Tailwind CSS v4" />
                        <Row k="バックエンド" v="Next.js API Routes（/api/roles, /api/staff, /api/report, /api/setup）" />
                        <Row k="外部サービス" v="Google Sheets API v4（googleapis ^171.4.0）" />
                        <Row k="認証" v="Google Service Account（環境変数: GOOGLE_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_CREDENTIALS）" />
                        <Row k="起動" v="node.js インストール済みPC で npm run dev（またはstart.bat）" />
                    </tbody>
                </table>
            </S>

            <S id="datamodel" title="3. データモデル">
                <SS title="Role（職種）">
                    <Code>{`interface Role {
  id: string;       // UUID
  name: string;     // 職種名（例: "介護 1F"）
  color: string;    // カラーコード
  order: number;    // 表示順
  floor?: '1F' | '2F' | '';  // 夜勤巡視の絞り込みに使用
}`}</Code>
                </SS>
                <SS title="StaffMember（職員）">
                    <Code>{`interface StaffMember {
  id: string;
  name: string;
  roleId: string;   // 所属職種
  order: number;
}`}</Code>
                </SS>
                <SS title="StaffAttendance（当日の出勤記録）">
                    <Code>{`interface StaffAttendance {
  staffId: string;
  attendance: '日勤' | '遅番' | '夜勤' | '研修・出張' | '公休' | '年休' | '欠勤' | '';
  workFloor?: '1F' | '2F';  // 当日の実際の勤務フロア（マスタと異なる場合に設定）
}`}</Code>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.7 }}>
                        <strong>workFloor</strong> は他フロアへの応援時に使用します。通常は職種マスタの floor が参照されますが、
                        このフィールドが設定されている場合は workFloor が優先されます。
                        出勤選択モーダルで他フロアの職員を選択すると自動的にそのフロアが workFloor に記録されます。
                    </p>
                </SS>
                <SS title="DailyReport（日報）">
                    <Code>{`interface DailyReport {
  date: string;               // YYYY-MM-DD
  attendance: StaffAttendance[];
  holidayCounts: Record<string, { kokyu: number; nenkyu: number; kekkinn: number }>;
  residents: { floor1: { male: number; female: number }; floor2: { male: number; female: number } };
  evacuation: { floor1: { tanso: number; goso: number; dokuho: number }; floor2: {...} };
  careLevels: { floor1: { shien: number; care1-5: number }; floor2: {...} };
  roomTransfer: string;       // 居室移動（自由入力）
  admission: string;          // 入所者（自由入力）
  discharge: string;          // 退所者（自由入力）
  medicalVisit: string;       // 受診（自由入力）
  outing?: string;             // 外出・外泊（自由入力）
  temperature: number | null;
  humidity: number | null;
  bathing: { floor1: number; floor2: number };
  remarks: string;            // 備考
  nightRounds: {              // 夜勤巡視サイン
    floor1: Record<string, string>;  // キー: "18"|"20"|...|"8"、値: 職員名
    floor2: Record<string, string>;
  };
  updatedAt?: string;
}`}</Code>
                </SS>
            </S>

            <S id="attendance" title="4. 出勤職員管理">
                <SS title="シフト種別と表示順">
                    <p style={p}>シフト種別: <strong>日勤 → 遅番 → 夜勤 → 研修・出張</strong> の順で表示・ソート。</p>
                    <p style={p}>公休・年休・欠勤は職種ごとに数値のみ入力（職員名不要）。</p>
                </SS>
                <SS title="他フロア応援（workFloor）">
                    <p style={p}>看護以外の職種は、出勤選択モーダルに <strong>1F・2F 両方の職員</strong> が表示されます。</p>
                    <p style={p}>モーダルを開いた職種と同フロアの職員が先頭に並びます（クロスフロア職員は後方）。</p>
                    <p style={p}>他フロアの職員を選択すると <code style={code}>workFloor</code> にそのフロアが記録されます。チップはそのフロアの行に表示され、夜勤巡視サインの絞り込みにも反映されます。</p>
                    <p style={p}>看護職種は自職種の職員のみ選択可能です（フロア混在なし）。</p>
                </SS>
                <SS title="チップ（名前タグ）の表示ルール">
                    <p style={p}>各職種行のチップ: <strong>その行の職種に所属する職員</strong>、または <strong>workFloor がその職種のフロアと一致する他職種の職員</strong> を表示。</p>
                    <p style={p}>チップは勤務種別（日勤→遅番→夜勤→研修）の順にソート。</p>
                </SS>
            </S>

            <S id="nightrounds" title="5. 夜勤巡視サイン">
                <SS title="記録対象時間帯">
                    <p style={p}>18:00 〜 翌 8:00 を 2 時間ごとに記録（18, 20, 22, 0, 2, 4, 6, 8 の計 8 コマ）。</p>
                </SS>
                <SS title="フロア別絞り込み">
                    <p style={p}>1F 行には <strong>1F で勤務している夜勤者のみ</strong>、2F 行には <strong>2F で勤務している夜勤者のみ</strong> が表示されます。</p>
                    <p style={p}>勤務フロアの判定優先順: <code style={code}>workFloor</code>（当日設定） &gt; 職種マスタの <code style={code}>floor</code>。</p>
                    <p style={p}>フロア未設定の夜勤者はどちらの行にも表示されません。</p>
                </SS>
                <SS title="UI">
                    <p style={p}>セルをクリックするとポップオーバーが開き、該当フロアの夜勤者一覧からクリックで選択。</p>
                    <p style={p}>ポップオーバー下部の「× クリア」で入力を削除できます。</p>
                </SS>
            </S>

            <S id="records" title="6. 各種記録項目">
                <table style={tbl}>
                    <thead><tr style={{ background: 'var(--bg-input)' }}><Th>フィールド</Th><Th>型</Th><Th>説明</Th></tr></thead>
                    <tbody>
                        <Row3 a="admission" b="string" c="入所者氏名・詳細（自由入力）" />
                        <Row3 a="discharge" b="string" c="退所者氏名・詳細（自由入力）" />
                        <Row3 a="outing" b="string（省略可）" c="外出・外泊した入居者情報（自由入力）" />
                        <Row3 a="medicalVisit" b="string" c="受診内容・同行者等（自由入力）" />
                        <Row3 a="roomTransfer" b="string" c="居室移動（自由入力）" />
                        <Row3 a="temperature" b="number | null" c="気温（℃）、小数点可" />
                        <Row3 a="humidity" b="number | null" c="湿度（%）" />
                        <Row3 a="bathing.floor1/2" b="number" c="各フロア入浴者数。画面で合計を自動表示" />
                        <Row3 a="remarks" b="string" c="備考・特記事項（自由入力）" />
                    </tbody>
                </table>
            </S>

            <S id="api" title="7. API 仕様">
                <table style={tbl}>
                    <thead><tr style={{ background: 'var(--bg-input)' }}><Th>エンドポイント</Th><Th>メソッド</Th><Th>説明</Th></tr></thead>
                    <tbody>
                        <Row3 a="GET /api/roles" b="GET" c="職種一覧取得" />
                        <Row3 a="POST /api/roles" b="POST" c="職種作成・更新・並び替え・削除（action パラメータで分岐）" />
                        <Row3 a="GET /api/staff" b="GET" c="職員一覧取得" />
                        <Row3 a="POST /api/staff" b="POST" c="職員作成・更新・並び替え・削除（action パラメータで分岐）" />
                        <Row3 a="GET /api/report?date=YYYY-MM-DD" b="GET" c="指定日の日報取得（存在しない場合は 404）" />
                        <Row3 a="POST /api/report" b="POST" c="日報保存（body: DailyReport。date が一致する行を上書き、なければ追加）" />
                        <Row3 a="POST /api/setup" b="POST" c="スプレッドシートの初期シート作成（初回のみ）" />
                    </tbody>
                </table>
            </S>

            <S id="sheets" title="8. Google Sheets 構成">
                <table style={tbl}>
                    <thead><tr style={{ background: 'var(--bg-input)' }}><Th>シート名</Th><Th>列</Th><Th>説明</Th></tr></thead>
                    <tbody>
                        <Row3 a="roles" b="id, name, color, order, floor" c="職種マスタ。1行1職種。" />
                        <Row3 a="staff_master" b="id, name, roleId, order" c="職員マスタ。1行1職員。" />
                        <Row3 a="daily_reports" b="date, data" c="日報データ。date列: YYYY-MM-DD、data列: DailyReport の JSON 文字列" />
                    </tbody>
                </table>
            </S>

            <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <a href="/manual" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
                        📘 操作マニュアルへ
                    </a>
                    <a href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
                        👥 職員管理ページへ
                    </a>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>介護施設 日報管理システム</p>
            </div>
        </div>
    );
}

const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: 8 };
const p: React.CSSProperties = { fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 4 };
const code: React.CSSProperties = { fontFamily: 'monospace', background: 'var(--bg-input)', padding: '1px 5px', borderRadius: 3, fontSize: '0.85em' };

function S({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <div id={id} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, borderLeft: '4px solid var(--accent)', paddingLeft: 12, marginBottom: 16 }}>
                {title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
        </div>
    );
}

function SS({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-secondary)' }}>{title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
        </div>
    );
}

function Code({ children }: { children: React.ReactNode }) {
    return (
        <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.8rem', lineHeight: 1.6, overflowX: 'auto', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {children}
        </pre>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{children}</th>;
}

function Row({ k, v }: { k: string; v: string }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '9px 12px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.88rem', verticalAlign: 'top' }}>{k}</td>
            <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{v}</td>
        </tr>
    );
}

function Row3({ a, b, c }: { a: string; b: string; c: string }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '9px 12px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.82rem', fontFamily: 'monospace', verticalAlign: 'top' }}>{a}</td>
            <td style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{b}</td>
            <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{c}</td>
        </tr>
    );
}
