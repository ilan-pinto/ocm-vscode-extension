import * as environment from '../utils/environment';
import * as vscode from 'vscode';
import * as shell from '../utils/shell';

const hub = "hub";
const cluster1 = "cluster1"; 
const cluster2 = "cluster2"; 

const hubContext = `kind-${hub}`;
const cluster1Context = `kind-${cluster1}`;
const cluster2Context = `kind-${cluster2}`;



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
		vscode.window.showErrorMessage('Building local env'); 

		shell.buildLocalEnv(
		).then( () => vscode.window.showInformationMessage('local env is ready')
		).catch( (err ) => vscode.window.showErrorMessage( 'Unable to create local OCM :' + err ) );
	});
}
