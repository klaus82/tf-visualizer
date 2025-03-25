export function generateHtmlContent(changes: any[]): string {
    const { html: tableRowsHtml, count: rowCount } = generateTableRows(changes);

    // Gather unique action values, excluding 'no-op'
    const actionSet = new Set<string>();
    changes.forEach(change => {
        change.change.actions.forEach((action: string) => {
            if (action !== 'no-op') {
                actionSet.add(action);
            }
        });
    });
    const actionOptions = Array.from(actionSet).map(action => `
        <label class="container" style="background-color: ${generateButtonColor(action)};">
            <input type="radio" name="filter" value="${action}" onchange="filterTable()">
            ${action.charAt(0).toUpperCase() + action.slice(1)}
        </label>
    `).join('');

    //const htmlHead = fetch('src/htmlHead.html');
    
    const htmlHead = `
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        #myInput {
            background-position: 10px 10px;
            background-repeat: no-repeat;
            width: 100%;
            font-size: 14px;
            padding: 12px 20px 12px 40px;
            border: 1px solid #ddd;
            margin-bottom: 12px;
        }
        #myTable {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid #ddd;
            font-size: 14px;
            table-layout: fixed; /* Prevent horizontal scrolling */
        }
        #myTable th, #myTable td {
            text-align: left;
            padding: 12px;
            overflow: hidden; /* Prevent overflow */
            text-overflow: ellipsis; /* Add ellipsis for overflow text */
            white-space: nowrap; /* Prevent text wrapping */
        }
        #myTable th:nth-child(1), #myTable td:nth-child(1) {
            width: 70%;
        }
        #myTable th:nth-child(2), #myTable td:nth-child(2) {
            width: 30%;
        }
        #myTable tr {
            border-bottom: 1px solid #ddd;
        }
        #myTable tr.header, #myTable tr:hover {
            background-color: #f1f1f1;
        }
        .details {
            display: none;
        }
        pre {
            white-space: pre-wrap; /* CSS3 */
            white-space: -moz-pre-wrap; /* Firefox */
            white-space: -pre-wrap; /* Opera <7 */
            white-space: -o-pre-wrap; /* Opera 7 */
            word-wrap: break-word; /* IE */
        }
        #detailsTable {
            width: 100%;
            border-collapse: collapse; 
        }
        #detailsCell_20 {
            width: 20%; 
            word-wrap: break-word;
            vertical-align: top; /* Align to the top */
        }
        #detailsCell_40 {
            width: 40%; 
            word-wrap: break-word;
        }
        .removed { color: #e06c75; } /* Red */
        .added { color: #98c379; } /* Green */
        .filter-labels {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
        }
        .filter-labels label {
            cursor: pointer;
        }

        /* Hide the browser's default radio button */
        .container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        }

        .container {
            display: flex;
            align-items: center;
            background-color: gray;
            color: white;
            padding: 8px; 
            border-radius: 5px;
        }

    </style>
    `;
    const htmlBody = `
    <body>
        <h2>Terraform Plan Changes</h2>
        <ul>
            <li><b>Number of changes</b>: ${rowCount}</li>
        </ul>
        <input type="text" id="myInput" onkeyup="searchFunction()" placeholder="Search for changes..">
        <div id="ControlTable">
            <div class="filter-labels">
                <label class="container">
                    <input type="radio" name="filter" value="" onchange="filterTable()" checked>
                    All changes
                </label>
                ${actionOptions}
            </div>
        </div>
        <table id="myTable">
            <tr>
                <th>Change</th>
                <th>Actions</th>
            </tr>
            ${tableRowsHtml}
        </table>
        <script>
            function searchFunction() {
                var input, filter, table, tr, td, i, txtValue;
                input = document.getElementById("myInput");
                filter = input.value.toUpperCase();
                table = document.getElementById("myTable");
                let rows = table.getElementsByTagName("tr");

                for (let i = 1; i < rows.length; i += 2) { // Increment by 2 to skip details rows
                    let td = rows[i].getElementsByTagName("td")[0];
                    if (td) {
                        let txtValue = td.textContent || td.innerText;
                        let shouldDisplay = (filter === "" || txtValue.toUpperCase().includes(filter));
                        rows[i].style.display = shouldDisplay ? "" : "none";
                        rows[i + 1].style.display = shouldDisplay && rows[i].style.display === 'table-row' ? "table-row" : "none"; // Show/hide details row accordingly
                    }
                }
            }

            function filterTable() {
                let radios = document.getElementsByName("filter");
                let filter = "";
                for (let i = 0; i < radios.length; i++) {
                    if (radios[i].checked) {
                        filter = radios[i].value.toUpperCase();
                        break;
                    }
                }
                let table = document.getElementById("myTable");
                let rows = table.getElementsByTagName("tr");

                for (let i = 1; i < rows.length; i += 2) { // Increment by 2 to skip details rows
                    let td = rows[i].getElementsByTagName("td")[1];
                    if (td) {
                        let txtValue = td.textContent || td.innerText;
                        let shouldDisplay = (filter === "" || txtValue.toUpperCase().includes(filter));
                        rows[i].style.display = shouldDisplay ? "" : "none";
                        rows[i + 1].style.display = shouldDisplay && rows[i].style.display === 'table-row' ? "table-row" : "none";// Show/hide details row accordingly
                    }
                }
            }

            function toggleDetails(index) {
                var detailsRow = document.getElementById('details-' + index);
                if (detailsRow.style.display === 'none') {
                    detailsRow.style.display = 'table-row';
                } else {
                    detailsRow.style.display = 'none';
                }
            }
        </script>
    </body>
    `;

    return `<html>${htmlHead}${htmlBody}</html>`;
}

