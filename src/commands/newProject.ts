
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';

const defaultAppName = 'ocm-application';

const projectTypeGit = 'Git';
const projectTypeHelmRepo = 'HelmRepo';
const projectTypeObjectBucket = 'ObjectBucket';

// create a template project based on the user input
export async function create() {
	// get project type from the user
	let templateType: string = await vscode.window.showQuickPick([
		projectTypeGit,
		projectTypeHelmRepo,
		projectTypeObjectBucket,
	], {
		placeHolder: `template type, default: ${projectTypeGit}`,
	}) || projectTypeGit;

	// get the project name from the user
	let projectName: string = await vscode.window.showInputBox({
		placeHolder: `insert project name, default: ${defaultAppName}`,
	}) || defaultAppName;

	// verify inside workspace
	if (vscode.workspace.workspaceFolders === undefined) {
		vscode.window.showWarningMessage('OCM extension, no workspace folder, please open a project or create a workspace');
		return;
	}
	// prepare project folder path
	let workspaceFolder: string = vscode.workspace.workspaceFolders[0].uri.path;
	if (process.platform === 'win32') {
		// the workspaceFolder is a uri path, it includes the initial forward slash
		// behind the scenes, this is used to start at root, but this will not work for windows
		workspaceFolder = workspaceFolder.substring(1);
	}
	let projectFolder: string = path.join(workspaceFolder, projectName);

	// verify project folder doesn't exists
	if (await fse.pathExists(projectFolder)) {
		vscode.window.showErrorMessage(`OCM extension, project folder ${projectName} exists, please use another`);
		return;
	}
	// create project folder
	try {
		await fse.ensureDir(projectFolder);
	} catch (err) {
		console.error(err);
		vscode.window.showInformationMessage(`OCM extension, failed to create project folder ${projectName}`);
		return;
	}
	console.debug(`created project ${projectFolder}`);
	// prepare template folder path
	let templatesFolder = path.resolve(__dirname, `../../../templates/${templateType}`);
	// copy templates to project folder
	try {
		await fse.copy(templatesFolder, projectFolder);
	} catch (err) {
		console.error(err);
		vscode.window.showInformationMessage(`OCM extension, failed creating project ${projectName}`);
		return;
	}
	vscode.window.showInformationMessage(`OCM extension, project ${projectName} created`);
}
