import { expect } from 'chai';
import * as fse from 'fs-extra';
import { afterEach, beforeEach } from 'mocha';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

suite('New-project command Suite', () => {
	var infoBoxSpy: sinon.SinonSpy;
	var quickPickStub: sinon.SinonStub;
	var inputBoxStub: sinon.SinonStub;

	const expectedProjectFiles: string[] = [
		'00-namespaces.yaml',
		'README.md',
		'channel.yaml',
		'clusterset.yaml',
		'clustersetbinding.yaml',
		'placement.yaml',
		'subscription.yaml'
	];

	beforeEach(() => {
		// wrap a spy around the information box
		infoBoxSpy = sinon.spy(vscode.window, 'showInformationMessage');
		// stub the show quick pick to return git always
		quickPickStub = sinon.stub(vscode.window, 'showQuickPick');
		// @ts-ignore ts(2345)
		quickPickStub.withArgs(sinon.match(['git', 'helm', 'object'])).resolves('git');
		// TODO: currently we support only git so this can be centralized
	});

	afterEach(() => {
		infoBoxSpy.restore(); // unwrap the information box spy
		quickPickStub.restore(); // unwrap the quick pick stub
		inputBoxStub.restore(); // unwrap the input box stub
	});

	test('Successfully create a project with a custom name', async () => {
		// given the following project name and path
		let projectNameInput: string = 'custom-name-project';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will input the project name
		inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		// then a folder with the project name should be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.true;
		// then the created folder should contain the expected files
		let createdFiles: string[] = await fse.readdir(projectFolder);
		expect(createdFiles).to.have.members(expectedProjectFiles);
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal(`OCM project ${projectNameInput} created`);
	});

	test('Successfully create a project with the default name', async () => {
		// given the default path
		let projectFolder: string = path.resolve(__dirname, '../../../test-workspace/ocm-application');
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will not input a project name (type enter)
		inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves('');
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		// then a folder with the project name should be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.true;
		// then the created folder should contain the expected files
		let createdFiles: string[] = await fse.readdir(projectFolder);
		expect(createdFiles).to.have.members(expectedProjectFiles);
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal('OCM project ocm-application created');
	});

	test('Fail creating a new project when the folder already exists', async () => {
		// given the following project name and path
		let projectNameInput: string = 'existing-folder-name';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the folder already exists (with no files in it)
		await fse.emptyDir(projectFolder);
		// given the user will input the project name as the existing folder
		inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		// then the folder should still exist
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.true;
		// then the folder should still be empty (no templates copied)
		let createdFiles: string[] = await fse.readdir(projectFolder);
		expect(createdFiles).to.be.empty;
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal(`project folder ${projectNameInput} exists, please use another`);
	});

	test('Fail creating a new project when not in a workspace', async () => {
		// given the following project name and path
		let projectNameInput: string = 'non-existing-folder-name';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will input the project name as the existing folder
		inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// given the workspace api will return undefined workspaceFolders
		let workspaceFldrStub = sinon.stub(vscode.workspace, 'workspaceFolders').value(undefined);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		// then the folder should not be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.false;
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal('no workspace folder, please open a project or create a workspace');
		// unwrap the workspace folders stub
		workspaceFldrStub.restore();
	});
});
