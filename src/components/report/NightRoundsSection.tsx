'use client';

import { useState, useRef, useEffect } from 'react';
import { Role, StaffMember, StaffAttendance } from '@/lib/types';

// 18:00〜翌8:00 の2時間ごとの時刻
const ROUND_HOURS = [18, 20, 22, 0, 2, 4, 6, 8];
const ACTIVE_TYPES = new Set(['日勤', '遅番', '夜勤']);

type FloorRounds = { floor1: Record<string, string>; floor2: Record<string, string> };

interface Props {
    nightRounds: FloorRounds;
    onChange: (v: FloorRounds) => void;
    roles: Role[];
    staff: StaffMember[];
    attendance: StaffAttendance[];
}

interface OpenCell {
    floor: 'floor1' | 'floor2';
    hour: number;
    top: number;
    left: number;
}

export default function NightRoundsSection({ nightRounds, onChange, roles, staff, attendance }: Props) {
    const [openCell, setOpenCell] = useState<OpenCell | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!openCell) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpenCell(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openCell]);

    // 出勤中のスタッフ（日勤・遅番・夜勤）
    const activeIds = new Set(attendance.filter(a => ACTIVE_TYPES.has(a.attendance)).map(a => a.staffId));
    const activeStaff = staff.filter(s => activeIds.has(s.id));

    const floor1RoleIds = new Set(roles.filter(r => r.floor === '1F').map(r => r.id));
    const floor2RoleIds = new Set(roles.filter(r => r.floor === '2F').map(r => r.id));
    const floor1Staff = activeStaff.filter(s => floor1RoleIds.has(s.roleId));
    const floor2Staff = activeStaff.filter(s => floor2RoleIds.has(s.roleId));
    const otherStaff = activeStaff.filter(s => !floor1RoleIds.has(s.roleId) && !floor2RoleIds.has(s.roleId));

    const handleCellClick = (e: React.MouseEvent, floor: 'floor1' | 'floor2', hour: number) => {
        if (openCell?.floor === floor && openCell?.hour === hour) {
            setOpenCell(null);
            return;
        }
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setOpenCell({ floor, hour, top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    };

    const set = (floor: 'floor1' | 'floor2', hour: number, val: string) => {
        onChange({ ...nightRounds, [floor]: { ...nightRounds[floor], [String(hour)]: val } });
        setOpenCell(null);
    };

    const FLOORS: { key: 'floor1' | 'floor2'; label: string; color: string }[] = [
        { key: 'floor1', label: '1F', color: 'var(--blue)' },
        { key: 'floor2', label: '2F', color: 'var(--purple)' },
    ];

    const currentVal = openCell ? (nightRounds[openCell.floor][String(openCell.hour)] ?? '') : '';

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🌙 夜勤巡視サイン</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>18:00 〜 翌 8:00（2時間ごと）</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
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
                        {FLOORS.map(({ key, label, color }) => (
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
                                    const isOpen = openCell?.floor === key && openCell?.hour === h;
                                    return (
                                        <td key={h} style={{ padding: '3px 2px' }}>
                                            <button
                                                onClick={e => handleCellClick(e, key, h)}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    padding: '5px 2px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: signed ? 600 : 400,
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: `1px solid ${isOpen ? 'var(--accent)' : signed ? 'var(--accent-border)' : 'var(--border)'}`,
                                                    background: isOpen ? 'var(--accent-dim)' : signed ? 'var(--accent-dim)' : 'var(--bg-input)',
                                                    color: signed ? 'var(--accent)' : 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    minWidth: 48,
                                                }}
                                            >
                                                {val || '—'}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ポップオーバー */}
            {openCell && (
                <div
                    ref={popoverRef}
                    style={{
                        position: 'fixed',
                        top: openCell.top,
                        left: openCell.left,
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        padding: 12,
                        minWidth: 240,
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                        {[
                            { label: '1F', color: 'var(--blue)', staffList: floor1Staff },
                            { label: '2F', color: 'var(--purple)', staffList: floor2Staff },
                        ].map(({ label: floorLabel, color, staffList }) => (
                            <div key={floorLabel}>
                                <div style={{
                                    fontSize: '0.68rem', color, fontWeight: 700,
                                    marginBottom: 6, textAlign: 'center',
                                    borderBottom: `2px solid ${color}`, paddingBottom: 3,
                                }}>
                                    {floorLabel}
                                </div>
                                {staffList.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => set(openCell.floor, openCell.hour, s.name)}
                                        style={{
                                            display: 'block', width: '100%',
                                            padding: '5px 8px', fontSize: '0.78rem',
                                            textAlign: 'left',
                                            background: currentVal === s.name ? 'var(--accent-dim)' : 'transparent',
                                            color: currentVal === s.name ? 'var(--accent)' : 'var(--text-primary)',
                                            border: 'none', borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontWeight: currentVal === s.name ? 600 : 400,
                                        }}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                                {staffList.length === 0 && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 8px', display: 'block' }}>なし</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {otherStaff.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {otherStaff.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => set(openCell.floor, openCell.hour, s.name)}
                                    style={{
                                        padding: '4px 8px', fontSize: '0.75rem',
                                        background: currentVal === s.name ? 'var(--accent-dim)' : 'var(--bg-input)',
                                        color: currentVal === s.name ? 'var(--accent)' : 'var(--text-primary)',
                                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 6 }}>
                        <button
                            onClick={() => set(openCell.floor, openCell.hour, '')}
                            style={{
                                display: 'block', width: '100%',
                                padding: '5px 8px', fontSize: '0.75rem',
                                textAlign: 'center',
                                background: 'transparent', color: 'var(--text-muted)',
                                border: 'none', borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                            }}
                        >
                            × クリア
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
