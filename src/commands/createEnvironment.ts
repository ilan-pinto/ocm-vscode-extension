import * as environment from '../utils/environment';
import * as vscode from 'vscode';
import * as shell from '../utils/shell';

export async function buildLocalClusters() {
	environment.verifyTools(
		vscode.window.showInformationMessage,
		vscode.window.showErrorMessage,
		...environment.requiredTools)
	.then(
		  () => {
			// TODO: build local clusters here
			vscode.window.showInformationMessage('Building local env');

			console.log("placeholder");
			shell.buildLocalEnv();
				
			
		}).catch(() => vscode.window.showErrorMessage('OCM extension, cannot proceed with local clusters creation, missing tools'));
}
