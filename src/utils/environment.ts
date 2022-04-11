import * as shell from './shell';

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
		newPromise.catch(() => failure(`OCM extension, ${tool.name} is missing, please install it: ${tool.installUrl}`));
		return newPromise;
	});

	return Promise.all(executionPromises)
		.then(() => success('OCM extension, all tools are accessible, we\'re good to go'))
		.catch(() => failure('OCM extension, we\'re missing some tools'));
}
