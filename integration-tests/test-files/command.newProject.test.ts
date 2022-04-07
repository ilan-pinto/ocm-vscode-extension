import { expect } from 'chai';
import * as fse from 'fs-extra';
import * as yaml from 'js-yaml';
import { afterEach, beforeEach } from 'mocha';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

interface ExpectedTemplate {
	channelType: string,
	verifySubscription: CallableFunction
}

// Test cases for the the ocm-vscode-extension.ocmNewProject command
suite('New-project command Suite', () => {
	var infoBoxSpy: sinon.SinonSpy;
	var quickPickStub: sinon.SinonStub;
	var inputBoxStub: sinon.SinonStub;

	// expected template files
	const expectedTemplateFiles = [
		'00-namespaces.yaml',
		'README.md',
		'channel.yaml',
		'clusterset.yaml',
		'clustersetbinding.yaml',
		'placement.yaml',
		'subscription.yaml'
	];

	// expected template types and verification functions
	const expectedTemplates: ExpectedTemplate[] = [
		{
			channelType: 'Git',
			verifySubscription: verifyGitSubscription
		},
		{
			channelType: 'HelmRepo',
			verifySubscription: verifyHelmRepoSubscription
		},
		{
			channelType: 'ObjectBucket',
			verifySubscription: verifyObjectBucketSubscription
		}
	];

	beforeEach(() => {
		// wrap a spy around the information box
		infoBoxSpy = sinon.spy(vscode.window, 'showInformationMessage');
		// stub the show quick pick
		quickPickStub = sinon.stub(vscode.window, 'showQuickPick');
	});

	afterEach(() => {
		infoBoxSpy.restore(); // unwrap the information box spy
		quickPickStub.restore(); // unwrap the quick pick stub
		inputBoxStub.restore(); // unwrap the input box stub
	});

	expectedTemplates.forEach(sut => {
		test(`Successfully create a project with a custom name for type ${sut.channelType}`, async () => {
			// given the following project name and path
			let projectNameInput = `dummy-project-name-${sut.channelType}`;
			let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
			// given the path doesn't already exists
			await fse.remove(projectFolder);
			// given the user will select the sut type in the pick box
			quickPickStub.resolves(sut.channelType);
			// given the user will input the project name
			inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
			// when invoking the command
			await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
			// then a folder with the project name should be created
			let pathCreated: boolean = await fse.pathExists(projectFolder);
			expect(pathCreated).to.be.true;
			// then the created folder should contain the expected files
			let createdFiles: string[] = await fse.readdir(projectFolder);
			expect(createdFiles).to.have.members(expectedTemplateFiles);
			// then a proper info message should be displayed to the user
			let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
			expect(infoBoxCall.firstArg).to.equal(`OCM project ${projectNameInput} created`);
			// then the channel resource type is the expected type
			let channelResource: any = yaml.load(await fse.readFile(`${projectFolder}/channel.yaml`, 'utf-8'));
			expect(channelResource['spec']['type']).to.equal(sut.channelType);
			// then the subscription resource type contains the related annotations.
			let subscriptionResource: any = yaml.load(await fse.readFile(`${projectFolder}/subscription.yaml`, 'utf-8'));
			sut.verifySubscription(subscriptionResource);
		});
	});

	test('Successfully create a project with the default name and type', async () => {
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
		expect(createdFiles).to.have.members(expectedTemplateFiles);
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal('OCM project ocm-application created');
		// then the channel resource type is the the default Git type
		let channelResource: any = yaml.load(await fse.readFile(`${projectFolder}/channel.yaml`, 'utf-8'));
		expect(channelResource['spec']['type']).to.equal('Git');
	});

	test('Fail creating a new project when the folder already exists', async () => {
		// given the following project name and path
		let projectNameInput = 'existing-folder-name';
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
		let projectNameInput = 'non-existing-folder-name';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will input the project name as the existing folder
		inputBoxStub = sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// given the workspace api will return undefined workspaceFolders
		let workspaceFolderStub = sinon.stub(vscode.workspace, 'workspaceFolders').value(undefined);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		// then the folder should not be created
		let pathCreated: boolean = await fse.pathExists(projectFolder);
		expect(pathCreated).to.be.false;
		// then a proper info message should be displayed to the user
		let infoBoxCall: sinon.SinonSpyCall = infoBoxSpy.getCalls()[0]; // get the first call to the spy
		expect(infoBoxCall.firstArg).to.equal('no workspace folder, please open a project or create a workspace');
		// unwrap the workspace folders stub
		workspaceFolderStub.restore();
	});

	/* ############################# ##
	## Template Verification Helpers ##
	## ############################# ##*/
	function verifyGitSubscription(subscriptionYaml: any): void {
		// verify kind
		expect(subscriptionYaml['kind']).to.equal('Subscription');
		// verify metadata keys
		expect(subscriptionYaml['metadata']).to.contain.keys(['name', 'namespace']);
		// verify metadata annotations
		let expectedAnnotationKeys = [
			'apps.open-cluster-management.io/git-branch',
			'apps.open-cluster-management.io/git-path',
			'apps.open-cluster-management.io/git-tag',
			'apps.open-cluster-management.io/git-desired-commit',
			'apps.open-cluster-management.io/git-clone-depth',
			'apps.open-cluster-management.io/reconcile-option',
			'apps.open-cluster-management.io/reconcile-rate'
		];
		let existingAnnotations = subscriptionYaml['metadata']['annotations'];
		expect(existingAnnotations).to.have.keys(expectedAnnotationKeys);
	}

	function verifyHelmRepoSubscription(subscriptionYaml: any): void {
		// verify kind
		expect(subscriptionYaml['kind']).to.equal('Subscription');
		// verify metadata keys
		expect(subscriptionYaml['metadata']).to.contain.keys(['name', 'namespace']);
		// verify metadata annotations
		let expectedAnnotationKeys = [
			'apps.open-cluster-management.io/reconcile-option',
			'apps.open-cluster-management.io/reconcile-rate'
		];
		let existingAnnotations = subscriptionYaml['metadata']['annotations'];
		expect(existingAnnotations).to.have.keys(expectedAnnotationKeys);
		// verify spec packageOverrides
		let packageOverrides = subscriptionYaml['spec']['packageOverrides'][0];
		expect(packageOverrides).to.contain.keys(['packageName', 'packageAlias']);
	}

	function verifyObjectBucketSubscription(subscriptionYaml: any): void {
		// verify kind
		expect(subscriptionYaml['kind']).to.equal('Subscription');
		// verify metadata keys
		expect(subscriptionYaml['metadata']).to.contain.keys(['name', 'namespace']);
		// verify metadata annotations
		let expectedAnnotationKeys = [
			'apps.open-cluster-management.io/bucket-path',
			'apps.open-cluster-management.io/reconcile-option',
			'apps.open-cluster-management.io/reconcile-rate'
		];
		let existingAnnotations = subscriptionYaml['metadata']['annotations'];
		expect(existingAnnotations).to.have.keys(expectedAnnotationKeys);
	}
});
