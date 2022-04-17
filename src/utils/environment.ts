import * as shell from './shell';

export const hub = "hub";
export const cluster1 = "cluster1";
export const cluster2 = "cluster2";

export const hubContext = `kind-${hub}`;
export const cluster1Context = `kind-${cluster1}`;
export const cluster2Context = `kind-${cluster2}`;


export interface Cluster {
	clusterName: string,
	clusterContext: string
	type: string //Hub or Spoke
}

export let clusters: Array<Cluster> = [
	{
		"clusterName": hub,
		"clusterContext": hubContext,
		"type": "Hub"
	}, 
	{
		"clusterName": cluster2,
		"clusterContext": cluster2Context,
		"type": "Spoke"
	},
	{ 
		"clusterName": cluster1,
		"clusterContext": cluster1Context,
		"type": "Spoke"
	}, 
];


export interface RequiredTool {
	name: string,
	installUrl: string
}

export const requiredTools: RequiredTool[] = [
	{
		'name': 'kubectl',
		'installUrl': 'https://kubernetes.io/docs/tasks/tools/#kubectl'
	},
	{
		'name': 'clusteradm',
		'installUrl': 'https://github.com/open-cluster-management-io/clusteradm#install-the-clusteradm-command-line'
	},
	{
		'name': 'kind',
		'installUrl': 'https://kind.sigs.k8s.io/docs/user/quick-start/#installation'
	}
];

// verify the the existence of the required tools in the environment's shell
// will be resolved with a string or rejected with a string[]
export async function verifyTools(...tools: RequiredTool[]): Promise<string|string[]> {
	let executionPromises: Promise<void | string>[] = tools.map(
		tool => shell.checkToolExists(tool.name).catch(
			() => Promise.reject([`OCM extension, ${tool.name} is missing, please install it`, tool.installUrl])
		)
	);
	return Promise.all(executionPromises)
		.then(() => Promise.resolve('OCM extension, all tools are accessible, we\'re good to go'))
		.catch( (err) =>  Promise.reject(err) );
}

// parse the locally installed clusteradm client and server version
// will be resolved with a string[] or rejected with a string
export async function parseClusteradmVersion(): Promise<string[] | string> {
	return new Promise((resolve, reject) => {
		// verify clusteradm exists
		shell.checkToolExists('clusteradm')
			.then(() => {
				// get clusteradm version
				shell.executeShellCommand('clusteradm version')
					.then((stdout: string) => {
						// parse version and resolve promise
						let clientVersion = stdout.split('\n')[0].split(':')[1].trim();
						let serverVersion = stdout.split('\n')[1].split(':')[1].trim();
						resolve([
							`OCM extension, found clusteradm client version ${clientVersion}`,
							`OCM extension, found clusteradm server version ${serverVersion}`
						]);
					})
					.catch((stderr: string) => reject(
						`OCM extension, unable to detect clusteradm version: ${stderr}`));
			})
			.catch(() => reject('OCM extension, looks like clusteradm is not installed'));
	});
}
