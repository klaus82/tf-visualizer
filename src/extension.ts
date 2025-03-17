// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "terraform-visualizer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('terraform-visualizer.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from terraform-visualizer!');
		parseTerraformPlan();
	});

	context.subscriptions.push(disposable);
}

function parseTerraformPlan() {
    const workspacePath = vscode.workspace.rootPath;
    if (!workspacePath) {
        vscode.window.showErrorMessage('No workspace is open.');
        return;
    }

    const planPath = path.join(workspacePath, 'tfplan.json');
    
    fs.readFile(planPath, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showErrorMessage('Error reading Terraform plan.');
            return;
        }
        
        try {
            const json = JSON.parse(data);
            showTerraformChanges(json.resource_changes || []);
        } catch (error) {
            vscode.window.showErrorMessage('Failed to parse Terraform plan.');
        }
    });
}

function showTerraformChanges(changes: any[]) {
    const panel = vscode.window.createWebviewPanel(
        'terraformVisualizer',
        'Terraform Plan Visualization',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

	let html_head = `
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
	* {
	box-sizing: border-box;
	}

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

    let htmlContent = `<html><body><h2>Terraform Plan Changes</h2><ul>
	<li><b>Number of changes</b>: ${changes.length}</li>
	<table id="ControlTable"><tr><th>Change</th><th>Actions</th></tr>

	<tr><td><input type="text" id="myInput" onkeyup="myFunction()" placeholder="Search for changes..">
	</td><td>	
	<label for="filter">Filter by Action:</label>
    <select id="filter" onchange="filterTable()">
        <option value="">All</option>
        <option value="create">Create</option>
        <option value="delete">Delete</option>
		<option value="update">Update</option>
		<option value="delete, create">Delete Create</option>
    </select></td></tr>

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
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			tr[i].style.display = "";
		} else {
			tr[i].style.display = "none";
		}
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


	</script>`;
	htmlContent	+= `<table id="myTable"><tr><th>Change</th><th>Actions</th></tr>`;
    changes.forEach(change => {
		let changes_text = change.change.actions.join(', ');
		if (change.change.actions.includes('create')) {
			changes_text = `<span style="color: green;">${changes_text}</span>`;
		} else if (change.change.actions.includes('delete')) {
			changes_text = `<span style="color: red;">${changes_text}</span>`;
		} else if (change.change.actions.includes('update')) {
			changes_text = `<span style="color: orange;">${changes_text}</span>`;
		} 
		else {
			changes_text = `<span style="color: blue;">${changes_text}</span>`;
		}
        htmlContent += `<tr><td><b>${change.address}</b></td><td>${changes_text}</td></tr>`;
    });
	htmlContent += `</table></ul></body></html>`;
    
    panel.webview.html = htmlContent;
}


// This method is called when your extension is deactivated
export function deactivate() {}
