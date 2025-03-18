export function generateHtmlContent(changes: any[]): string {
    const htmlHead = `
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        #myInput {
            background-image: url('/css/searchicon.png');
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
        }
        #myTable th, #myTable td {
            text-align: left;
            padding: 12px;
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
    </style>
    `;
    const htmlBody = `
    <body>
        <h2>Terraform Plan Changes</h2>
        <ul>
            <li><b>Number of changes</b>: ${changes.length}</li>
        </ul>
        <table id="ControlTable">
            
            <tr>
                <td>
                    <!--<input type="text" id="myInput" onkeyup="myFunction()" placeholder="Search for changes..">-->
                </td>
                <td>
                    <label for="filter">Filter by Action:</label>
                    <select id="filter" onchange="filterTable()">
                        <option value="">All</option>
                        <option value="create">Create</option>
                        <option value="delete">Delete</option>
                        <option value="update">Update</option>
                        <option value="delete, create">Delete Create</option>
                    </select>
                </td>
            </tr>
        </table>
        <table id="myTable">
            <tr>
                <th>Change</th>
                <th>Actions</th>
            </tr>
            ${generateTableRows(changes)}
        </table>
        <script>
            function myFunction() {
                var input, filter, table, tr, td, i, txtValue;
                input = document.getElementById("myInput");
                filter = input.value.toUpperCase();
                table = document.getElementById("myTable");
                tr = table.getElementsByTagName("tr");
                for (i = 0; i < tr.length; i += 2) { // Increment by 2 to skip details rows
                    td = tr[i].getElementsByTagName("td")[0];
                    if (td) {
                        txtValue = td.textContent || td.innerText;
                        let shouldDisplay = txtValue.toUpperCase().indexOf(filter) > -1;
                        tr[i].style.display = shouldDisplay ? "" : "none";
                        tr[i + 1].style.display = shouldDisplay ? "" : "none"; // Show/hide details row accordingly
                    }
                }
            }


            function filterTable() {
                let dropdown = document.getElementById("filter");
                let filter = dropdown.value.toUpperCase();
                let table = document.getElementById("myTable");
                let rows = table.getElementsByTagName("tr");

                for (let i = 1; i < rows.length; i += 2) { // Increment by 2 to skip details rows
                    let td = rows[i].getElementsByTagName("td")[1];
                    if (td) {
                        let txtValue = td.textContent || td.innerText;
                        let shouldDisplay = (filter === "" || txtValue.toUpperCase() === filter);
                        rows[i].style.display = shouldDisplay ? "" : "none";
                        rows[i + 1].style.display = shouldDisplay ? "" : "none"; // Show/hide details row accordingly
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

function generateTableRows(changes: any[]): string {
    return changes.map((change, index) => {
        if (change.change.actions.includes('no-op')) {
            return ``;
        }
        let changesText = change.change.actions.join(', ');
        let color = 'blue';
        if (change.change.actions.includes('create')) {
            color = 'green';
        } else if (change.change.actions.includes('delete')) {
            color = 'red';
        } else if (change.change.actions.includes('update')) {
            color = 'orange';
        }

        let delta = diff(change.change.before, change.change.after);

        return `
            <tr onclick="toggleDetails(${index})">
                <td><b>${change.address}</b></td>
                <td><span style="color: ${color};">${changesText}</span></td>
            </tr>
            <tr id="details-${index}" style="display: none;">
                <td colspan="2">
                    <table style="width: 100%;">
                        <tr>
                            <th>Changes</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>
                        <tr>
                            <td style="width: 20%; word-wrap: break-word;"><pre>${JSON.stringify(delta, null, 2)}</pre></td>
                            <td style="width: 40%; word-wrap: break-word;"><pre>${JSON.stringify(change.change.before, null, 2)}</pre></td>
                            <td style="width: 40%; word-wrap: break-word;"><pre>${JSON.stringify(change.change.after, null, 2)}</pre></td>
                        </tr>
                    </table>
                </td>
            </tr>
        `;
    }).join('');
}
