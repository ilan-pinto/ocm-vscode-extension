import * as valid from '../utils/clusteradm';
import * as vscode from 'vscode';
import { arrayBuffer } from 'node:stream/consumers';


//validate local env prerequisites
export function validatePrereq() {

    const mandatoryCommands = ['kubectl1', 'clusteradm','kind' ];
    const optionalCommands = ['oc'];    
    var promises = [];

    for (let cmd of mandatoryCommands) {               
       promises.push( valid.checkCommandExists(cmd));       
    }

    Promise.all(promises).then((value)=> console.log(value) ).catch((value)=> console.log(value)); 
}
