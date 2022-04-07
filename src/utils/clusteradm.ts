import * as shell from 'shelljs' ;
import { callbackify } from 'util';
import * as vscode from 'vscode';

const successful = 1;
shell.config.execPath = String(shell.which('node'));

export function checkClusteradmVersion(){
    shell.exec('clusteradm version',function( code, stdout, stderr ){
        if (code === successful ){
            let clusterVersion = stdout.split(":")[1].trim();
            vscode.window.showInformationMessage("Clusteradm version: " + clusterVersion );
            return clusterVersion;
        }
        else {
            vscode.window.showErrorMessage("Unable to detect clusteradm version:  " + stderr );
        }
    });
}

export  function checkCommandExists(
	command: string, onSuccess: CallableFunction, onError: CallableFunction): void {

	shell.exec(`command -v ${command}`,function( code, stdout, stderr ): boolean {
        if (code === 0 ){
            onSuccess(command);
            return true;
        }
        onError(command);
        return false;
    });
}
