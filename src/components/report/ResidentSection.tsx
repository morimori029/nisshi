'use client';

import { ResidentCounts, FloorResidents } from '@/lib/types';

interface Props {
    residents: ResidentCounts;
    onChange: (v: ResidentCounts) => void;
}

function FloorInput({
    label, color, value, onChange
}: { label: string; color: string; value: FloorResidents; onChange: (v: FloorResidents) => void }) {
    const total = value.male + value.female;
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color, marginBottom: 8, textTransform: 'uppercase' }}>
                {label}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-secondary)', fontSize: '0.82rem', width: 40 }}>男性</td>
                        <td style={{ padding: '4px 0' }}>
                            <input
                                type="number" min={0} className="num-input"
                                value={value.male}
                                onChange={e => onChange({ ...value, male: Math.max(0, +e.target.value) })}
                            />
                        </td>
                        <td style={{ padding: '4px 0 4px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>名</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>女性</td>
                        <td style={{ padding: '4px 0' }}>
                            <input
                                type="number" min={0} className="num-input"
                                value={value.female}
                                onChange={e => onChange({ ...value, female: Math.max(0, +e.target.value) })}
                            />
                        </td>
                        <td style={{ padding: '4px 0 4px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>名</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>計</td>
                        <td style={{ padding: '6px 0 0' }}>
                            <span className="total-badge">{total}</span>
                        </td>
                        <td style={{ padding: '6px 0 0 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>名</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default function ResidentSection({ residents, onChange }: Props) {
    const totalMale = residents.floor1.male + residents.floor2.male;
    const totalFemale = residents.floor1.female + residents.floor2.female;
    const grandTotal = totalMale + totalFemale;

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🏠 入居者数</span>
            </div>
            <FloorInput
                label="1F" color="var(--blue)"
                value={residents.floor1}
                onChange={v => onChange({ ...residents, floor1: v })}
            />
            <FloorInput
                label="2F" color="var(--purple)"
                value={residents.floor2}
                onChange={v => onChange({ ...residents, floor2: v })}
            />
            {/* Grand total */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>全体合計</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>男 {totalMale} / 女 {totalFemale}</span>
                    <span className="stat-value">{grandTotal}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>名</span>
                </div>
            </div>
        </div>
    );
}
