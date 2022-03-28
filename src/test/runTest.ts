import * as path from 'path';
import * as fse from 'fs-extra';
import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// the folder containing the extension manifest package.json, passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath: string = path.resolve(__dirname, '../../');
		// the path to test runner, passed to --extensionTestsPath
		const extensionTestsPath: string = path.resolve(__dirname, './suite/index');
		// the workspace folder designated for testing
		const testWorkspace: string = path.resolve(extensionDevelopmentPath, "test-workspace");
		await fse.ensureDir(testWorkspace);
		// run the integration test with latest vscode
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
        });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
