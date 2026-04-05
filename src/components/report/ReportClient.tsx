'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DailyReport, Role, StaffMember, AttendanceType } from '@/lib/types';
import { ToastContainer, useToast } from '@/components/Toast';
import AttendanceSection from '@/components/report/AttendanceSection';
import ResidentSection from '@/components/report/ResidentSection';
import EvacuationSection from '@/components/report/EvacuationSection';
import CareLevelSection from '@/components/report/CareLevelSection';
import TextRecordsSection from '@/components/report/TextRecordsSection';
import NightRoundsSection from '@/components/report/NightRoundsSection';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const wd = WEEKDAYS[d.getDay()];
    return `${y}年${m}月${day}日（${wd}）`;
}

function formatDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function prevDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return formatDateStr(d);
}

function nextDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return formatDateStr(d);
}

function makeEmptyReport(date: string): DailyReport {
    return {
        date,
        attendance: [],
        holidayCounts: {},
        residents: {
            floor1: { male: 0, female: 0 },
            floor2: { male: 0, female: 0 },
        },
        evacuation: {
            floor1: { tanso: 0, goso: 0, dokuho: 0 },
            floor2: { tanso: 0, goso: 0, dokuho: 0 },
        },
        careLevels: {
            floor1: { shien: 0, care1: 0, care2: 0, care3: 0, care4: 0, care5: 0 },
            floor2: { shien: 0, care1: 0, care2: 0, care3: 0, care4: 0, care5: 0 },
        },
        roomTransfer: '',
        admission: '',
        discharge: '',
        medicalVisit: '',
        outing: '',
        temperature: null,
        humidity: null,
        bathing: { floor1: 0, floor2: 0 },
        remarks: '',
        nightRounds: { floor1: {}, floor2: {} },
    };
}

function draftKey(date: string) {
    return `draft_${date}`;
}

// 30日以上前の下書きを localStorage から削除
function purgeOldDrafts() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10); // YYYY-MM-DD
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('draft_')) {
            const dateStr = key.slice(6); // "draft_" の後
            if (dateStr < cutoffStr) localStorage.removeItem(key);
        }
    }
}

