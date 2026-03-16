export function generateHtmlContent(changes: any[]): string {
    const actionChanges = changes.filter(c => !c.change.actions.includes('no-op'));
    const noOpCount = changes.length - actionChanges.length;

    const counts: Record<string, number> = { create: 0, update: 0, delete: 0, 'create+delete': 0 };
    actionChanges.forEach(c => {
        const actions = c.change.actions as string[];
        if (actions.includes('create') && actions.includes('delete')) {
            counts['create+delete']++;
        } else if (actions.includes('create')) {
            counts['create']++;
        } else if (actions.includes('delete')) {
            counts['delete']++;
        } else if (actions.includes('update')) {
            counts['update']++;
        }
    });

    const resourceCards = actionChanges.map((change, index) => generateResourceCard(change, index)).join('\n');
    const filterChipsHtml = buildFilterChips(actionChanges, counts);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Terraform Plan</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
    --font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-pill: 100px;
    /* Surfaces — hard-coded DARK defaults (no var() chains that silently fail) */
    --bg-primary:   #1e1e2e;
    --bg-secondary: #181825;
    --bg-card:      #242436;
    --bg-hover:     #2a2a3e;
    --border:       rgba(255,255,255,0.08);
    --text-primary:   #cdd6f4;
    --text-secondary: #a6adc8;
    --text-muted:     #6c7086;
    /* Action colors — dark (vivid pastels readable on dark bg) */
    --c-create:        #a6e3a1;
    --c-create-bg:     rgba(166,227,161,0.14);
    --c-create-border: rgba(166,227,161,0.32);
    --c-update:        #fab387;
    --c-update-bg:     rgba(250,179,135,0.14);
    --c-update-border: rgba(250,179,135,0.32);
    --c-delete:        #f38ba8;
    --c-delete-bg:     rgba(243,139,168,0.14);
    --c-delete-border: rgba(243,139,168,0.32);
    --c-replace:       #cba6f7;
    --c-replace-bg:    rgba(203,166,247,0.14);
    --c-replace-border:rgba(203,166,247,0.32);
    --c-noop:          #89b4fa;
    --c-noop-bg:       rgba(137,180,250,0.10);
    --diff-del-bg:     rgba(243,139,168,0.12);
    --diff-add-bg:     rgba(166,227,161,0.12);
}

