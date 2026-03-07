import { google } from 'googleapis';
import { Role, StaffMember, DailyReport, AttendanceType } from './types';

// =====================
// Google Sheets 設定
// =====================

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

const SHEETS = {
    ROLES: 'roles',
    STAFF: 'staff_master',
    REPORTS: 'daily_reports',
};

// サービスアカウント認証
function getAuth() {
    const credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || '{}'
    );
    return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

function getSheetsClient() {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
}

// =====================
// ユーティリティ
// =====================

function rowsToObjects(rows: string[][]): Record<string, string>[] {
    if (!rows || rows.length < 2) return [];
    const [headers, ...data] = rows;
    return data.map((row) =>
        Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
    );
}

// =====================
// 職種 (Roles)
// =====================

export async function getRoles(): Promise<Role[]> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A:E`,
    });
    const rows = (res.data.values || []) as string[][];
    // ヘッダー行をスキップし、列位置で直接マッピング（floor列が後から追加された場合も対応）
    return rows.slice(1)
        .filter(row => row[0] && row[0] !== 'id')
        .map((row) => ({
            id: row[0] ?? '',
            name: row[1] ?? '',
            color: row[2] || '#00d4aa',
            order: parseInt(row[3]) || 0,
            floor: (['1F', '2F'].includes(row[4]) ? row[4] : '') as Role['floor'],
        }))
        .sort((a, b) => a.order - b.order);
}

export async function addRole(role: Omit<Role, 'id'>): Promise<Role> {
    const sheets = getSheetsClient();
    const id = `role_${Date.now()}`;
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A:E`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[id, role.name, role.color, role.order, role.floor ?? '']],
        },
    });
    return { ...role, id };
}

export async function updateRole(role: Role): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const rowIndex = ids.indexOf(role.id);
    if (rowIndex < 0) throw new Error('Role not found');
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A${rowIndex + 1}:E${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[role.id, role.name, role.color, role.order, role.floor ?? '']],
        },
    });
}

export async function reorderRoles(orderedIds: string[]): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const data = orderedIds.map((id, newOrder) => {
        const rowIndex = ids.indexOf(id);
        if (rowIndex < 0) return null;
        return { range: `${SHEETS.ROLES}!D${rowIndex + 1}`, values: [[newOrder]] };
    }).filter(Boolean) as { range: string; values: number[][] }[];
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: 'RAW', data },
    });
}

export async function deleteRole(roleId: string): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.ROLES}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const rowIndex = ids.indexOf(roleId);
    if (rowIndex < 0) throw new Error('Role not found');

    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = sheetInfo.data.sheets?.find(s => s.properties?.title === SHEETS.ROLES);
    const sheetId = sheet?.properties?.sheetId;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1,
                    },
                },
            }],
        },
    });
}

// =====================
// 職員 (Staff)
// =====================

export async function getStaff(): Promise<StaffMember[]> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A:D`,
    });
    const rows = (res.data.values || []) as string[][];
    const objects = rowsToObjects(rows);
    return objects.map((r) => ({
        id: r.id,
        name: r.name,
        roleId: r.roleId,
        order: parseInt(r.order) || 0,
    })).sort((a, b) => a.order - b.order);
}

export async function addStaff(staff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const sheets = getSheetsClient();
    const id = `staff_${Date.now()}`;
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A:D`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[id, staff.name, staff.roleId, staff.order]],
        },
    });
    return { ...staff, id };
}

export async function updateStaff(staff: StaffMember): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const rowIndex = ids.indexOf(staff.id);
    if (rowIndex < 0) throw new Error('Staff not found');
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A${rowIndex + 1}:D${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[staff.id, staff.name, staff.roleId, staff.order]],
        },
    });
}

export async function reorderStaff(orderedIds: string[]): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const data = orderedIds.map((id, newOrder) => {
        const rowIndex = ids.indexOf(id);
        if (rowIndex < 0) return null;
        return { range: `${SHEETS.STAFF}!D${rowIndex + 1}`, values: [[newOrder]] };
    }).filter(Boolean) as { range: string; values: number[][] }[];
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: 'RAW', data },
    });
}

export async function deleteStaff(staffId: string): Promise<void> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.STAFF}!A:A`,
    });
    const ids = (res.data.values || []).flat();
    const rowIndex = ids.indexOf(staffId);
    if (rowIndex < 0) throw new Error('Staff not found');

    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = sheetInfo.data.sheets?.find(s => s.properties?.title === SHEETS.STAFF);
    const sheetId = sheet?.properties?.sheetId;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1,
                    },
                },
            }],
        },
    });
}

// =====================
// 日報 (Daily Reports)
// =====================

export async function getDailyReport(date: string): Promise<DailyReport | null> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.REPORTS}!A:B`,
    });
    const rows = (res.data.values || []) as string[][];
    // Row 0 = header: [date, data]
    const dataRow = rows.slice(1).find((row) => row[0] === date);
    if (!dataRow || !dataRow[1]) return null;
    try {
        return JSON.parse(dataRow[1]) as DailyReport;
    } catch {
        return null;
    }
}

export async function saveDailyReport(report: DailyReport): Promise<void> {
    const sheets = getSheetsClient();
    report.updatedAt = new Date().toISOString();
    const jsonData = JSON.stringify(report);

    // Check if date already exists
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.REPORTS}!A:A`,
    });
    const dates = (res.data.values || []).flat();
    const rowIndex = dates.indexOf(report.date);

    if (rowIndex > 0) {
        // Update existing row
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.REPORTS}!A${rowIndex + 1}:B${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[report.date, jsonData]] },
        });
    } else {
        // Append new row
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.REPORTS}!A:B`,
            valueInputOption: 'RAW',
            requestBody: { values: [[report.date, jsonData]] },
        });
    }
}

// スプレッドシートの初期セットアップ（初回のみ実行）
export async function initializeSpreadsheet(): Promise<void> {
    const sheets = getSheetsClient();

    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingTitles = sheetInfo.data.sheets?.map(s => s.properties?.title) || [];

    const sheetsToCreate = [
        { title: SHEETS.ROLES },
        { title: SHEETS.STAFF },
        { title: SHEETS.REPORTS },
    ].filter(s => !existingTitles.includes(s.title));

    if (sheetsToCreate.length > 0) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: sheetsToCreate.map(s => ({
                    addSheet: { properties: { title: s.title } },
                })),
            },
        });
    }

    // ヘッダー行の設定
    const headerOps = [
        { range: `${SHEETS.ROLES}!A1:E1`, values: [['id', 'name', 'color', 'order', 'floor']] },
        { range: `${SHEETS.STAFF}!A1:D1`, values: [['id', 'name', 'roleId', 'order']] },
        { range: `${SHEETS.REPORTS}!A1:B1`, values: [['date', 'data']] },
    ];

    for (const op of headerOps) {
        const existing = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: op.range,
        });
        if (!existing.data.values || existing.data.values[0]?.[0] !== op.values[0][0]) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: op.range,
                valueInputOption: 'RAW',
                requestBody: { values: op.values },
            });
        }
    }
}
