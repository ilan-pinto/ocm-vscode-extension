import * as assert from 'assert';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';

suite('New-project command Suite', () => {

	const expectedProjectFiles: string[] = [
		'00-namespaces.yaml',
		'README.md',
		'channel.yaml',
		'clusterset.yaml',
		'clustersetbinding.yaml',
		'placement.yaml',
		'subscription.yaml'
	];

	test('Successful project creation', async () => {
		// given the following project name and path
		let projectFolderName: string = "successful-project";
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectFolderName}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// when invoking the command with the project name
		await vscode.commands.executeCommand('ocm-vs-extension.ocmNewProject');
		// await vscode.commands.executeCommand('type', {text: projectFolderName});
		// then a folder with the project name should be created with exactly the expected files
		let createdFiles: string[] = await fse.readdir(projectFolder);
		let verifyAllAExistInB = (a: string[], b: string[]) => a.every((v: string) => b.includes(v));
		assert.strictEqual(expectedProjectFiles.length, createdFiles.length);
		assert.strictEqual(true, verifyAllAExistInB(expectedProjectFiles, createdFiles));
		assert.strictEqual(true, verifyAllAExistInB(createdFiles, expectedProjectFiles));
	});
});
