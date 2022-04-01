import * as vscode from 'vscode';
import * as newProject from './commands/newProject';

const extName = 'ocm-vscode-extension';
// COMMAND NAMES
const cmdNewProjectName = 'ocmNewProject';

// DISPOSABLES
function cmdNewProjectDisposable (): vscode.Disposable {
	return vscode.commands.registerCommand(
		`${extName}.${cmdNewProjectName}`, async () => {
			await newProject.create();
		}
	);
}

// EXPORTS
export async function activate(context: vscode.ExtensionContext) {
	 // command: ocm-vscode-extension.ocmNewProject
	context.subscriptions.push(cmdNewProjectDisposable());
}
