import cluster from 'cluster';
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

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve, _reject) => setTimeout(() => resolve(), ms));
}

// starts a local OCM kind env and return a promise
export function buildLocalEnv() {
	// TODO - check docker/podman engine is active

	initClusters(env.clusters);
	const joinCmd = initHub(); 	
	joinClusters(joinCmd, env.clusters );	
	approveClusters(env.clusters);
}


// init kind clusters 
function initClusters(clusters: Array<env.Cluster>) {

	console.log('creating clusters');
	clusters.forEach(cluster => {
		shell.exec('kind create cluster --name ' + cluster.clusterName);	
	});
}

// init hub cluster and return join command 
function initHub() {
	console.log('init hub');
	const joinCmd = shell.exec(`kubectl config use ${env.hubContext} && clusteradm init --use-bootstrap-token`).grep('clusteradm');
	return joinCmd;
}

// join spoke clusters 
function joinClusters(joinCmd: shell.ShellString , clusters: Array<env.Cluster>) {

	clusters.filter( cluster => cluster.type === "Spoke").forEach(cluster => {
		console.log('init Join ' + cluster.clusterName + ' to hub');
		shell.exec(`kubectl config use ${cluster.clusterContext}`);
		let fullJoinCmd = shell.echo(joinCmd + ` --force-internal-endpoint-lookup --wait`).sed('<cluster_name>', cluster.clusterName).sed('\n', ' ').toString().replace(/(\r\n|\n|\r)/gm, "");
		shell.exec(fullJoinCmd);		
	});

}

// hub approve spokes 
function approveClusters(clusters: Array<env.Cluster> ) {
	clusters
	.filter( cluster =>	cluster.type === "Hub")
	.forEach(cluster => {		 
		shell.exec(`kubectl config use  ` + cluster.clusterContext );
	});


	clusters
		.filter( cluster => cluster.type === "Spoke")
		.forEach(cluster => {
			console.log('Accept join of: ' + cluster.clusterName );
			let res = shell.exec(`clusteradm accept --clusters ` + cluster.clusterName );				
		});
}
