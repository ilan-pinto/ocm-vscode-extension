
import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';

export async function create (projectName: string) {
		// verify inside workspace
		if(vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showInformationMessage('no workspace folder, please open a project or create a workspace.');
			return;
		}
		// prepare project folder path
		let workspaceFolder: string = vscode.workspace.workspaceFolders[0].uri.path ;
		let projectFolder: string = path.join(workspaceFolder, projectName);
		// verify project folder doesn't exists
		if (await fse.pathExists(projectFolder)) {
			vscode.window.showInformationMessage(`project folder ${projectName} exists, please use another.`);
			return;
		}
		// create project folder
		try {
			await fse.ensureDir(projectFolder);
		} catch (err) {
			console.error(err);
			vscode.window.showInformationMessage(`failed to create project folder ${projectName}.`);
			return;
		}
		console.debug(`created project ${projectFolder}`);
		// prepare template folder path
		let templatesFolder = path.resolve(__dirname,'..');
		// copy templates to project folder
		try {
			await fse.copy(path.join(templatesFolder, "templates"), projectFolder);
		} catch (err) {
			console.error(err);
			vscode.window.showInformationMessage(`failed creating project ${projectName}`);
			return;
		}
		vscode.window.showInformationMessage(`OCM project ${projectName} created.`);
	}
