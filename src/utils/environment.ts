import * as shell from './shell';


export const hub = "hub";
export const cluster1 = "cluster1"; 
export const cluster2 = "cluster2"; 

export const hubContext = `kind-${hub}`;
export const cluster1Context = `kind-${cluster1}`;
export const cluster2Context = `kind-${cluster2}`;




export interface RequiredTool {
	name: string,
	installUrl: string
}



interface LoggerCallback {
	(msg: string): void
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
export async function verifyTools(
	success: LoggerCallback, failure: LoggerCallback, ...tools: RequiredTool[]): Promise<void> {

	let executionPromises: Promise<void>[] = tools.map(tool => {
		let newPromise = shell.checkToolExists(tool.name);
		newPromise.catch(() => failure(
			`OCM extension, ${tool.name} is missing, please install it: ${tool.installUrl}`
		));
		return newPromise;
	});

	let retPromise = Promise.race(executionPromises);
	retPromise.then(() => success('OCM extension, all tools are accessible, we\'re good to go'));
	retPromise.catch(() => failure('OCM extension, we\'re missing some tools'));
	return retPromise;
}

// parse the locally installed clusteradm client and server version
export async function parseClusteradmVersion(success: LoggerCallback,failure: LoggerCallback): Promise<void> {
	await shell.checkToolExists('clusteradm')
		.catch(() => {
			failure('OCM extension, looks like clusteradm is not installed');
			return Promise.reject();
		})
		.then(() => {
			let versionExecutionPromise = shell.executeShellCommand('clusteradm version');
			versionExecutionPromise.then((stdout: string) => {
				let clientVersion = stdout.split('\n')[0].split(':')[1].trim();
				let serverVersion = stdout.split('\n')[1].split(':')[1].trim();
				success(`OCM extension, found clusteradm client version ${clientVersion}`);
				success(`OCM extension, found clusteradm server version ${serverVersion}`);
			});
			versionExecutionPromise.catch((stderr: string) => {
				failure(`OCM extension, unable to detect clusteradm version: ${stderr}`);
			});
			return versionExecutionPromise;
		});
}
