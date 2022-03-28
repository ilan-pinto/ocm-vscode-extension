import * as vscode from 'vscode';
import * as newProject from './commands/newProject';

const extName = 'ocm-vs-extension';

/*#########################
###### COMMAND NAMES ######
#########################*/
const cmdNewProjectName = 'ocmNewProject';

/*#########################
######## HANDLERS #########
#########################*/
async function cmdNewProjectHandler() {
	// project name defaults "ocm-application"
	let projectFolder = await vscode.window.showInputBox({
		placeHolder: "insert project name",
	}) || "ocm-application";
	// create the project folder
	newProject.create(projectFolder);
}

/*#########################
####### DISPOSABLES #######
#########################*/
const cmdNewProjectDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`,
	async () => {
		await cmdNewProjectHandler();
	}
);

/*#########################
######### EXPORTS #########
#########################*/
export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(cmdNewProjectDisposable); // command: ocm-vs-extension.ocmNewProject
}

export function deactivate() {
	// no deactivate actions required
}
