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
            font-size: 16px;
            padding: 12px 20px 12px 40px;
            border: 1px solid #ddd;
            margin-bottom: 12px;
        }
        #myTable {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid #ddd;
            font-size: 18px;
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
                <th>Change</th>
                <th>Actions</th>
            </tr>
            <tr>
                <td>
                    <input type="text" id="myInput" onkeyup="myFunction()" placeholder="Search for changes..">
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
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[0];
                    if (td) {
                        txtValue = td.textContent || td.innerText;
                        tr[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
                    }
                }
            }

            function filterTable() {
                let dropdown = document.getElementById("filter");
                let filter = dropdown.value.toUpperCase();
                let table = document.getElementById("myTable");
                let rows = table.getElementsByTagName("tr");

                for (let i = 1; i < rows.length; i++) {
                    let td = rows[i].getElementsByTagName("td")[1];
                    if (td) {
                        let txtValue = td.textContent || td.innerText;
                        rows[i].style.display = (filter === "" || txtValue.toUpperCase() === filter) ? "" : "none";
                    }
                }
            }
        </script>
    </body>
    `;

    return `<html>${htmlHead}${htmlBody}</html>`;
}

function generateTableRows(changes: any[]): string {
    return changes.map(change => {
        let changesText = change.change.actions.join(', ');
        if (change.change.actions.includes('create')) {
            changesText = `<span style="color: green;">${changesText}</span>`;
        } else if (change.change.actions.includes('delete')) {
            changesText = `<span style="color: red;">${changesText}</span>`;
        } else if (change.change.actions.includes('update')) {
            changesText = `<span style="color: orange;">${changesText}</span>`;
        } else {
            changesText = `<span style="color: blue;">${changesText}</span>`;
        }
        return `<tr><td><b>${change.address}</b></td><td>${changesText}</td></tr>`;
    }).join('');
}