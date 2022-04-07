import * as valid from '../utils/clusteradm';
import * as vscode from 'vscode';


//validate local env prerequisites
export function validatePrereq() {

    const mandatoryCommands = ['kubectl', 'clusteradm','kind' ];
    const optionalCommands = ['oc'];

    for (let cmd of mandatoryCommands) {
        valid.checkCommandExists(
			cmd,
			(c: string) => vscode.window.showInformationMessage(`ocm extension found command ${c}`),
			(c: string) => vscode.window.showInformationMessage(`ocm extension did not found command ${c}`)
		);
    }
}
