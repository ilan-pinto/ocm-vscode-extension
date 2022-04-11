import * as environment from '../utils/environment';
import * as vscode from 'vscode';

export function buildLocalClusters() {
	environment.verifyTools(
		vscode.window.showInformationMessage,
		vscode.window.showErrorMessage,
		...environment.requiredTools)
	.catch(() => vscode.window.showErrorMessage(
		'OCM extension, cannot proceed with local clusters creation, missing tools')
	).then(() => {
		// TODO: build local clusters here
		console.log("placeholder");
	});
}
