import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fse from 'fs-extra';
import * as yaml from 'js-yaml';
import { beforeEach } from 'mocha';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { loadHelpers as loadResourceHelpers } from '../helpers/resourceHelpers';

chaiUse(chaiAsPromised);
loadResourceHelpers();

interface ExpectedTemplate {
	channelType: string,
	verifySubscription: CallableFunction
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve, _reject) => setTimeout(() => resolve(), ms));
}

// Test cases for the the ocm-vscode-extension.ocmNewProject command
suite('New-project command Suite', () => {
	var quickPickStub: sinon.SinonStub;
	var projectCreationDelayMS = 500;

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
		sinon.restore(); // unwrap previously wrapped sinon objects
		quickPickStub = sinon.stub(vscode.window, 'showQuickPick'); // stub the show quick pick
	});

	expectedTemplates.forEach(sut => {
		test(`Successfully create a project with a custom name for type ${sut.channelType}`, async () => {
			// wrap a spy around the information box
			let infoBoxSpy = sinon.spy(vscode.window, 'showInformationMessage');
			// given the following project name and path
			let projectNameInput = `dummy-project-name-${sut.channelType}`;
			let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
			// given the path doesn't already exists
			await fse.remove(projectFolder);
			// given the user will select the sut type in the pick box
			quickPickStub.resolves(sut.channelType);
			// given the user will input the project name
			sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
			// when invoking the command
			await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
			await sleep(projectCreationDelayMS); // wait a sec
			// grab the resource files
			let channel = yaml.load(await fse.readFile(`${projectFolder}/channel.yaml`, 'utf-8'));
			let subscription = yaml.load(await fse.readFile(`${projectFolder}/subscription.yaml`, 'utf-8'));
			return Promise.all([
				// then a folder with the project name should be created
				expect(fse.pathExists(projectFolder)).to.eventually.be.true,
				// then the created folder should contain the expected files
				expect(fse.readdir(projectFolder)).to.eventually.have.members(expectedTemplateFiles),
				// then a proper info message should be displayed to the user
				expect(infoBoxSpy.firstCall.firstArg).to.equal(`OCM extension, project ${projectNameInput} created`),
				// then the channel resource kind should be channel
				expect(channel).to.have.resourceKind('Channel'),
				// the the channel resource spec type should be as expected
				expect(channel).to.have.specType(sut.channelType),
				// then verify using the dynamic verification method
				sut.verifySubscription(subscription)
			]);
		});
	});

	test('Successfully create a project with the default name and type', async () => {
		// wrap a spy around the information box
		let infoBoxSpy = sinon.spy(vscode.window, 'showInformationMessage');
		// given the default path
		let projectFolder: string = path.resolve(__dirname, '../../../test-workspace/ocm-application');
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will not input a project name (type enter)
		sinon.stub(vscode.window, 'showInputBox').resolves('');
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		await sleep(projectCreationDelayMS); // wait a sec
		// grab the resource files
		let channel = yaml.load(await fse.readFile(`${projectFolder}/channel.yaml`, 'utf-8'));
		return Promise.all([
			// then a folder with the project name should be created
			expect(fse.pathExists(projectFolder)).to.eventually.be.true,
			// then the created folder should contain the expected files
			expect(fse.readdir(projectFolder)).to.eventually.have.members(expectedTemplateFiles),
			// then a proper info message should be displayed to the user
			expect(infoBoxSpy.firstCall.firstArg).to.equal('OCM extension, project ocm-application created'),
			// then the channel resource kind should be channel
			expect(channel).to.have.resourceKind('Channel'),
			// the the channel resource spec type should be Git
			expect(channel).to.have.specType('Git'),
		]);
	});

	test('Fail creating a new project when the folder already exists', async () => {
		// wrap a spy over vscode's error message box
		var errorBoxSpy = sinon.spy(vscode.window, 'showErrorMessage');
		// given the following project name and path
		let projectNameInput = 'existing-folder-name';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the folder already exists (with no files in it)
		await fse.emptyDir(projectFolder);
		// given the user will input the project name as the existing folder
		sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		await sleep(projectCreationDelayMS); // wait a sec
		return Promise.all([
			// then the folder should still exist
			expect(fse.pathExists(projectFolder)).to.eventually.be.true,
			// then the folder should still be empty (no templates copied)
			expect(fse.readdir(projectFolder)).to.eventually.be.empty,
			// then a proper info message should be displayed to the user
			expect(errorBoxSpy.firstCall.firstArg).to.be.equal(
				`OCM extension, project folder ${projectNameInput} exists, please use another`
			)
		]);
	});

	test('Fail creating a new project when not in a workspace', async () => {
		// wrap a spy over vscode's warning message box
		let warningBoxSpy = sinon.spy(vscode.window, 'showWarningMessage');
		// given the following project name and path
		let projectNameInput = 'non-existing-folder-name';
		let projectFolder: string = path.resolve(__dirname, `../../../test-workspace/${projectNameInput}`);
		// given the path doesn't already exists
		await fse.remove(projectFolder);
		// given the user will input the project name as the existing folder
		sinon.stub(vscode.window, 'showInputBox').resolves(projectNameInput);
		// given the workspace api will return undefined workspaceFolders
		sinon.stub(vscode.workspace, 'workspaceFolders').value(undefined);
		// when invoking the command
		await vscode.commands.executeCommand('ocm-vscode-extension.ocmNewProject');
		return Promise.all([
			// then the folder should not be created
			expect(fse.pathExists(projectFolder)).to.eventually.be.false,
			// then a proper info message should be displayed to the user
			expect(warningBoxSpy.firstCall.firstArg).to.equal(
				'OCM extension, no workspace folder, please open a project or create a workspace')
		]);
	});
});

/* ############################### ##
## Template Verification Functions ##
## ############################# ##*/
function verifyGitSubscription(subscriptionYaml: any): void {
	// verify kind
	expect(subscriptionYaml).to.have.resourceKind('Subscription');
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
	expect(subscriptionYaml).to.have.resourceKind('Subscription');
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
	expect(subscriptionYaml).to.have.resourceKind('Subscription');
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
