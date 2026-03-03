'use client';

import { DailyReport } from '@/lib/types';

interface Props {
    report: DailyReport;
    onChange: <K extends keyof DailyReport>(key: K, value: DailyReport[K]) => void;
}

export default function TextRecordsSection({ report, onChange }: Props) {
    const bathingTotal = report.bathing.floor1 + report.bathing.floor2;

    return (
        <div>
            {/* Row 1: 居室移動 / 入所者 / 退所者 / 受診 */}
            <div className="report-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: 16 }}>
                {/* 居室移動 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🚪 居室移動</span>
                    </div>
                    <textarea
                        placeholder="例：302号室 → 205号室（山田様）"
                        value={report.roomTransfer}
                        onChange={e => onChange('roomTransfer', e.target.value)}
                        style={{ minHeight: 90 }}
                    />
                </div>

                {/* 入所者 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🆕 入所者</span>
                    </div>
                    <textarea
                        placeholder="入所者氏名・詳細を入力..."
                        value={report.admission ?? ''}
                        onChange={e => onChange('admission', e.target.value)}
                        style={{ minHeight: 90 }}
                    />
                </div>

                {/* 退所者 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🔚 退所者</span>
                    </div>
                    <textarea
                        placeholder="退所者氏名・詳細を入力..."
                        value={report.discharge ?? ''}
                        onChange={e => onChange('discharge', e.target.value)}
                        style={{ minHeight: 90 }}
                    />
                </div>

                {/* 受診 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🏥 受診</span>
                    </div>
                    <textarea
                        placeholder="受診内容を入力..."
                        value={report.medicalVisit}
                        onChange={e => onChange('medicalVisit', e.target.value)}
                        style={{ minHeight: 90 }}
                    />
                </div>
            </div>

            {/* Row 2: 気温+湿度 / 入浴者数 / 備考 */}
            <div className="report-row text-records-row2" style={{ gridTemplateColumns: '200px 260px 1fr', marginBottom: 16 }}>
                {/* 気温・湿度 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🌡 気温・湿度</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="inline-field">
                            <label>気温</label>
                            <input type="number" step="0.1" className="num-input" style={{ width: 72 }}
                                value={report.temperature ?? ''}
                                placeholder="0.0"
                                onChange={e => onChange('temperature', e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>°C</span>
                        </div>
                        <div className="inline-field">
                            <label>湿度</label>
                            <input type="number" min={0} max={100} className="num-input" style={{ width: 72 }}
                                value={report.humidity ?? ''}
                                placeholder="0"
                                onChange={e => onChange('humidity', e.target.value === '' ? null : parseInt(e.target.value))}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>%</span>
                        </div>
                    </div>
                </div>

                {/* 入浴者数 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🛁 入浴者数</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="inline-field">
                            <label>1F</label>
                            <input type="number" min={0} className="num-input"
                                value={report.bathing.floor1}
                                onChange={e => onChange('bathing', { ...report.bathing, floor1: Math.max(0, +e.target.value) })}
                            />
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>名</span>
                        </div>
                        <div className="inline-field">
                            <label>2F</label>
                            <input type="number" min={0} className="num-input"
                                value={report.bathing.floor2}
                                onChange={e => onChange('bathing', { ...report.bathing, floor2: Math.max(0, +e.target.value) })}
                            />
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>名</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>合計</span>
                            <span className="stat-value" style={{ fontSize: '1.2rem' }}>{bathingTotal}</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>名</span>
                        </div>
                    </div>
                </div>

                {/* 備考 */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📝 備考</span>
                    </div>
                    <textarea
                        placeholder="特記事項を入力..."
                        value={report.remarks}
                        onChange={e => onChange('remarks', e.target.value)}
                        style={{ minHeight: 100 }}
                    />
                </div>

            </div>
        </div>
    );
}
