import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { createProjectFromTemplate } from '../src/utils/filesystem';
import * as fse from 'fs-extra';

chaiUse(chaiAsPromised);

suite('Test cases for the filesystem utility functions', () => {
	suite('Testing createProjectFromTemplate', () => {
		let dummyWorkspaceFolder = '/path/to/workspace/folder';
		let dummyProjectName = 'create-template-unit-test1';
		let dummyProjectPath = `${dummyWorkspaceFolder}/${dummyProjectName}`;

		beforeEach(() => sinon.restore());

		test('When checking with an existing project folder, the promise should be rejected', async () => {
			// @ts-ignore given the project path already exists
			sinon.stub(fse, 'pathExists').withArgs(dummyProjectPath).resolves(true);
			// then the promise should be rejected
			return expect(createProjectFromTemplate(dummyWorkspaceFolder, dummyProjectName, 'Git'))
				.to.be.eventually.rejectedWith(
					`OCM extension, project folder ${dummyProjectName} exists, please use another`
				);
		});

		test('When failed to create the project folder, the promise should be rejected', async () => {
			// @ts-ignore given the project path doesn't already exists
			sinon.stub(fse, 'pathExists').withArgs(dummyProjectPath).resolves(false);
			// given the path creation will be rejected with an error
			sinon.stub(fse, 'ensureDir').withArgs(dummyProjectPath).rejects('the answer is not 41');
			// then the promise should be rejected
			return expect(createProjectFromTemplate(dummyWorkspaceFolder, dummyProjectName, 'Git'))
				.to.be.eventually.rejectedWith(
					`OCM extension, failed to create project folder ${dummyProjectName}, the answer is not 41`
				);
		});

		test('When failed to copy the template files to the project folder, the promise should be rejected', async () => {
			// @ts-ignore given the project path doesn't already exists
			sinon.stub(fse, 'pathExists').withArgs(dummyProjectPath).resolves(false);
			// given the path creation will be resolved
			sinon.stub(fse, 'ensureDir').withArgs(dummyProjectPath).resolves();
			// @ts-ignore given the copy process will be rejected with an error
			sinon.stub(fse, 'copy').withArgs(sinon.match.string ,dummyProjectPath).rejects('it is also not 43');
			// then the promise should be rejected
			return expect(createProjectFromTemplate(dummyWorkspaceFolder, dummyProjectName, 'Git'))
				.to.be.eventually.rejectedWith(
					`OCM extension, failed creating project ${dummyProjectName}, it is also not 43`
				);
		});

		test('When the template files are copied to the project folder successfully, the promise should be resolved', async () => {
			// @ts-ignore given the project path doesn't already exists
			sinon.stub(fse, 'pathExists').withArgs(dummyProjectPath).resolves(false);
			// given the path creation will be resolved
			sinon.stub(fse, 'ensureDir').withArgs(dummyProjectPath).resolves();
			// @ts-ignore given the copy process will be resolved
			sinon.stub(fse, 'copy').withArgs(sinon.match.string ,dummyProjectPath).resolves();
			// then the promise should be rejected
			return expect(createProjectFromTemplate(dummyWorkspaceFolder, dummyProjectName, 'Git'))
				.to.be.eventually.fulfilled.and.equals(`OCM extension, project ${dummyProjectName} created`);
		});
	});
});