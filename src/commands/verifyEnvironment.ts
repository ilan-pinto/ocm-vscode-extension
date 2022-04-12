import * as environment from '../utils/environment';
import * as vscode from 'vscode';

// verify the required tools exists
export function verifyTools() {
	environment.verifyTools(
		vscode.window.showInformationMessage,
		vscode.window.showErrorMessage,
		...environment.requiredTools
	);
}

// get clusteradm version
export function getClusteradmVersion(){
	environment.parseClusteradmVersion(
		vscode.window.showInformationMessage,
		vscode.window.showErrorMessage
	);
}
