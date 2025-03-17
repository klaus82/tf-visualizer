import * as vscode from 'vscode';
import { generateHtmlContent } from './htmlGenerator';

export function showTerraformChanges(changes: any[]) {
    const panel = vscode.window.createWebviewPanel(
        'terraformVisualizer',
        'Terraform Plan Visualization',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const htmlContent = generateHtmlContent(changes);
    panel.webview.html = htmlContent;
}