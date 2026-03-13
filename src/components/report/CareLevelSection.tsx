'use client';

import { FloorCareLevels, CareLevelCounts } from '@/lib/types';

interface Props {
    careLevels: FloorCareLevels;
    totalResidents: number;
    onChange: (v: FloorCareLevels) => void;
}

type CLKey = keyof CareLevelCounts;
const CL_KEYS: { key: CLKey; label: string; weight: number }[] = [
    { key: 'shien', label: '支援', weight: 0 },
    { key: 'care1', label: '要介護1', weight: 1 },
    { key: 'care2', label: '要介護2', weight: 2 },
    { key: 'care3', label: '要介護3', weight: 3 },
    { key: 'care4', label: '要介護4', weight: 4 },
    { key: 'care5', label: '要介護5', weight: 5 },
];

function sumCL(cl: CareLevelCounts): number {
    return CL_KEYS.reduce((s, { key }) => s + (cl[key] || 0), 0);
}

function weightedSum(cl: CareLevelCounts): number {
    return CL_KEYS.reduce((s, { key, weight }) => s + (cl[key] || 0) * weight, 0);
}

export default function CareLevelSection({ careLevels, totalResidents, onChange }: Props) {
    const combined: CareLevelCounts = {
        shien: careLevels.floor1.shien + careLevels.floor2.shien,
        care1: careLevels.floor1.care1 + careLevels.floor2.care1,
        care2: careLevels.floor1.care2 + careLevels.floor2.care2,
        care3: careLevels.floor1.care3 + careLevels.floor2.care3,
        care4: careLevels.floor1.care4 + careLevels.floor2.care4,
        care5: careLevels.floor1.care5 + careLevels.floor2.care5,
    };

    const shienTotal = combined.shien || 0;
    const careOnlyCount = totalResidents - shienTotal;
    const denom = careOnlyCount > 0 ? careOnlyCount : 1;
    const avgCareLevel = (weightedSum(combined) / denom).toFixed(2);

    const update = (floor: 'floor1' | 'floor2', key: CLKey, val: number) => {
        onChange({
            ...careLevels,
            [floor]: { ...careLevels[floor], [key]: Math.max(0, val) },
        });
    };

    return (
        <div className="card">
            <div className="card-header">
                <span className="card-title">📊 介護度</span>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>平均介護度</div>
                    <div className="stat-value">{totalResidents > 0 ? avgCareLevel : '—'}</div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>介護度</th>
                            <th style={{ color: 'var(--blue)' }}>1F</th>
                            <th style={{ color: 'var(--purple)' }}>2F</th>
                            <th>合計</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CL_KEYS.map(({ key, label }) => {
                            const f1 = careLevels.floor1[key];
                            const f2 = careLevels.floor2[key];
                            return (
                                <tr key={key}>
                                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{label}</td>
                                    <td>
                                        <input type="number" min={0} className="num-input"
                                            value={f1}
                                            onChange={e => update('floor1', key, +e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input type="number" min={0} className="num-input"
                                            value={f2}
                                            onChange={e => update('floor2', key, +e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <span className={f1 + f2 > 0 ? 'total-badge' : ''} style={{ color: f1 + f2 === 0 ? 'var(--text-muted)' : undefined }}>
                                            {f1 + f2}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="totals-row">
                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>合計</td>
                            <td><span className="total-badge">{sumCL(careLevels.floor1)}</span></td>
                            <td><span className="total-badge">{sumCL(careLevels.floor2)}</span></td>
                            <td><span className="total-badge">{sumCL(combined)}</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {totalResidents > 0 && (
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    計算式：({CL_KEYS.filter(({ weight }) => weight > 0).map(({ label, key, weight }) =>
                        `${label}×${weight}(${combined[key]}名)`
                    ).join(' + ')}) ÷ {careOnlyCount}名（支援除く） = {avgCareLevel}
                </div>
            )}
        </div>
    );
}
