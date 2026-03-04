'use client';

import { useState } from 'react';
import { Role, StaffMember, StaffAttendance, AttendanceType, RoleHolidayCounts } from '@/lib/types';

const SHIFT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    '日勤': { label: '日勤', color: '#0099cc', bg: 'rgba(0,153,204,0.1)', border: 'rgba(0,153,204,0.4)' },
    '遅番': { label: '遅番', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.4)' },
    '夜勤': { label: '夜勤', color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.4)' },
    '研修・出張': { label: '研修・出張', color: '#0d9488', bg: 'rgba(13,148,136,0.1)', border: 'rgba(13,148,136,0.4)' },
    '公休': { label: '公休', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.4)' },
    '年休': { label: '年休', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.4)' },
    '欠勤': { label: '欠勤', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)' },
};

const SHIFT_TYPES: AttendanceType[] = ['日勤', '遅番', '夜勤', '研修・出張'];

interface Props {
    roles: Role[];
    staff: StaffMember[];
    attendance: StaffAttendance[];
    holidayCounts: Record<string, RoleHolidayCounts>;
    onChange: (a: StaffAttendance[]) => void;
    onHolidayChange: (h: Record<string, RoleHolidayCounts>) => void;
}

function getAtt(attendance: StaffAttendance[], staffId: string): AttendanceType {
    return attendance.find(a => a.staffId === staffId)?.attendance ?? '';
}

function getStaffOfShift(attendance: StaffAttendance[], staffIds: string[], type: AttendanceType): string[] {
    return staffIds.filter(id => getAtt(attendance, id) === type);
}

function toggleStaff(attendance: StaffAttendance[], staffId: string, type: AttendanceType): StaffAttendance[] {
    const current = getAtt(attendance, staffId);
    const next: AttendanceType = current === type ? '' : type;
    const exists = attendance.find(a => a.staffId === staffId);
    if (exists) return attendance.map(a => a.staffId === staffId ? { ...a, attendance: next } : a);
    return [...attendance, { staffId, attendance: next }];
}

