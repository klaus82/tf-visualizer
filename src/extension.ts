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

    let htmlContent = '<html><body><h2>Terraform Plan Changes</h2><ul>';
    changes.forEach(change => {
		let changes_text = change.change.actions.join(', ');
		if (change.change.actions.includes('create')) {
			changes_text = `<span style="color: green;">${changes_text}</span>`;
		} else if (change.change.actions.includes('delete')) {
			changes_text = `<span style="color: red;">${changes_text}</span>`;
		} else {
			changes_text = `<span style="color: blue;">${changes_text}</span>`;
		}
        htmlContent += `<li><b>${change.address}</b>: ${changes_text}</li>`;
    });
    htmlContent += '</ul></body></html>';
    
    panel.webview.html = htmlContent;
}


// This method is called when your extension is deactivated
export function deactivate() {}
