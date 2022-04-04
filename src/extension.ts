import * as vscode from 'vscode';
import * as newProject from './commands/newProject';

const extName = 'ocm-vscode-extension';
// COMMAND NAMES
const cmdNewProjectName = 'ocmNewProject';

// DISPOSABLES
const cmdNewProjectDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`, () => newProject.create()
);

// EXPORTS
export function activate(context: vscode.ExtensionContext) {
	 // command: ocm-vscode-extension.ocmNewProject
	context.subscriptions.push(cmdNewProjectDisposable);
}
