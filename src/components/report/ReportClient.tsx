'use client';

import { useEffect, useState, useCallback } from 'react';
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

    // Load roles & staff
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
        fetch(`/api/report?date=${date}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    setReport(res.data);
                }
            })
            .finally(() => setLoading(false));
    }, [date]);

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
                body: JSON.stringify(report),
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus('saved');
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
    }, [report, addToast]);

    const updateReport = useCallback(<K extends keyof DailyReport>(key: K, value: DailyReport[K]) => {
        setReport(prev => ({ ...prev, [key]: value }));
    }, []);

    // 前日から入居者数・避難区分・介護度を取り込む
    const importFromPrevDay = useCallback(async () => {
        setImporting(true);
        try {
            const prev = prevDate(date);
            const res = await fetch(`/api/report?date=${prev}`);
            const data = await res.json();
            if (data.success && data.data) {
                const prevReport: DailyReport = data.data;
                setReport(cur => ({
                    ...cur,
                    residents: prevReport.residents,
                    evacuation: prevReport.evacuation,
                    careLevels: prevReport.careLevels,
                }));
                addToast('前日のデータを取り込みました', 'success');
            } else {
                addToast('前日の日報データが見つかりません', 'error');
            }
        } catch {
            addToast('取り込みに失敗しました', 'error');
        } finally {
            setImporting(false);
        }
    }, [date, addToast]);

    const statusIcon = { idle: '', saving: '⏳', saved: '✅', error: '❌' }[saveStatus];
    const statusLabel = { idle: '', saving: '保存中...', saved: '保存済み', error: 'エラー' }[saveStatus];

    return (
        <div className="report-grid">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-page)', paddingBlock: 10, marginBottom: 4 }}>
                <div className="date-nav">
                    <button className="date-nav-arrow" onClick={() => router.push(`/report/${prevDate(date)}`)}>◀</button>
                    <span className="date-display">{formatDate(date)}</span>
                    <button className="date-nav-arrow" onClick={() => router.push(`/report/${nextDate(date)}`)}>▶</button>
                    <button className="date-nav-arrow" title="今日" onClick={() => router.push(`/report/${formatDateStr(new Date())}`)}>
                        今日
                    </button>
                </div>
            </div>

            {/* 右下固定ボタン */}
            <div className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                {saveStatus !== 'idle' && (
                    <span className={`save-status ${saveStatus}`}>{statusIcon} {statusLabel}</span>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => window.print()} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>🖨 印刷</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ boxShadow: '0 4px 16px rgba(0,153,204,0.35)' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                🏠 入居者数 / 🚨 避難区分 / 📊 介護度
                            </span>
                            <button
                                className="btn btn-secondary btn-sm no-print"
                                onClick={importFromPrevDay}
                                disabled={importing}
                                title="前日の入居者数・避難区分・介護度をコピーします"
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                {importing
                                    ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> 取り込み中...</>
                                    : <>📥 前日から取り込む</>}
                            </button>
                        </div>
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
