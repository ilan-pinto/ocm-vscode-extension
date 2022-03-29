import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
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

	test('Successfully create a project with a custom name', async () => {
		// given the following project name and path
		let projectNameInput: string = "custom-name-project";
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will input the project name
		let inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vs-extension.ocmNewProject');
		// then a folder with the project name should be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.true;
		// then the created folder should contain the expected files
		let createdFiles: string[] = await fse.readdir(projectFolder);
		expect(createdFiles).to.have.members(expectedProjectFiles);
		// cleanups
		inputBoxStub.restore();
	});

	test('Successfully create a project with the default name', async () => {
		// given the default path
		let projectFolder: string = path.resolve(__dirname, '../../../test-workspace/ocm-application');
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will not input a project name (type enter)
		let inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves("");
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vs-extension.ocmNewProject');
		// then a folder with the project name should be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.true;
		// then the created folder should contain the expected files
		let createdFiles: string[] = await fse.readdir(projectFolder);
		expect(createdFiles).to.have.members(expectedProjectFiles);
		// cleanups
		inputBoxStub.restore();
	});
});