/* ── VS Code dark: override with actual VS Code tokens */
body.vscode-dark,
body.vscode-high-contrast {
    --bg-primary:   var(--vscode-editor-background,      #1e1e2e);
    --bg-secondary: var(--vscode-sideBar-background,     #181825);
    --bg-card:      var(--vscode-editorWidget-background,#242436);
    --bg-hover:     var(--vscode-list-hoverBackground,   #2a2a3e);
    --border:       var(--vscode-widget-border,          rgba(255,255,255,0.08));
    --text-primary:   var(--vscode-editor-foreground,      #cdd6f4);
    --text-secondary: var(--vscode-descriptionForeground, #a6adc8);
    --text-muted:     var(--vscode-disabledForeground,    #6c7086);
    --c-noop:         var(--vscode-textLink-foreground,   #89b4fa);
}

/* ── VS Code light */
body.vscode-light,
body.vscode-high-contrast-light {
    --bg-primary:   var(--vscode-editor-background,      #ffffff);
    --bg-secondary: var(--vscode-sideBar-background,     #f3f3f3);
    --bg-card:      var(--vscode-editorWidget-background,#ffffff);
    --bg-hover:     var(--vscode-list-hoverBackground,   #e8e8e8);
    --border:       var(--vscode-widget-border,          rgba(0,0,0,0.10));
    --text-primary:   var(--vscode-editor-foreground,      #1a1a2e);
    --text-secondary: var(--vscode-descriptionForeground, #555566);
    --text-muted:     var(--vscode-disabledForeground,    #999aaa);
    --c-create:        #1a7f37; --c-create-bg: #ddf4e4; --c-create-border: #9dd6ac;
    --c-update:        #bc4c00; --c-update-bg: #fff0e6; --c-update-border: #f0b07a;
    --c-delete:        #b91c1c; --c-delete-bg: #fde8e8; --c-delete-border: #f6a8a8;
    --c-replace:       #6d28d9; --c-replace-bg:#ede9fe; --c-replace-border:#c4b5fd;
    --c-noop:          var(--vscode-textLink-foreground, #1d6fce); --c-noop-bg: #dbeafe;
    --diff-del-bg:     #fde8e8; --diff-add-bg: #ddf4e4;
}

@media (prefers-color-scheme: light) {
    :root:not(.vscode-dark):not(.vscode-high-contrast):not(.vscode-light):not(.vscode-high-contrast-light) {
        --bg-primary:   #ffffff; --bg-secondary: #f3f3f3; --bg-card: #ffffff;
        --bg-hover:     #e8e8e8; --border: rgba(0,0,0,0.10);
        --text-primary: #1a1a2e; --text-secondary: #555566; --text-muted: #999aaa;
        --c-create:        #1a7f37; --c-create-bg: #ddf4e4; --c-create-border: #9dd6ac;
        --c-update:        #bc4c00; --c-update-bg: #fff0e6; --c-update-border: #f0b07a;
        --c-delete:        #b91c1c; --c-delete-bg: #fde8e8; --c-delete-border: #f6a8a8;
        --c-replace:       #6d28d9; --c-replace-bg:#ede9fe; --c-replace-border:#c4b5fd;
        --c-noop:          #1d6fce; --c-noop-bg:   #dbeafe;
        --diff-del-bg:     #fde8e8; --diff-add-bg: #ddf4e4;
    }
}

body { font-family: var(--font-ui); background: var(--bg-secondary); color: var(--text-primary); min-height: 100vh; font-size: 13px; line-height: 1.5; }

.toolbar { position: sticky; top: 0; z-index: 100; background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 10px 16px; display: flex; flex-direction: column; gap: 8px; }
.toolbar-top { display: flex; align-items: center; gap: 10px; }
.plan-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
.search-wrap { position: relative; flex: 1; max-width: 420px; }
.search-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--text-muted); pointer-events: none; }
#searchInput { width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 6px 10px 6px 30px; font-size: 12px; font-family: var(--font-ui); color: var(--text-primary); outline: none; transition: border-color .15s; }
#searchInput::placeholder { color: var(--text-muted); }
#searchInput:focus { border-color: var(--vscode-focusBorder, var(--c-noop)); }
.toolbar-actions { display: flex; gap: 6px; margin-left: auto; }
.btn { padding: 5px 10px; border-radius: var(--radius-md); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 11px; font-family: var(--font-ui); cursor: pointer; white-space: nowrap; transition: background .1s, color .1s; }
.btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.chip-row { display: flex; gap: 5px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 11px; font-weight: 500; cursor: pointer; transition: opacity .15s, border-color .15s, background .15s; user-select: none; }
.chip:hover { background: var(--bg-hover); }
.chip.active-all    { border-color: var(--c-noop); color: var(--c-noop); background: var(--c-noop-bg); }
.chip.active-create { border-color: var(--c-create-border); color: var(--c-create); background: var(--c-create-bg); }
.chip.active-update { border-color: var(--c-update-border); color: var(--c-update); background: var(--c-update-bg); }
.chip.active-delete { border-color: var(--c-delete-border); color: var(--c-delete); background: var(--c-delete-bg); }
.chip.active-replace { border-color: var(--c-replace-border); color: var(--c-replace); background: var(--c-replace-bg); }
.chip.inactive { opacity: .4; }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

.summary-bar { display: grid; grid-template-columns: repeat(5, 1fr); background: var(--bg-card); border-bottom: 1px solid var(--border); }
.sum-cell { padding: 10px 0; text-align: center; border-right: 1px solid var(--border); }
.sum-cell:last-child { border-right: none; }
.sum-num { font-size: 22px; font-weight: 600; line-height: 1.1; font-family: var(--font-mono); }
.sum-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; color: var(--text-muted); }
.num-create { color: var(--c-create); } .num-update { color: var(--c-update); }
.num-delete { color: var(--c-delete); } .num-replace { color: var(--c-replace); }
.num-total  { color: var(--text-secondary); }

.resource-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.res-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color .15s; }
.res-card:hover { border-color: var(--vscode-focusBorder, rgba(128,128,128,.35)); }
.res-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer; user-select: none; }
.res-header:hover { background: var(--bg-hover); }
.action-badge { flex-shrink: 0; padding: 2px 8px; border-radius: var(--radius-pill); font-size: 10px; font-weight: 600; letter-spacing: .04em; white-space: nowrap; border: 1px solid transparent; }
.badge-create  { background: var(--c-create-bg);  color: var(--c-create);  border-color: var(--c-create-border); }
.badge-update  { background: var(--c-update-bg);  color: var(--c-update);  border-color: var(--c-update-border); }
.badge-delete  { background: var(--c-delete-bg);  color: var(--c-delete);  border-color: var(--c-delete-border); }
.badge-replace { background: var(--c-replace-bg); color: var(--c-replace); border-color: var(--c-replace-border); }
.res-name { flex: 1; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.res-meta { font-size: 11px; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
.warning-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; background: var(--c-delete-bg); border: 1px solid var(--c-delete-border); border-radius: var(--radius-pill); font-size: 10px; color: var(--c-delete); white-space: nowrap; flex-shrink: 0; }
.chevron { flex-shrink: 0; font-size: 9px; color: var(--text-muted); transition: transform .2s; }
.chevron.open { transform: rotate(90deg); }

.res-body { display: none; border-top: 1px solid var(--border); }
.res-body.open { display: block; }
.diff-section-title { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-muted); padding: 10px 14px 4px; }
.diff-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11.5px; }
.diff-table td { padding: 3px 14px; vertical-align: top; }
.diff-key { color: var(--text-secondary); width: 38%; padding-right: 6px; word-break: break-all; }
.diff-old { display: inline-block; color: var(--c-delete); background: var(--diff-del-bg); border-radius: 3px; padding: 1px 5px; }
.diff-new { display: inline-block; color: var(--c-create); background: var(--diff-add-bg); border-radius: 3px; padding: 1px 5px; }
.diff-arrow { color: var(--text-muted); padding: 0 5px; font-size: 10px; }
.diff-unchanged { color: var(--text-muted); font-style: italic; }
.sensitive-badge { display: inline-block; font-size: 9px; padding: 1px 5px; background: var(--c-update-bg); color: var(--c-update); border-radius: 3px; margin-left: 4px; vertical-align: middle; border: 1px solid var(--c-update-border); font-family: var(--font-ui); }

.unchanged-toggle { display: flex; align-items: center; gap: 6px; padding: 8px 14px; cursor: pointer; font-size: 11px; color: var(--text-muted); user-select: none; border-top: 1px solid var(--border); }
.unchanged-toggle:hover { color: var(--text-secondary); }
.unchanged-count { background: var(--bg-hover); border-radius: var(--radius-pill); padding: 1px 7px; font-size: 10px; }
.unchanged-rows { display: none; }
.unchanged-rows.open { display: table-row-group; }
#noResults { display: none; padding: 40px; text-align: center; color: var(--text-muted); }
</style>
</head>
<body>

<div class="toolbar">
    <div class="toolbar-top">
        <span class="plan-label">tfplan.json</span>
        <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/>
            </svg>
            <input type="text" id="searchInput" placeholder="Search resources\u2026" oninput="handleSearch(this.value)" />
        </div>
        <div class="toolbar-actions">
            <button class="btn" onclick="collapseAll()">collapse all</button>
            <button class="btn" onclick="expandAll()">expand all</button>
        </div>
    </div>
    <div class="chip-row" id="filterChips">${filterChipsHtml}</div>
</div>

<div class="summary-bar">
    <div class="sum-cell"><div class="sum-num num-create">${counts['create']}</div><div class="sum-lbl">create</div></div>
    <div class="sum-cell"><div class="sum-num num-update">${counts['update']}</div><div class="sum-lbl">update</div></div>
    <div class="sum-cell"><div class="sum-num num-delete">${counts['delete']}</div><div class="sum-lbl">destroy</div></div>
    <div class="sum-cell"><div class="sum-num num-replace">${counts['create+delete']}</div><div class="sum-lbl">replace</div></div>
    <div class="sum-cell"><div class="sum-num num-total">${noOpCount}</div><div class="sum-lbl">no-op</div></div>
</div>

<div class="resource-list" id="resourceList">
    ${resourceCards || '<div style="text-align:center;padding:48px;color:var(--text-muted)">No changes found in this plan.</div>'}
</div>
<div id="noResults">No resources match your search.</div>

<script>
let activeFilter = 'all';

function setFilter(type, chipEl) {
    activeFilter = type;
    document.querySelectorAll('.chip').forEach(c => {
        c.className = 'chip inactive';
    });
    chipEl.classList.remove('inactive');
    chipEl.classList.add('active-' + type);
    applyFilters();
}

function handleSearch(val) {
    applyFilters(val.toLowerCase().trim());
}

function applyFilters(search) {
    if (search === undefined) search = document.getElementById('searchInput').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.res-card');
    let visible = 0;
    cards.forEach(card => {
        const matchFilter = activeFilter === 'all' || card.dataset.action === activeFilter;
        const matchSearch = !search || card.dataset.name.includes(search);
        const show = matchFilter && matchSearch;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
}

function toggleCard(index) {
    const body = document.getElementById('body-' + index);
    const chev = document.getElementById('chev-' + index);
    body.classList.toggle('open');
    chev.classList.toggle('open');
}

function toggleUnchanged(index) {
    const rows = document.getElementById('unchanged-' + index);
    const btn  = document.getElementById('unchbtn-' + index);
    if (!rows) return;
    rows.classList.toggle('open');
    btn.textContent = rows.classList.contains('open') ? '\u25BE Hide unchanged' : '\u25B8 Show unchanged';
}

function collapseAll() {
    document.querySelectorAll('.res-body').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.chevron').forEach(c => c.classList.remove('open'));
}

function expandAll() {
    document.querySelectorAll('.res-body').forEach(b => b.classList.add('open'));
    document.querySelectorAll('.chevron').forEach(c => c.classList.add('open'));
}
</script>
</body>
</html>`;
}

function buildFilterChips(changes: any[], counts: Record<string, number>): string {
    const total = changes.length;
    const chips = [
        { key: 'all',     label: `All ${total}`                 },
        { key: 'create',  label: `Create ${counts['create']}`   },
        { key: 'update',  label: `Update ${counts['update']}`   },
        { key: 'delete',  label: `Destroy ${counts['delete']}`  },
        { key: 'replace', label: `Replace ${counts['create+delete']}` },
    ];
    return chips.map((c, i) => `
        <span class="chip ${i === 0 ? 'active-all' : 'inactive'}"
              onclick="setFilter('${c.key}', this)"
              data-filter="${c.key}">
            <span class="chip-dot"></span>${c.label}
        </span>`).join('');
}

function generateResourceCard(change: any, index: number): string {
    const actions = change.change.actions as string[];
    const address = change.address as string;
    const isReplace = actions.includes('create') && actions.includes('delete');
    const isCreate  = !isReplace && actions.includes('create');
    const isDelete  = !isReplace && actions.includes('delete');

    const actionKey = isReplace ? 'replace' : isCreate ? 'create' : isDelete ? 'delete' : 'update';
    const badgeText = isReplace ? '± replace' : isCreate ? '+ create' : isDelete ? '− destroy' : '~ update';

    const delta = jsonDiff(change.change.before, change.change.after);
    const changedCount = delta.filter((d: any) => d.type !== 'unchanged').length;

    const forceWarning = isReplace ? `<span class="warning-pill">⚠ forces replacement</span>` : '';
    const metaText = changedCount > 0 ? `${changedCount} change${changedCount !== 1 ? 's' : ''}` : isCreate ? 'new resource' : 'removed';
    const diffHtml = generateDiffHtml(delta, index);

    return `
<div class="res-card" data-action="${actionKey}" data-name="${escapeAttr(address)}">
    <div class="res-header" onclick="toggleCard(${index})">
        <span class="action-badge badge-${actionKey}">${badgeText}</span>
        <span class="res-name">${escapeHtml(address)}</span>
        ${forceWarning}
        <span class="res-meta">${metaText}</span>
        <span class="chevron" id="chev-${index}">&#9658;</span>
    </div>
    <div class="res-body" id="body-${index}">${diffHtml}</div>
</div>`;
}

function generateDiffHtml(delta: any[], index: number): string {
    const changed   = delta.filter((d: any) => d.type !== 'unchanged');
    const unchanged = delta.filter((d: any) => d.type === 'unchanged');
    let html = '';

    if (changed.length > 0) {
        html += `<div class="diff-section-title">changes</div>`;
        html += `<table class="diff-table"><tbody>` + changed.map(renderDiffRow).join('') + `</tbody></table>`;
    }

    if (unchanged.length > 0) {
        html += `
        <div class="unchanged-toggle" onclick="toggleUnchanged(${index})">
            <span id="unchbtn-${index}">&#9658; Show unchanged</span>
            <span class="unchanged-count">${unchanged.length}</span>
        </div>
        <table class="diff-table">
            <tbody class="unchanged-rows" id="unchanged-${index}">
                ${unchanged.map(renderDiffRow).join('')}
            </tbody>
        </table>`;
    }

    return html || `<div style="padding:12px 14px;color:var(--text-muted);font-size:12px">No attribute details available.</div>`;
}

function renderDiffRow(d: any): string {
    const keyCell = `<td class="diff-key">${escapeHtml(d.path)}${d.sensitive ? `<span class="sensitive-badge">sensitive</span>` : ''}</td>`;
    let valCell = '';
    if (d.type === 'added') {
        valCell = `<td><span class="diff-new">${escapeHtml(stringify(d.value))}</span></td>`;
    } else if (d.type === 'removed') {
        valCell = `<td><span class="diff-old">${escapeHtml(stringify(d.value))}</span></td>`;
    } else if (d.type === 'modified') {
        valCell = d.sensitive
            ? `<td><span class="diff-unchanged">(sensitive — value hidden)</span></td>`
            : `<td><span class="diff-old">${escapeHtml(stringify(d.oldValue))}</span><span class="diff-arrow">&#8594;</span><span class="diff-new">${escapeHtml(stringify(d.newValue))}</span></td>`;
    } else {
        valCell = `<td><span class="diff-unchanged">${escapeHtml(stringify(d.value))}</span></td>`;
    }
    return `<tr>${keyCell}${valCell}</tr>`;
}

function jsonDiff(obj1: any, obj2: any, path = ''): any[] {
    const diff: any[] = [];
    if (obj1 === null && obj2 === null) { return diff; }
    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        if (obj1 === obj2) {
            diff.push({ type: 'unchanged', path: path || '(value)', value: obj2 });
        } else if (obj1 === undefined) {
            diff.push({ type: 'added', path: path || '(value)', value: obj2 });
        } else if (obj2 === undefined) {
            diff.push({ type: 'removed', path: path || '(value)', value: obj1 });
        } else {
            diff.push({ type: 'modified', path: path || '(value)', oldValue: obj1, newValue: obj2, sensitive: isSensitiveKey(path) });
        }
        return diff;
    }
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    allKeys.forEach(key => {
        const v1 = obj1 ? obj1[key] : undefined;
        const v2 = obj2 ? obj2[key] : undefined;
        const cp = path ? `${path}.${key}` : key;
        const sensitive = isSensitiveKey(cp);
        if (v1 === undefined) {
            diff.push({ type: 'added', path: cp, value: v2, sensitive });
        } else if (v2 === undefined) {
            diff.push({ type: 'removed', path: cp, value: v1, sensitive });
        } else if (typeof v1 === 'object' && typeof v2 === 'object' && v1 !== null && v2 !== null) {
            diff.push(...jsonDiff(v1, v2, cp));
        } else if (v1 !== v2) {
            diff.push({ type: 'modified', path: cp, oldValue: v1, newValue: v2, sensitive });
        } else {
            diff.push({ type: 'unchanged', path: cp, value: v2, sensitive });
        }
    });
    return diff;
}

function isSensitiveKey(path: string): boolean {
    const l = path.toLowerCase();
    return ['password','secret','token','key','credential','private','auth'].some(k => l.includes(k));
}

function stringify(val: any): string {
    if (val === null) { return 'null'; }
    if (val === undefined) { return ''; }
    if (typeof val === 'object') { return JSON.stringify(val); }
    return String(val);
}

function escapeHtml(str: string): string {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}