export default function ManualPage() {
    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', fontFamily: 'inherit', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>📘 操作マニュアル</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>介護施設 日報管理システム</p>
            </div>

            {/* 目次 */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 36 }}>
                <p style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>目次</p>
                <ol style={{ paddingLeft: 20, lineHeight: 2, fontSize: '0.9rem' }}>
                    <li><a href="#basic" style={{ color: 'var(--accent)' }}>基本的な使い方</a></li>
                    <li><a href="#attendance" style={{ color: 'var(--accent)' }}>出勤職員の入力</a></li>
                    <li><a href="#residents" style={{ color: 'var(--accent)' }}>入居者数・避難区分・介護度</a></li>
                    <li><a href="#records" style={{ color: 'var(--accent)' }}>各種記録（入所者・外出・受診など）</a></li>
                    <li><a href="#nightrounds" style={{ color: 'var(--accent)' }}>夜勤巡視サイン</a></li>
                    <li><a href="#settings" style={{ color: 'var(--accent)' }}>職員管理（初期設定）</a></li>
                    <li><a href="#trouble" style={{ color: 'var(--accent)' }}>よくある質問・トラブル</a></li>
                </ol>
            </div>

            <Section id="basic" title="1. 基本的な使い方">
                <SubSection title="日報を開く">
                    <p>アプリを起動すると、自動的に今日の日報が表示されます。</p>
                    <p>画面上部の <Chip>◀ ▶</Chip> ボタンで前日・翌日に移動できます。<Chip>今日</Chip> ボタンで今日に戻ります。</p>
                </SubSection>
                <SubSection title="前日から取り込む">
                    <p>日付の右にある <Chip primary>📥 前日から取り込む</Chip> ボタンを押すと、前日の入居者数・避難区分・介護度をコピーできます。</p>
                    <p>変化がない日はこのボタンを使うと便利です。</p>
                </SubSection>
                <SubSection title="保存する">
                    <p>入力が終わったら画面右下の <Chip primary>💾 保存</Chip> ボタンを押してください。</p>
                    <p>保存するとデータはGoogleスプレッドシートに記録されます。</p>
                    <Caution>保存ボタンを押さないと入力内容がサーバーに反映されません。こまめに保存してください。</Caution>
                </SubSection>
                <SubSection title="未保存インジケーターと自動下書き">
                    <p>入力を変更すると、右下に <Chip>● 未保存の変更があります</Chip> が表示されます。</p>
                    <p>入力内容はブラウザに自動的に下書き保存されます。うっかりページを閉じた場合でも、次に同じ日報を開いたときに <strong>「未保存の下書きが見つかりました」</strong> バナーが表示され、「復元する」ボタンで内容を戻せます。</p>
                    <p>未保存の状態でページを離れようとすると、ブラウザの確認ダイアログが表示されます。</p>
                </SubSection>
                <SubSection title="印刷する">
                    <p>画面右下の <Chip>🖨 印刷</Chip> ボタンで印刷できます。</p>
                </SubSection>
            </Section>

            <Section id="attendance" title="2. 出勤職員の入力">
                <SubSection title="シフトを選択する">
                    <p>職種ごとに <Chip>早番</Chip> <Chip>日勤</Chip> <Chip>遅番</Chip> <Chip>夜勤</Chip> <Chip>研修・出張</Chip> のボタンが並んでいます。</p>
                    <p>ボタンを押すと職員選択のポップアップが表示されます。チェックを入れて <Chip primary>完了</Chip> を押してください。</p>
                    <p>選択した職員はボタンの下にチップ（名前タグ）で表示されます。勤務種別の順（早番→日勤→遅番→夜勤→研修）に並びます。</p>
                </SubSection>
                <SubSection title="他フロアの職員を選択する">
                    <p>看護以外の職種では、選択モーダルに <strong>1F・2F 両方の職員</strong> が表示されます（看護は同職種のみ）。</p>
                    <p>モーダルを開いた職種と同じフロアの職員が先頭に並びます。</p>
                    <p>例えば「1F 介護」のモーダルで2F職員を選択すると、その職員は <strong>1Fで勤務した</strong> として記録されます。チップは1Fの行に表示され、夜勤巡視サインの1F列にも反映されます。</p>
                </SubSection>
                <SubSection title="チップから変更する">
                    <p>表示されている名前チップをタップ・クリックすると、そのシフトの選択モーダルが再度開きます。チェックを外すと未設定に戻ります。</p>
                </SubSection>
                <SubSection title="公休・年休・欠勤">
                    <p>各職種行の右側に数値入力欄があります。該当人数を数字で入力してください（職員名は不要）。</p>
                </SubSection>
            </Section>

            <Section id="residents" title="3. 入居者数・避難区分・介護度">
                <SubSection title="入力方法">
                    <p>各項目の <Chip>＋</Chip> <Chip>－</Chip> ボタンで人数を増減します。</p>
                    <p>1F・2F それぞれ入力してください。</p>
                </SubSection>
                <SubSection title="整合性チェック">
                    <p>入居者数・避難区分・介護度の合計がフロアごとに一致しているか自動でチェックされます。</p>
                    <p>一致しない場合は <strong style={{ color: '#dc2626' }}>⚠ 合計人数が一致していません</strong> という警告が表示されます。入力内容を確認してください。</p>
                </SubSection>
                <SubSection title="平均介護度">
                    <p>介護度セクションの下部に平均介護度が自動計算されます。</p>
                    <p>計算式：加重合計 ÷ (入居者総数 − 支援総数)　※支援の方は分母から除外</p>
                </SubSection>
            </Section>

            <Section id="records" title="4. 各種記録">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginTop: 8 }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-input)' }}>
                            <Th>項目</Th>
                            <Th>内容</Th>
                        </tr>
                    </thead>
                    <tbody>
                        <Tr label="🆕 入所者" desc="当日の入所者の氏名や詳細を自由入力" />
                        <Tr label="🔚 退所者" desc="当日の退所者の氏名や詳細を自由入力" />
                        <Tr label="🚶 外出・外泊" desc="外出・外泊した入居者の情報を自由入力" />
                        <Tr label="🏥 受診" desc="病院受診の内容・同行者などを自由入力" />
                        <Tr label="🚪 居室移動" desc="居室変更があった場合の記録（例：302→205号室）" />
                        <Tr label="🌡 気温・湿度" desc="数値で入力（気温は小数点可）" />
                        <Tr label="🛁 入浴者数" desc="1F・2Fそれぞれの入浴人数を入力。合計が自動表示" />
                        <Tr label="📝 備考" desc="その他の特記事項を自由入力" />
                    </tbody>
                </table>
            </Section>

            <Section id="nightrounds" title="5. 夜勤巡視サイン">
                <SubSection title="記録方法">
                    <p>1F・2F それぞれに18時〜翌8時までの巡視時間帯が並んでいます。</p>
                    <p>各時間帯のセルをクリックするとポップオーバーが開き、巡視した職員を選択できます。</p>
                    <p>1F のセルには <strong>1Fで勤務している夜勤者</strong> のみ、2F のセルには <strong>2Fで勤務している夜勤者</strong> のみが表示されます。</p>
                    <p>他フロアから応援で入った職員も、出勤設定で正しいフロアに割り当てていれば正しく表示されます。</p>
                </SubSection>
                <SubSection title="前と同じ職員を引き継ぐ">
                    <p>ポップオーバーに <Chip>← 前と同じ（氏名）</Chip> ボタンが表示される場合があります。</p>
                    <p>直前の時間帯と同じ職員が巡視した場合はこのボタンを押すと素早く入力できます。</p>
                </SubSection>
                <Caution>職員のフロア設定は「職員管理」ページの職種設定から行います。他フロア応援の場合は出勤職員選択で該当フロアの行から選択してください。</Caution>
            </Section>

            <Section id="settings" title="6. 職員管理（初期設定）">
                <SubSection title="ページを開く">
                    <p>マニュアル下部の <Chip>👥 職員管理ページへ</Chip> ボタンから開きます。</p>
                    <p>パスワード入力が必要です。ブラウザタブを閉じるまでは再入力不要です。</p>
                </SubSection>
                <SubSection title="職種の登録">
                    <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                        <li>「職種を追加」ボタンで職種名・カラー・フロアを設定</li>
                        <li>フロア設定は夜勤巡視の絞り込みに使用（1F / 2F / 未設定）</li>
                    </ol>
                </SubSection>
                <SubSection title="職員の登録・並び替え">
                    <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
                        <li>職種を選択後、氏名を入力して Enter で職員を追加</li>
                        <li>行左端の <Chip>⠿</Chip> をドラッグして順番を変更できます</li>
                    </ol>
                </SubSection>
                <Caution>職員を削除しても過去の日報データには影響しません。</Caution>
            </Section>

            <Section id="trouble" title="7. よくある質問・トラブル">
                <QA q="保存したのにデータが消えている">
                    インターネット接続やGoogleスプレッドシートへのアクセスに失敗している可能性があります。保存時に「保存に失敗しました」が表示されていないか確認してください。
                </QA>
                <QA q="別のPCで開いたら入力した内容が見えない">
                    保存ボタンを押しているか確認してください。保存済みであれば、どのPCからでも同じデータが見えます。
                </QA>
                <QA q="うっかりページを閉じてしまった">
                    次に同じ日の日報を開くと「未保存の下書きが見つかりました」バナーが表示されます。「復元する」を押すと閉じる前の入力内容を戻せます。
                </QA>
                <QA q="2人が同時に同じ日の日報を編集している">
                    他の人が保存すると「他の人が更新しています」モーダルが表示されます。<Chip primary>最新データを読み込む</Chip> を押して最新の内容に更新してください。保存時に競合が検知された場合も同じモーダルが表示されます。
                </QA>
                <QA q="入居者数・避難区分・介護度の合計が一致しないと警告が出る">
                    各セクションの合計人数がフロアごとに一致しているか確認してください。警告は画面上のみ表示され、印刷には出ません。数値が正しければそのまま保存できます。
                </QA>
                <QA q="夜勤巡視のポップオーバーに職員が表示されない">
                    ①その日の出勤設定で「夜勤」に職員が選択されているか確認 ②職員管理で職種にフロア（1F/2F）が設定されているか確認 ③他フロア応援の場合は、応援先フロアの行のモーダルから選択されているか確認
                </QA>
                <QA q="アプリが開けない・エラーになる">
                    サーバーPCでアプリが起動しているか確認してください。start.batをダブルクリックして起動します。
                </QA>
            </Section>

            <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <a href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
                    👥 職員管理ページへ
                </a>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>介護施設 日報管理システム</p>
            </div>
        </div>
    );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <div id={id} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, borderLeft: '4px solid var(--accent)', paddingLeft: 12, marginBottom: 16 }}>
                {title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {children}
            </div>
        </div>
    );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-secondary)' }}>{title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.9rem', lineHeight: 1.7 }}>
                {children}
            </div>
        </div>
    );
}

function Chip({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
    return (
        <span style={{
            display: 'inline-block', padding: '1px 8px', borderRadius: 4, fontSize: '0.82rem', fontWeight: 600,
            background: primary ? 'var(--accent-dim)' : 'var(--bg-input)',
            color: primary ? 'var(--accent)' : 'var(--text-secondary)',
            border: `1px solid ${primary ? 'var(--accent-border)' : 'var(--border)'}`,
            margin: '0 2px',
        }}>
            {children}
        </span>
    );
}

function Caution({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: '0.85rem', color: 'var(--orange)', marginTop: 4 }}>
            ⚠ {children}
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{children}</th>;
}

function Tr({ label, desc }: { label: string; desc: string }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{label}</td>
            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</td>
        </tr>
    );
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
    return (
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Q. {q}</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 16 }}>A. {children}</p>
        </div>
    );
}
