
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';

const defaultAppName = 'ocm-application';

const projectTypeGit = 'Git';
const projectTypeHelmRepo = 'HelmRepo';
const projectTypeNamespace = 'Namespace';
const projectTypeObjectBucket = 'ObjectBucket';

// create a template project based on the user input
export async function create () {
	// get project type from the user
	let templateType: string = await vscode.window.showQuickPick([
		projectTypeGit,
		projectTypeHelmRepo,
		projectTypeNamespace,
		projectTypeObjectBucket,
	], {
		placeHolder: `template type, default: ${projectTypeGit}`,
	}) || projectTypeGit;

	// TODO: this needs to be removed once we have templates for the rest of the types
	if (templateType !== projectTypeGit) {
		vscode.window.showWarningMessage(`currently ${templateType} is not yet implemented`);
		return;
	}

	// get the project name from the user
	let projectName: string = await vscode.window.showInputBox({
		placeHolder: `insert project name, default: ${defaultAppName}`,
	}) || defaultAppName;

	// verify inside workspace
	if(vscode.workspace.workspaceFolders === undefined) {
		console.error('no workspace folder, please open a project or create a workspace.');
		vscode.window.showInformationMessage('no workspace folder, please open a project or create a workspace');
		return;
	}
	// prepare project folder path
	let workspaceFolder: string = vscode.workspace.workspaceFolders[0].uri.path ;
	let projectFolder: string = path.join(workspaceFolder, projectName);
	// verify project folder doesn't exists
	if (await fse.pathExists(projectFolder)) {
		console.error(`project folder ${projectName} exists, please use another.`);
		vscode.window.showInformationMessage(`project folder ${projectName} exists, please use another`);
		return;
	}
	// create project folder
	try {
		await fse.ensureDir(projectFolder);
	} catch (err) {
		console.error(`failed to create project folder ${projectName}`);
		console.error(err);
		vscode.window.showInformationMessage(`failed to create project folder ${projectName}`);
		return;
	}
	console.debug(`created project ${projectFolder}`);
	// prepare template folder path
	let templatesFolder = path.resolve(__dirname,'../../../templates');
	// copy templates to project folder
	try {
		await fse.copy(path.join(templatesFolder, templateType), projectFolder);
	} catch (err) {
		console.error(`failed creating project ${projectName}`);
		console.error(err);
		vscode.window.showInformationMessage(`failed creating project ${projectName}`);
		return;
	}
	vscode.window.showInformationMessage(`OCM project ${projectName} created`);
}
