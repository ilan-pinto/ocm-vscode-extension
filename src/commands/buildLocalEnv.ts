import * as valid from '../utils/clusteradm';
import * as vscode from 'vscode';
import { arrayBuffer } from 'node:stream/consumers';
import { resolve } from 'node:path';
import { rejects } from 'node:assert';


//validate local env prerequisites
export function validatePrereq(): Promise<void>[] {

    const mandatoryCommands = ['kubectl1', 'clusteradm','kind' ];
    const optionalCommands = ['oc'];

	var cmdExecutionPromises: Promise<void>[] = [];

	mandatoryCommands.forEach(cmd => {
        let executionPromise = valid.checkCommandExists(cmd);
		cmdExecutionPromises.push(executionPromise);
    });

	return cmdExecutionPromises;

}

export async function buildLocalCluster() { 
    
    await Promise.all(validatePrereq())
    .then( () => {        
        vscode.window.showInformationMessage('building cluster ');
        
    })
    .catch(() => {
        vscode.window.showErrorMessage('ocm extension did not all of the required commands');                                   
    } );
        

}
