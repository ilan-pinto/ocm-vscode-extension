import * as shell from 'shelljs' ;

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
export  function buildLocalEnv() {

	shell.exec()

}
