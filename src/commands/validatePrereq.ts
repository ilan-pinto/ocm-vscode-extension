import * as valid from '../utils/clusteradm'; 
import * as vscode from 'vscode';


//validate local env prerequisites 
export function validatePrereq() {

    const mandatoryCommands = ['kubectl', 'clusteradm','kind' ]; 
    const optionalCommands = ['oc']; 

    for (const command of mandatoryCommands) {    
        if (valid.checkCommandExists(command) === false) {
            vscode.window.showErrorMessage( command + " command doesn't exists."  );
        }; 
    }
}