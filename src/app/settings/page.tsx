'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Role, StaffMember } from '@/lib/types';
import { ToastContainer, useToast } from '@/components/Toast';

const PRESET_COLORS = [
    '#00d4aa', '#3b82f6', '#8b5cf6', '#f59e0b',
    '#ef4444', '#10b981', '#f97316', '#ec4899',
];

/* ========================
   職種モーダル（追加・編集）
   ======================== */
function RoleModal({ initial, onSave, onClose }: {
    initial?: Role | null;
    onSave: (r: Omit<Role, 'id'> & { id?: string }) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
    const [floor, setFloor] = useState<'1F' | '2F' | ''>(initial?.floor ?? '');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ id: initial?.id, name: name.trim(), color, order: initial?.order ?? 999, floor });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{initial ? '職種を編集' : '職種を追加'}</h3>
                <div className="form-group">
                    <label className="form-label">職種名</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="例：看護師" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); }} />
                </div>
                <div className="form-group">
                    <label className="form-label">カラー</label>
                    <div className="color-swatches">
                        {PRESET_COLORS.map(c => (
                            <div key={c} className={`color-swatch ${color === c ? 'selected' : ''}`}
                                style={{ background: c }} onClick={() => setColor(c)} />
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">フロア（夜勤巡視用）</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['', '1F', '2F'] as const).map(f => (
                            <button key={f} type="button"
                                onClick={() => setFloor(f)}
                                style={{
                                    padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                    border: 'none', fontFamily: 'inherit',
                                    background: floor === f ? 'var(--accent)' : 'var(--bg-input)',
                                    color: floor === f ? '#fff' : 'var(--text-muted)',
                                    outline: `1.5px solid ${floor === f ? 'var(--accent)' : 'var(--border)'}`,
                                }}>
                                {f === '' ? '未設定' : f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ========================
   職員編集モーダル（編集のみ）
   ======================== */
function StaffEditModal({ initial, roles, onSave, onClose }: {
    initial: StaffMember;
    roles: Role[];
    onSave: (s: StaffMember) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial.name);
    const [roleId, setRoleId] = useState(initial.roleId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">職員を編集</h3>
                <div className="form-group">
                    <label className="form-label">氏名</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="例：山田 花子" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter' && name.trim() && roleId) onSave({ ...initial, name: name.trim(), roleId }); }} />
                </div>
                <div className="form-group">
                    <label className="form-label">職種</label>
                    <select value={roleId} onChange={e => setRoleId(e.target.value)}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
                    <button className="btn btn-primary" onClick={() => { if (name.trim() && roleId) onSave({ ...initial, name: name.trim(), roleId }); }}>
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}

const SETTINGS_PASSWORD = 'ajisaistaff';

/* ========================
   パスワードゲート
   ======================== */
function PasswordGate({ onAuth }: { onAuth: () => void }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = () => {
        if (input === SETTINGS_PASSWORD) {
            sessionStorage.setItem('settings_auth', '1');
            onAuth();
        } else {
            setError(true);
            setInput('');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: 320, padding: '32px 28px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>🔒 職員管理</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
                    パスワードを入力してください
                </p>
                <input
                    type="password"
                    value={input}
                    onChange={e => { setInput(e.target.value); setError(false); }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder="パスワード"
                    autoFocus
                    style={{ width: '100%', marginBottom: 8 }}
                />
                {error && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--red)', marginBottom: 8 }}>
                        パスワードが違います
                    </p>
                )}
                <button className="btn btn-primary" onClick={handleSubmit} style={{ width: '100%' }}>
                    ログイン
                </button>
            </div>
        </div>
    );
}

/* ========================
   メインページ
   ======================== */
export default function SettingsPage() {
    const { toasts, addToast } = useToast();
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('settings_auth') === '1') setAuthed(true);
    }, []);

    const [roles, setRoles] = useState<Role[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [roleModal, setRoleModal] = useState<{ open: boolean; editing: Role | null }>({ open: false, editing: null });
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    // クイック追加用
    const [quickName, setQuickName] = useState('');
    const [adding, setAdding] = useState(false);
    const quickInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        const [rolesRes, staffRes] = await Promise.all([
            fetch('/api/roles').then(r => r.json()),
            fetch('/api/staff').then(r => r.json()),
        ]);
        if (rolesRes.success) {
            setRoles(rolesRes.data);
            setSelectedRoleId(prev => prev ?? rolesRes.data[0]?.id ?? null);
        }
        if (staffRes.success) setStaff(staffRes.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, []);

    // 職種切り替え時にインライン入力にフォーカス
    useEffect(() => {
        if (selectedRoleId) {
            setTimeout(() => quickInputRef.current?.focus(), 80);
        }
    }, [selectedRoleId]);

    /* ------ Role actions ------ */
    const saveRole = async (r: Omit<Role, 'id'> & { id?: string }) => {
        const method = r.id ? 'PUT' : 'POST';
        const body = r.id ? r : { name: r.name, color: r.color, order: roles.length };
        const res = await fetch('/api/roles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) {
            addToast(r.id ? '職種を更新しました' : '職種を追加しました');
            setRoleModal({ open: false, editing: null });
            if (!r.id && data.data) setSelectedRoleId(data.data.id);
            await load();
        } else addToast('エラー: ' + data.error, 'error');
    };

    const deleteRole = async (id: string) => {
        if (!confirm('この職種を削除しますか？')) return;
        const res = await fetch('/api/roles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (data.success) { addToast('職種を削除しました'); await load(); }
        else addToast('削除エラー: ' + data.error, 'error');
    };

    /* ------ Staff actions ------ */

    // クイック追加（Enterキー or ＋ボタン）
    const quickAddStaff = async () => {
        const name = quickName.trim();
        if (!name || !selectedRoleId || adding) return;
        setAdding(true);
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, roleId: selectedRoleId, order: staff.filter(s => s.roleId === selectedRoleId).length }),
            });
            const data = await res.json();
            if (data.success) {
                setQuickName('');
                // 楽観的更新：即座にリストに追加
                setStaff(prev => [...prev, data.data]);
                quickInputRef.current?.focus();
            } else {
                addToast('追加エラー: ' + data.error, 'error');
            }
        } finally {
            setAdding(false);
        }
    };

    const updateStaff = async (s: StaffMember) => {
        const res = await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
        const data = await res.json();
        if (data.success) {
            addToast('職員を更新しました');
            setEditingStaff(null);
            await load();
        } else addToast('更新エラー: ' + data.error, 'error');
    };

    const deleteStaff = async (id: string) => {
        if (!confirm('この職員を削除しますか？')) return;
        const res = await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (data.success) {
            addToast('職員を削除しました');
            setStaff(prev => prev.filter(s => s.id !== id));
        } else addToast('削除エラー: ' + data.error, 'error');
    };

    const updateStaffStatus = async (id: string, status: 'active' | 'retired') => {
        const label = status === 'retired' ? '退職' : '復職';
        const res = await fetch('/api/staff', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
        const data = await res.json();
        if (data.success) {
            addToast(`${label}に変更しました`);
            setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        } else addToast('更新エラー: ' + data.error, 'error');
    };

    /* ------ Drag & Drop ------ */
    const dragItem = useRef<string | null>(null);
    const [dragOverRoleId, setDragOverRoleId] = useState<string | null>(null);
    const [dragOverStaffId, setDragOverStaffId] = useState<string | null>(null);

    const handleRoleDrop = async (targetId: string) => {
        const fromId = dragItem.current;
        setDragOverRoleId(null);
        dragItem.current = null;
        if (!fromId || fromId === targetId) return;
        const fromIdx = roles.findIndex(r => r.id === fromId);
        const toIdx = roles.findIndex(r => r.id === targetId);
        if (fromIdx < 0 || toIdx < 0) return;
        const newRoles = [...roles];
        const [moved] = newRoles.splice(fromIdx, 1);
        newRoles.splice(toIdx, 0, moved);
        setRoles(newRoles);
        await fetch('/api/roles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: newRoles.map(r => r.id) }) });
    };

    const handleStaffDrop = async (targetId: string) => {
        const fromId = dragItem.current;
        setDragOverStaffId(null);
        dragItem.current = null;
        if (!fromId || fromId === targetId) return;
        const roleStaff = staff.filter(s => s.roleId === selectedRoleId);
        const otherStaff = staff.filter(s => s.roleId !== selectedRoleId);
        const fromIdx = roleStaff.findIndex(s => s.id === fromId);
        const toIdx = roleStaff.findIndex(s => s.id === targetId);
        if (fromIdx < 0 || toIdx < 0) return;
        const newRoleStaff = [...roleStaff];
        const [moved] = newRoleStaff.splice(fromIdx, 1);
        newRoleStaff.splice(toIdx, 0, moved);
        setStaff([...otherStaff, ...newRoleStaff]);
        await fetch('/api/staff', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: newRoleStaff.map(s => s.id) }) });
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);
    const activeStaff = staff.filter(s => s.roleId === selectedRoleId && s.status !== 'retired');
    const retiredStaff = staff.filter(s => s.roleId === selectedRoleId && s.status === 'retired');

    if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>👥 職員管理</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    職種を選択して職員を追加してください
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            ) : (
                <div className="grid-2" style={{ alignItems: 'start' }}>

                    {/* ===== 職種一覧 ===== */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">職種一覧</span>
                            <button className="btn btn-primary btn-sm" onClick={() => setRoleModal({ open: true, editing: null })}>
                                ＋ 職種追加
                            </button>
                        </div>
                        {roles.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 20 }}>
                                まず職種を追加してください
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {roles.map(role => (
                                    <div key={role.id}
                                        draggable
                                        onDragStart={() => { dragItem.current = role.id; }}
                                        onDragOver={e => { e.preventDefault(); setDragOverRoleId(role.id); }}
                                        onDragLeave={() => setDragOverRoleId(null)}
                                        onDrop={() => handleRoleDrop(role.id)}
                                        onDragEnd={() => { setDragOverRoleId(null); dragItem.current = null; }}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                            cursor: 'grab',
                                            background: dragOverRoleId === role.id ? 'var(--accent-dim)' : selectedRoleId === role.id ? 'var(--accent-dim)' : 'var(--bg-input)',
                                            border: `1px solid ${dragOverRoleId === role.id ? 'var(--accent)' : selectedRoleId === role.id ? 'var(--accent-border)' : 'var(--border)'}`,
                                            transition: 'all 0.15s',
                                            opacity: dragItem.current === role.id ? 0.5 : 1,
                                        }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'grab', userSelect: 'none' }}>⠿</span>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color, flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>{role.name}</span>
                                        {role.floor && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: role.floor === '1F' ? 'rgba(37,99,235,0.12)' : 'rgba(124,58,237,0.12)', color: role.floor === '1F' ? 'var(--blue)' : 'var(--purple)' }}>
                                                {role.floor}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
                                            {staff.filter(s => s.roleId === role.id && s.status !== 'retired').length}名
                                        </span>
                                        <button className="btn btn-ghost btn-sm"
                                            onClick={e => { e.stopPropagation(); setRoleModal({ open: true, editing: role }); }}>✏️</button>
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                                            onClick={e => { e.stopPropagation(); deleteRole(role.id); }}>🗑</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ===== 職員名簿 ===== */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title" style={{ color: selectedRole?.color }}>
                                {selectedRole ? `${selectedRole.name}` : '職種を選択'}
                            </span>
                            {selectedRole && (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {activeStaff.length}名在職
                                </span>
                            )}
                        </div>

                        {!selectedRole ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: 24 }}>
                                ← 左の職種を選択してください
                            </p>
                        ) : (
                            <>
                                {/* 在職職員リスト */}
                                {activeStaff.length > 0 && (
                                    <table className="data-table" style={{ marginBottom: 12 }}>
                                        <tbody>
                                            {activeStaff.map((s, i) => (
                                                <tr key={s.id}
                                                    draggable
                                                    onDragStart={() => { dragItem.current = s.id; }}
                                                    onDragOver={e => { e.preventDefault(); setDragOverStaffId(s.id); }}
                                                    onDragLeave={() => setDragOverStaffId(null)}
                                                    onDrop={() => handleStaffDrop(s.id)}
                                                    onDragEnd={() => { setDragOverStaffId(null); dragItem.current = null; }}
                                                    style={{
                                                        cursor: 'grab',
                                                        background: dragOverStaffId === s.id ? 'var(--accent-dim)' : undefined,
                                                        outline: dragOverStaffId === s.id ? '1px solid var(--accent)' : undefined,
                                                        opacity: dragItem.current === s.id ? 0.5 : 1,
                                                    }}>
                                                    <td style={{ width: 24, color: 'var(--text-muted)', fontSize: '0.85rem', userSelect: 'none' }}>⠿</td>
                                                    <td style={{ width: 28, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{i + 1}</td>
                                                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                                                    <td style={{ width: 96 }}>
                                                        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                            <button className="btn btn-ghost btn-sm"
                                                                onClick={() => setEditingStaff(s)}>✏️</button>
                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--orange)', fontSize: '0.75rem' }}
                                                                onClick={() => updateStaffStatus(s.id, 'retired')}>退職</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* 退職者リスト */}
                                {retiredStaff.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, paddingLeft: 2 }}>
                                            退職者
                                        </div>
                                        <table className="data-table">
                                            <tbody>
                                                {retiredStaff.map(s => (
                                                    <tr key={s.id} style={{ opacity: 0.5 }}>
                                                        <td style={{ width: 24 }} />
                                                        <td style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{s.name}</td>
                                                        <td style={{ width: 96 }}>
                                                            <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}
                                                                    onClick={() => updateStaffStatus(s.id, 'active')}>復職</button>
                                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                                                                    onClick={() => deleteStaff(s.id)}>🗑</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* ━━━ クイック追加行 ━━━ */}
                                <div style={{
                                    display: 'flex', gap: 8, alignItems: 'center',
                                    padding: '10px 12px',
                                    background: 'var(--bg-input)',
                                    border: '1.5px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                }}>
                                    <span style={{ fontSize: '1rem', opacity: 0.4 }}>＋</span>
                                    <input
                                        ref={quickInputRef}
                                        type="text"
                                        value={quickName}
                                        onChange={e => setQuickName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') quickAddStaff(); }}
                                        placeholder="氏名を入力して Enter で追加"
                                        style={{
                                            flex: 1, background: 'transparent', border: 'none',
                                            fontSize: '0.9rem', padding: '0',
                                            boxShadow: 'none', outline: 'none',
                                        }}
                                        disabled={adding}
                                    />
                                    {quickName.trim() && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={quickAddStaff}
                                            disabled={adding}
                                            style={{ flexShrink: 0 }}>
                                            {adding ? '追加中...' : '追加'}
                                        </button>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, paddingLeft: 2 }}>
                                    💡 Enter キーで連続追加できます
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* モーダル群 */}
            {roleModal.open && (
                <RoleModal
                    initial={roleModal.editing}
                    onSave={saveRole}
                    onClose={() => setRoleModal({ open: false, editing: null })}
                />
            )}
            {editingStaff && (
                <StaffEditModal
                    initial={editingStaff}
                    roles={roles}
                    onSave={updateStaff}
                    onClose={() => setEditingStaff(null)}
                />
            )}

            <ToastContainer toasts={toasts} />
        </div>
    );
}
