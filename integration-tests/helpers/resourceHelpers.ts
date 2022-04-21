import { Assertion } from 'chai';

// use declaration merging to add custom assertion helpers to chai
declare global {
	export namespace Chai {
		interface Assertion {
			resourceKind(expectedKind: string): Assertion;
			specType(expectedType: string): Assertion;
		}
	}
}

// load the helpers
export function loadHelpers() {
	// helper for asserting the kind object of a k8s resource
	Assertion.addChainableMethod('resourceKind', function(expectedKind: string) {
		let resourceFile = this._obj;
		let foundKind = resourceFile['kind'];
		this.assert(
			foundKind === expectedKind,
			'expected the resource to be of kind #{exp} but got #{act}',
			'expected the resource to not be of kind #{act}',
			expectedKind,
			foundKind
		);
	});

	// helper for asserting the type object in the spec object
	Assertion.addChainableMethod('specType', function(expectedType: string) {
		let resourceFile = this._obj;
		let foundType = resourceFile['spec']['type'];
		this.assert(
			foundType === expectedType,
			'expected the channel to be of type #{exp} but got #{act}',
			'expected the channel to not be of type #{act}',
			expectedType,
			foundType
		);
	});
}