export default function ReportClient({ date }: { date: string }) {
    const router = useRouter();
    const { toasts, addToast } = useToast();

    const [report, setReport] = useState<DailyReport>(makeEmptyReport(date));
    const [roles, setRoles] = useState<Role[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [loadedAt, setLoadedAt] = useState<string | undefined>(undefined);
    const [conflictModal, setConflictModal] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const datePickerRef = useRef<HTMLInputElement>(null);

    // 古い下書きの削除（マウント時1回のみ）
    useEffect(() => { purgeOldDrafts(); }, []);

    // Load roles & staff（マウント時1回のみ）
    useEffect(() => {
        Promise.all([
            fetch('/api/roles').then(r => r.json()),
            fetch('/api/staff').then(r => r.json()),
        ]).then(([rolesRes, staffRes]) => {
            if (rolesRes.success) setRoles(rolesRes.data);
            if (staffRes.success) setStaff(staffRes.data);
        });
    }, []);

    // Load report for date
    useEffect(() => {
        setLoading(true);
        setReport(makeEmptyReport(date));
        setLoadedAt(undefined);
        setConflictModal(false);
        setIsDirty(false);
        setHasDraft(false);
        fetch(`/api/report?date=${date}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    setReport(res.data);
                    setLoadedAt(res.data.updatedAt);
                    // サーバーデータと異なる下書きがあれば通知
                    const draft = localStorage.getItem(draftKey(date));
                    if (draft && draft !== JSON.stringify(res.data)) {
                        setHasDraft(true);
                    }
                } else {
                    // 新規日付でも下書きがあれば通知
                    const draft = localStorage.getItem(draftKey(date));
                    if (draft) setHasDraft(true);
                }
            })
            .finally(() => setLoading(false));
    }, [date]);

    // 30秒ごとに updatedAt をポーリングして競合を検知
    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const res = await fetch(`/api/report?date=${date}&check=1`);
                const data = await res.json();
                if (data.success && data.updatedAt && loadedAt && data.updatedAt > loadedAt) {
                    setConflictModal(true);
                }
            } catch { /* ネットワークエラーは無視 */ }
        }, 30000);
        return () => clearInterval(id);
    }, [date, loadedAt]);

    // 未保存離脱警告
    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // Initialise attendance entries when staff loads
    useEffect(() => {
        if (staff.length === 0) return;
        setReport(prev => {
            const existingIds = new Set(prev.attendance.map(a => a.staffId));
            const newEntries = staff
                .filter(s => !existingIds.has(s.id))
                .map(s => ({ staffId: s.id, attendance: '' as AttendanceType }));
            if (newEntries.length === 0) return prev;
            return { ...prev, attendance: [...prev.attendance, ...newEntries] };
        });
    }, [staff]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...report, loadedAt }),
            });
            const data = await res.json();
            if (res.status === 409 && data.conflict) {
                setSaveStatus('idle');
                setConflictModal(true);
                return;
            }
            if (data.success) {
                setSaveStatus('saved');
                setLoadedAt(data.updatedAt ?? new Date().toISOString());
                setIsDirty(false);
                localStorage.removeItem(draftKey(date));
                setHasDraft(false);
                addToast('保存しました', 'success');
            } else {
                setSaveStatus('error');
                addToast('保存に失敗しました: ' + data.error, 'error');
            }
        } catch {
            setSaveStatus('error');
            addToast('保存に失敗しました', 'error');
        } finally {
            setSaving(false);
        }
    }, [report, loadedAt, date, addToast]);

    const updateReport = useCallback(<K extends keyof DailyReport>(key: K, value: DailyReport[K]) => {
        setReport(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem(draftKey(date), JSON.stringify(next));
            return next;
        });
        setIsDirty(true);
    }, [date]);

    // 前日から入居者数・避難区分・介護度を取り込む
    const importFromPrevDay = useCallback(async () => {
        if (isDirty && !window.confirm('現在の入力内容が上書きされます。よいですか？')) return;
        setImporting(true);
        try {
            const prev = prevDate(date);
            const res = await fetch(`/api/report?date=${prev}`);
            const data = await res.json();
            if (data.success && data.data) {
                const prevReport: DailyReport = data.data;
                setReport(cur => {
                    const next = {
                        ...cur,
                        residents: prevReport.residents,
                        evacuation: prevReport.evacuation,
                        careLevels: prevReport.careLevels,
                    };
                    localStorage.setItem(draftKey(date), JSON.stringify(next));
                    return next;
                });
                setIsDirty(true);
                addToast('前日のデータを取り込みました', 'success');
            } else {
                addToast('前日の日報データが見つかりません', 'error');
            }
        } catch {
            addToast('取り込みに失敗しました', 'error');
        } finally {
            setImporting(false);
        }
    }, [date, isDirty, addToast]);

    const restoreDraft = useCallback(() => {
        const draft = localStorage.getItem(draftKey(date));
        if (!draft) return;
        try {
            setReport(JSON.parse(draft));
            setIsDirty(true);
            setHasDraft(false);
            addToast('下書きを復元しました', 'success');
        } catch {
            addToast('下書きの復元に失敗しました', 'error');
        }
    }, [date, addToast]);

    const discardDraft = useCallback(() => {
        localStorage.removeItem(draftKey(date));
        setHasDraft(false);
    }, [date]);

    const saveStatusClass = isDirty && saveStatus === 'idle' ? 'dirty' : saveStatus;
    const statusIcon = { idle: '', saving: '⏳', saved: '✅', error: '❌', dirty: '●' }[saveStatusClass] ?? '';
    const statusLabel = {
        idle: '',
        saving: '保存中...',
        saved: '保存済み',
        error: 'エラー',
        dirty: '未保存の変更があります',
    }[saveStatusClass] ?? '';

    const handleConflictReload = useCallback(() => {
        setConflictModal(false);
        setLoading(true);
        fetch(`/api/report?date=${date}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    setReport(res.data);
                    setLoadedAt(res.data.updatedAt);
                    setIsDirty(false);
                    localStorage.removeItem(draftKey(date));
                }
            })
            .finally(() => setLoading(false));
    }, [date]);

    return (
        <div className="report-grid">
            {/* 競合モーダル */}
            {conflictModal && (
                <div className="modal-overlay">
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">⚠ 他の人が更新しています</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                            この日報は他の人によって更新されました。<br />
                            最新データを読み込んでください。
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--orange)', marginBottom: 20 }}>
                            ※ 読み込むと現在入力中の内容は失われます。
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={handleConflictReload}>最新データを読み込む</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBlock: 10, marginBottom: 4, position: 'sticky', top: 0, zIndex: 90, background: 'var(--bg-page)' }}>
                <div className="date-nav">
                    <button className="date-nav-arrow" onClick={() => router.push(`/report/${prevDate(date)}`)}>◀</button>
                    <span className="date-display" style={{ cursor: 'pointer' }} onClick={() => datePickerRef.current?.showPicker()}>
                        📅 {formatDate(date)}
                    </span>
                    <input
                        ref={datePickerRef}
                        type="date"
                        value={date}
                        onChange={e => { if (e.target.value) router.push(`/report/${e.target.value}`); }}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                    />
                    <button className="date-nav-arrow" onClick={() => router.push(`/report/${nextDate(date)}`)}>▶</button>
                    <button className="date-nav-arrow" title="今日" onClick={() => router.push(`/report/${formatDateStr(new Date())}`)}>
                        今日
                    </button>
                    <button
                        className="btn no-print"
                        onClick={importFromPrevDay}
                        disabled={importing}
                        title="前日の入居者数・避難区分・介護度をコピーします"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--accent)', color: '#fff',
                            border: 'none', padding: '7px 14px', fontSize: '0.875rem',
                            fontWeight: 700, borderRadius: 'var(--radius-sm)',
                            boxShadow: '0 2px 8px rgba(0,153,204,0.3)',
                            cursor: importing ? 'not-allowed' : 'pointer',
                            opacity: importing ? 0.7 : 1,
                        }}
                    >
                        {importing
                            ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2, borderColor: '#fff', borderTopColor: 'transparent' }} /> 取り込み中...</>
                            : <>📥 前日から取り込む</>}
                    </button>
                </div>
            </div>

            {/* 下書き復元バナー */}
            {hasDraft && !loading && (
                <div className="no-print" style={{
                    background: 'rgba(217,119,6,0.08)',
                    border: '1px solid rgba(217,119,6,0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    color: 'var(--orange)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 8,
                }}>
                    <span>📝 未保存の下書きが見つかりました</span>
                    <button className="btn btn-sm" style={{ background: 'var(--orange)', color: '#fff', border: 'none' }} onClick={restoreDraft}>復元する</button>
                    <button className="btn btn-sm btn-secondary" onClick={discardDraft}>破棄</button>
                </div>
            )}

            {/* 右下固定ボタン */}
            <div className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                {(saveStatus !== 'idle' || isDirty) && (
                    <span className={`save-status ${saveStatusClass}`}>{statusIcon} {statusLabel}</span>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary btn-lg" onClick={() => window.print()} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>🖨 印刷</button>
                    <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} style={{ boxShadow: '0 4px 16px rgba(0,153,204,0.35)' }}>
                        {saving ? '保存中...' : '💾 保存'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* 出勤職員 */}
                    <AttendanceSection
                        roles={roles}
                        staff={staff}
                        attendance={report.attendance}
                        holidayCounts={report.holidayCounts ?? {}}
                        onChange={a => updateReport('attendance', a)}
                        onHolidayChange={h => updateReport('holidayCounts', h)}
                    />

                    {/* 夜勤巡視サイン */}
                    <NightRoundsSection
                        nightRounds={report.nightRounds ?? { floor1: {}, floor2: {} }}
                        onChange={v => updateReport('nightRounds', v)}
                        roles={roles}
                        staff={staff}
                        attendance={report.attendance}
                    />

                    {/* 入居者数 / 避難区分 / 介護度 */}
                    <div className="residents-block">
                        <div style={{ marginBottom: 4 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                🏠 入居者数 / 🚨 避難区分 / 📊 介護度
                            </span>
                        </div>
                        {/* フロア別整合性チェック */}
                        {(() => {
                            const r = report.residents;
                            const e = report.evacuation;
                            const c = report.careLevels;
                            const checks = [
                                {
                                    floor: '1F',
                                    res: r.floor1.male + r.floor1.female,
                                    eva: e.floor1.tanso + e.floor1.goso + e.floor1.dokuho,
                                    care: c.floor1.shien + c.floor1.care1 + c.floor1.care2 + c.floor1.care3 + c.floor1.care4 + c.floor1.care5,
                                },
                                {
                                    floor: '2F',
                                    res: r.floor2.male + r.floor2.female,
                                    eva: e.floor2.tanso + e.floor2.goso + e.floor2.dokuho,
                                    care: c.floor2.shien + c.floor2.care1 + c.floor2.care2 + c.floor2.care3 + c.floor2.care4 + c.floor2.care5,
                                },
                            ].filter(({ res, eva, care }) => res > 0 && (res !== eva || res !== care));
                            if (checks.length === 0) return null;
                            return (
                                <div className="no-print" style={{
                                    background: 'rgba(239,68,68,0.07)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '8px 14px',
                                    marginBottom: 8,
                                    fontSize: '0.82rem',
                                    color: '#dc2626',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}>
                                    <strong>⚠ 合計人数が一致していません</strong>
                                    {checks.map(({ floor, res, eva, care }) => (
                                        <span key={floor}>
                                            {floor}：入居者数 {res}名 ／ 避難区分 {eva}名 ／ 介護度 {care}名
                                        </span>
                                    ))}
                                </div>
                            );
                        })()}
                        <div className="report-row resident-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <ResidentSection
                                residents={report.residents}
                                onChange={v => updateReport('residents', v)}
                            />
                            <EvacuationSection
                                evacuation={report.evacuation}
                                onChange={v => updateReport('evacuation', v)}
                            />
                            <CareLevelSection
                                careLevels={report.careLevels}
                                totalResidents={(report.residents.floor1.male + report.residents.floor1.female + report.residents.floor2.male + report.residents.floor2.female)}
                                onChange={v => updateReport('careLevels', v)}
                            />
                        </div>
                    </div>

                    {/* テキスト記録・気温・入浴・備考 */}
                    <TextRecordsSection
                        report={report}
                        onChange={updateReport}
                    />
                </>
            )}

            <ToastContainer toasts={toasts} />
        </div>
    );
}
