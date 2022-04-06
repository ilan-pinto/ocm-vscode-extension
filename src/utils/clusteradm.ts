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

export  function checkCommandExists(command: string): boolean {       
    shell.exec('command -v ' + command,function( code, stdout, stderr ): boolean {        
        if (code === 0 ){             
            console.log(command + " command exists " + stdout );
            return true; 
        } 
        console.log( command + " command doesn't exists " + stderr );
        return false;        
    });         
}







