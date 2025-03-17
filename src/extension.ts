import * as vscode from 'vscode';
import { parseTerraformPlan } from './terraformPlanParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "terraform-visualizer" is now active!');

    const disposable = vscode.commands.registerCommand('terraform-visualizer.helloWorld', () => {
        parseTerraformPlan();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}