/* ── シフト選択モーダル ── */
function ShiftModal({ type, role, roleStaff, attendance, onToggle, onClose }: {
    type: AttendanceType; role: Role; roleStaff: StaffMember[];
    attendance: StaffAttendance[]; onToggle: (id: string) => void; onClose: () => void;
}) {
    const cfg = SHIFT_CONFIG[type];
    const selected = getStaffOfShift(attendance, roleStaff.map(s => s.id), type).length;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 'var(--radius-sm)', padding: '4px 14px', color: cfg.color, fontWeight: 700, fontSize: '1rem' }}>
                        {cfg.label}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{role.name}</div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected}名選択</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
                    {roleStaff.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20, fontSize: '0.875rem' }}>職員が登録されていません</p>
                    )}
                    {roleStaff.map(s => {
                        const checked = getAtt(attendance, s.id) === type;
                        const otherAtt = getAtt(attendance, s.id);
                        return (
                            <label key={s.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                background: checked ? cfg.bg : 'var(--bg-input)',
                                border: `1px solid ${checked ? cfg.border : 'var(--border)'}`,
                                transition: 'all 0.12s',
                            }}>
                                <input type="checkbox" checked={checked} onChange={() => onToggle(s.id)}
                                    style={{ width: 16, height: 16, accentColor: cfg.color, cursor: 'pointer' }} />
                                <span style={{ flex: 1, fontWeight: checked ? 600 : 400, color: checked ? cfg.color : 'var(--text-primary)' }}>
                                    {s.name}
                                </span>
                                {otherAtt && otherAtt !== type && (
                                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: SHIFT_CONFIG[otherAtt]?.bg, color: SHIFT_CONFIG[otherAtt]?.color, border: `1px solid ${SHIFT_CONFIG[otherAtt]?.border}`, borderRadius: 4 }}>
                                        {otherAtt}
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={onClose}>完了</button>
                </div>
            </div>
        </div>
    );
}

/* ── メイン ── */
export default function AttendanceSection({ roles, staff, attendance, holidayCounts, onChange, onHolidayChange }: Props) {
    const [modal, setModal] = useState<{ roleId: string; type: AttendanceType } | null>(null);

    const getHoliday = (roleId: string): RoleHolidayCounts =>
        holidayCounts[roleId] ?? { kokyu: 0, nenkyu: 0, kekkinn: 0 };

    const setHoliday = (roleId: string, key: keyof RoleHolidayCounts, val: number) => {
        onHolidayChange({
            ...holidayCounts,
            [roleId]: { ...getHoliday(roleId), [key]: Math.max(0, val) },
        });
    };

    const handleToggle = (staffId: string) => {
        if (!modal) return;
        onChange(toggleStaff(attendance, staffId, modal.type));
    };

    const modalRole = modal ? roles.find(r => r.id === modal.roleId) : null;
    const modalStaff = modal ? staff.filter(s => s.roleId === modal.roleId) : [];

    // 全体集計
    const totalByShift = (type: AttendanceType) => staff.filter(s => getAtt(attendance, s.id) === type).length;
    const totalHoliday = (key: keyof RoleHolidayCounts) => roles.reduce((sum, r) => sum + (getHoliday(r.id)[key] ?? 0), 0);

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">👔 出勤職員</span>
                {staff.length === 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--orange)' }}>⚠ 職員管理から職員を登録してください</span>
                )}
            </div>

            {roles.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 20 }}>
                    「職員管理」ページで職種・職員を設定してください
                </p>
            ) : (
                <>
                    {/* ── 職種ごとの行 ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {roles.map(role => {
                            const roleStaff = staff.filter(s => s.roleId === role.id);
                            if (roleStaff.length === 0) return null;
                            const staffIds = roleStaff.map(s => s.id);
                            const unset = staffIds.filter(id => !getAtt(attendance, id)).length;
                            const hol = getHoliday(role.id);
                            const assigned = roleStaff
                                .filter(s => getAtt(attendance, s.id))
                                .sort((a, b) => {
                                    const ai = SHIFT_TYPES.indexOf(getAtt(attendance, a.id));
                                    const bi = SHIFT_TYPES.indexOf(getAtt(attendance, b.id));
                                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                                });

                            return (
                                <div key={role.id}>
                                    {/* 職種名 */}
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: role.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                        ▸ {role.name}
                                        {unset > 0 && <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>（{unset}名未設定）</span>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr', gap: 8, alignItems: 'start' }}>
                                        {/* 左列: ボタン + 選択済みチップ */}
                                        <div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {SHIFT_TYPES.map(type => {
                                                    const cfg = SHIFT_CONFIG[type];
                                                    const count = getStaffOfShift(attendance, staffIds, type).length;
                                                    const active = count > 0;
                                                    return (
                                                        <button key={type}
                                                            onClick={() => setModal({ roleId: role.id, type })}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 6,
                                                                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                                                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                                                                border: 'none', fontFamily: 'inherit',
                                                                background: active ? cfg.bg : 'var(--bg-input)',
                                                                color: active ? cfg.color : 'var(--text-muted)',
                                                                outline: `1.5px solid ${active ? cfg.border : 'var(--border)'}`,
                                                                transition: 'all 0.15s', minWidth: 68, justifyContent: 'space-between',
                                                            }}>
                                                            <span>{type}</span>
                                                            <span style={{
                                                                background: active ? cfg.color : 'var(--gray-dim)',
                                                                color: active ? '#fff' : 'var(--text-muted)',
                                                                borderRadius: 10, minWidth: 20, height: 20,
                                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.72rem', fontWeight: 700, padding: '0 5px',
                                                            }}>{count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* 選択済みチップ（ボタンの直下） */}
                                            {assigned.length > 0 && (
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                                                    {assigned.map(s => {
                                                        const att = getAtt(attendance, s.id);
                                                        const cfg = SHIFT_CONFIG[att];
                                                        return (
                                                            <span key={s.id} title={`${att}：クリックで変更`}
                                                                style={{ fontSize: '0.95rem', padding: '3px 12px', borderRadius: 12, background: cfg?.bg, color: cfg?.color, border: `1px solid ${cfg?.border}`, cursor: 'pointer' }}
                                                                onClick={() => setModal({ roleId: role.id, type: att })}>
                                                                {s.name}<span style={{ marginLeft: 5, opacity: 0.7, fontSize: '0.88rem' }}>{att}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* 右列: 公休・年休・欠勤 */}
                                        <div style={{
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '4px 8px',
                                            background: 'var(--bg-input)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,
                                        }}>
                                            {([
                                                { key: 'kokyu' as const, label: '公休', cfg: SHIFT_CONFIG['公休'] },
                                                { key: 'nenkyu' as const, label: '年休', cfg: SHIFT_CONFIG['年休'] },
                                                { key: 'kekkinn' as const, label: '欠勤', cfg: SHIFT_CONFIG['欠勤'] },
                                            ]).map(({ key, label, cfg }) => (
                                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ fontSize: '0.75rem', color: cfg.color, fontWeight: 600, minWidth: 28 }}>{label}</span>
                                                    <input
                                                        type="number" min={0}
                                                        value={hol[key]}
                                                        onChange={e => setHoliday(role.id, key, +e.target.value)}
                                                        style={{
                                                            width: 42, textAlign: 'center', padding: '2px 4px',
                                                            background: hol[key] > 0 ? cfg.bg : 'var(--bg-card)',
                                                            border: `1px solid ${hol[key] > 0 ? cfg.border : 'var(--border)'}`,
                                                            borderRadius: 'var(--radius-sm)', color: hol[key] > 0 ? cfg.color : 'var(--text-primary)',
                                                            fontSize: '0.82rem', fontWeight: 600,
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>名</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── 全体合計 ── */}
                    {roles.length > 1 && (
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>全体：</span>
                            {SHIFT_TYPES.map(t => {
                                const cfg = SHIFT_CONFIG[t]; const n = totalByShift(t);
                                return n > 0 ? <span key={t} style={{ color: cfg.color, fontWeight: 600 }}>{t} {n}名</span> : null;
                            })}
                            {(['kokyu', 'nenkyu', 'kekkinn'] as const).map((k, i) => {
                                const n = totalHoliday(k); const cfg = SHIFT_CONFIG[['公休', '年休', '欠勤'][i]];
                                return n > 0 ? <span key={k} style={{ color: cfg.color, fontWeight: 600 }}>{['公休', '年休', '欠勤'][i]} {n}名</span> : null;
                            })}
                        </div>
                    )}
                </>
            )}

            {modal && modalRole && (
                <ShiftModal type={modal.type} role={modalRole} roleStaff={modalStaff}
                    attendance={attendance} onToggle={handleToggle} onClose={() => setModal(null)} />
            )}
        </div>
    );
}
