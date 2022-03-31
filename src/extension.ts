import * as vscode from 'vscode';
import * as newProject from './commands/newProject';

const extName = 'ocm-vscode-extension';

/*#########################
###### COMMAND NAMES ######
#########################*/
const cmdNewProjectName = 'ocmNewProject';

/*#########################
####### DISPOSABLES #######
#########################*/
const cmdNewProjectDisposable: vscode.Disposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`,
	async () => {
		await newProject.create();
	}
);

/*#########################
######### EXPORTS #########
#########################*/
export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(cmdNewProjectDisposable); // command: ocm-vscode-extension.ocmNewProject
}

export function deactivate() {
	// no deactivate actions required
}
