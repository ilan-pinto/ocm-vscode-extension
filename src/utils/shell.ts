import * as shell from 'shelljs' ;
import * as env from './environment';

shell.config.execPath = String(shell.which('node'));

// execute a command and return a promise of the output as string
export function executeShellCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
		let execution = shell.exec(command);
		if (execution.code === 0) {
			resolve(execution.stdout);
		}
		reject(execution.stderr);
	});
}

// check if a cli tool exists and return a promise
export  function checkToolExists(tool: string): Promise<void> {
	return new Promise((resolve, reject) => {
		let execution = shell.exec(`command -v ${tool}`);
		if (execution.code === 0) {
			resolve();
		}
		reject();
	});
}

// starts a local OCM kind env and return a promise
export async function buildLocalEnv() {

	// TODO - check docker/podman engine is active

	console.log('creating clusters');
	shell.exec('kind create cluster --name ' + env.hub); 
	shell.exec('kind create cluster --name ' + env.cluster1); 
	shell.exec('kind create cluster --name ' + env.cluster2);

	console.log('init hub');
	const joinCmd = shell.exec(`kubectl config use ${env.hubContext} && clusteradm init --use-bootstrap-token`).grep('clusteradm'); 
	
	console.log('init Join cluster1 to hub');
	shell.exec(`kubectl config use ${env.cluster1Context}`);
	const fullJoinCmd = shell.echo( joinCmd ).sed('<cluster_name>', env.cluster1).sed('\n',' ');

	shell.exec(fullJoinCmd + ` --force-internal-endpoint-lookup --wait`);


	console.log('init Join cluster2 to hub');
	shell.exec(`kubectl config use ${env.cluster2Context}`);
	const fullJoinCmd2 = shell.echo( joinCmd ).sed('<cluster_name>', env.cluster2).sed('\n',' '); 

	shell.exec(fullJoinCmd2 + ` --force-internal-endpoint-lookup --wait`);

	await setTimeout(() =>{
		console.log('Accept join of cluster1 and cluster2');
		shell.echo(`clusteradm accept --clusters ${env.cluster1},${env.cluster2} --wait`);
	}, 1000 );


}
