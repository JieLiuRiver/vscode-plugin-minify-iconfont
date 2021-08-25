import * as vscode from 'vscode';
import { Provider } from './provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(Provider.register(context))
}

export function deactivate() { }
