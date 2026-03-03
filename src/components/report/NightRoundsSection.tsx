'use client';

import { Role, StaffMember, StaffAttendance } from '@/lib/types';

// 18:00〜翌8:00 の2時間ごとの時刻
const ROUND_HOURS = [18, 20, 22, 0, 2, 4, 6, 8];

type FloorRounds = { floor1: Record<string, string>; floor2: Record<string, string> };

interface Props {
    nightRounds: FloorRounds;
    onChange: (v: FloorRounds) => void;
    roles: Role[];
    staff: StaffMember[];
    attendance: StaffAttendance[];
}

export default function NightRoundsSection({ nightRounds, onChange, roles, staff, attendance }: Props) {
    // 夜勤スタッフのIDセット
    const yakinIds = new Set(attendance.filter(a => a.attendance === '夜勤').map(a => a.staffId));

    // フロア別の夜勤スタッフを返す
    function getFloorYakin(floorKey: '1F' | '2F'): StaffMember[] {
        const floorRoleIds = new Set(roles.filter(r => r.floor === floorKey).map(r => r.id));
        return staff.filter(s => yakinIds.has(s.id) && floorRoleIds.has(s.roleId));
    }

    const floor1Yakin = getFloorYakin('1F');
    const floor2Yakin = getFloorYakin('2F');

    const set = (floor: 'floor1' | 'floor2', hour: number, val: string) => {
        onChange({
            ...nightRounds,
            [floor]: { ...nightRounds[floor], [String(hour)]: val },
        });
    };

    const FLOORS: { key: 'floor1' | 'floor2'; label: string; color: string; options: StaffMember[] }[] = [
        { key: 'floor1', label: '1F', color: 'var(--blue)', options: floor1Yakin },
        { key: 'floor2', label: '2F', color: 'var(--purple)', options: floor2Yakin },
    ];

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🌙 夜勤巡視サイン</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>18:00 〜 翌 8:00（2時間ごと）</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 36 }} />
                            {ROUND_HOURS.map(h => (
                                <th key={h} style={{
                                    textAlign: 'center', fontSize: '0.72rem',
                                    color: 'var(--text-muted)', padding: '4px 3px',
                                    fontWeight: 600, whiteSpace: 'nowrap',
                                }}>
                                    {h}:00
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {FLOORS.map(({ key, label, color, options }) => (
                            <tr key={key}>
                                <td style={{
                                    fontSize: '0.78rem', fontWeight: 700,
                                    color, paddingRight: 6, whiteSpace: 'nowrap',
                                    paddingTop: 4, paddingBottom: 4,
                                }}>
                                    {label}
                                </td>
                                {ROUND_HOURS.map(h => {
                                    const val = nightRounds[key][String(h)] ?? '';
                                    const signed = val !== '';
                                    return (
                                        <td key={h} style={{ padding: '3px 2px' }}>
                                            {options.length > 0 ? (
                                                <select
                                                    value={val}
                                                    onChange={e => set(key, h, e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'center',
                                                        padding: '4px 2px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: signed ? 600 : 400,
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: `1px solid ${signed ? 'var(--accent-border)' : 'var(--border)'}`,
                                                        background: signed ? 'var(--accent-dim)' : 'var(--bg-input)',
                                                        color: signed ? 'var(--accent)' : 'var(--text-muted)',
                                                        cursor: 'pointer',
                                                        appearance: 'none',
                                                    }}
                                                >
                                                    <option value="">—</option>
                                                    {options.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="—"
                                                    value={val}
                                                    onChange={e => set(key, h, e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'center',
                                                        padding: '5px 2px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: signed ? 600 : 400,
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: `1px solid ${signed ? 'var(--accent-border)' : 'var(--border)'}`,
                                                        background: signed ? 'var(--accent-dim)' : 'var(--bg-input)',
                                                        color: signed ? 'var(--accent)' : 'var(--text-primary)',
                                                        transition: 'all 0.15s',
                                                    }}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
