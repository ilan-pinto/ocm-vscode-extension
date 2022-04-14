import * as environment from '../utils/environment';
import * as vscode from 'vscode';

// verify the required tools exists
export function verifyTools() {
	environment.verifyTools(...environment.requiredTools)
		.then((msg: string) => vscode.window.showInformationMessage(msg))
		.catch((msg: string) => vscode.window.showErrorMessage(msg));
}

// get clusteradm version
export function getClusteradmVersion(){
	environment.parseClusteradmVersion()
		// @ts-ignore
		.then((msgs: string[]) => msgs.forEach(msg => vscode.window.showInformationMessage(msg)))
		.catch((msg: string) => vscode.window.showErrorMessage(msg));
}
