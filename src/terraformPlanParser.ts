import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { showTerraformChanges } from './webviewManager';

export function parseTerraformPlan() {
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