import {diffString, diff} from 'json-diff';

function generateButtonColor(action: string): string {
    switch (action) {
        case 'create':
            return 'green';
        case 'delete':
            return 'red';
        case 'update':
            return 'orange';
        default:
            return 'blue';
    }
}

function generateTableRows(changes: any[]):  { html: string, count: number } {
    let changesCount = 0;
    const rowsHtml = changes.map((change, index) => {
        
        if (change.change.actions.includes('no-op')) {
            return ``;
        }

        changesCount++;
        
        let changesText = change.change.actions.map((action: string) => action.charAt(0).toUpperCase() + action.slice(1)).join(', ');
        let color = 'blue';
        if (change.change.actions.includes('create')) {
            color = 'green';
        } else if (change.change.actions.includes('delete')) {
            color = 'red';
        } else if (change.change.actions.includes('update')) {
            color = 'orange';
        }

        let delta = diffString(change.change.before, change.change.after);

        return `
            <tr onclick="toggleDetails(${index})">
                <td><b>${change.address}</b></td>
                <td><span style="background-color: ${color};color: white; padding: 8px; border-radius: 5px;">${changesText}</span></td>
            </tr>
            <tr id="details-${index}" style="display: none;">
                <td colspan="2">
                    <table id="detailsTable">
                        <tr>
                            <th>Changes</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>
                        <tr>
                            <td class="detailsCell_20"><pre>${renderDiff(delta)}</pre></td>
                            <td class="detailsCell_40"><pre>${JSON.stringify(change.change.before, null, 2)}</pre></td>
                            <td class="detailsCell_40"><pre>${JSON.stringify(change.change.after, null, 2)}</pre></td>
                        </tr>
                    </table>
                </td>
            </tr>
        `;
    }).join('');

    return { html: rowsHtml, count: changesCount };
}

function renderDiff(diff:string) {
    return diff
        .replace(/\u001b\[31m/g, '<span class="removed">')  // Red start
        .replace(/\u001b\[32m/g, '<span class="added">')    // Green start
        .replace(/\u001b\[39m/g, '</span>');                 // End color
}
