'use client';

import type { FloorEvacuation, EvacuationCounts } from '@/lib/types';

interface Props {
    evacuation: FloorEvacuation;
    onChange: (v: FloorEvacuation) => void;
}

function NumRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <tr>
            <td style={{ padding: '5px 0', color: 'var(--text-secondary)', fontSize: '0.82rem', width: 44 }}>{label}</td>
            <td style={{ padding: '5px 0' }}>
                <input type="number" min={0} className="num-input"
                    value={value}
                    onChange={e => onChange(Math.max(0, +e.target.value))}
                />
            </td>
            <td style={{ padding: '5px 0 5px 6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>名</td>
        </tr>
    );
}

function FloorEvacuation({ label, color, value, onChange }: {
    label: string; color: string; value: EvacuationCounts;
    onChange: (v: EvacuationCounts) => void;
}) {
    const total = value.tanso + value.goso + value.dokuho;
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color, marginBottom: 8 }}>{label}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <NumRow label="担送" value={value.tanso} onChange={v => onChange({ ...value, tanso: v })} />
                    <NumRow label="護送" value={value.goso} onChange={v => onChange({ ...value, goso: v })} />
                    <NumRow label="独歩" value={value.dokuho} onChange={v => onChange({ ...value, dokuho: v })} />
                    <tr>
                        <td style={{ paddingTop: 6, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>計</td>
                        <td style={{ paddingTop: 6 }}><span className="total-badge">{total}</span></td>
                        <td style={{ paddingTop: 6, paddingLeft: 6, color: 'var(--text-muted)', fontSize: '0.78rem' }}>名</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default function EvacuationSection({ evacuation, onChange }: Props) {
    const totalTanso = evacuation.floor1.tanso + evacuation.floor2.tanso;
    const totalGoso = evacuation.floor1.goso + evacuation.floor2.goso;
    const totalDokuho = evacuation.floor1.dokuho + evacuation.floor2.dokuho;

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">🚨 避難区分</span>
            </div>
            <FloorEvacuation label="1F" color="var(--blue)"
                value={evacuation.floor1}
                onChange={v => onChange({ ...evacuation, floor1: v })} />
            <FloorEvacuation label="2F" color="var(--purple)"
                value={evacuation.floor2}
                onChange={v => onChange({ ...evacuation, floor2: v })} />
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                担送 <span className="total-badge" style={{ marginLeft: 4 }}>{totalTanso}</span>
                &nbsp;&nbsp;護送 <span className="total-badge">{totalGoso}</span>
                &nbsp;&nbsp;独歩 <span className="total-badge">{totalDokuho}</span>
            </div>
        </div>
    );
}
