'use strict';

import * as vscode from 'vscode';
import { MainController } from './main.controller';
import { Logger } from './Others/logger';

import { Button } from './Others/button';

export function activate(context: vscode.ExtensionContext) {
	Logger.log("\nstatusbar-debugger is activated!\n");

    const mainCtrl = new MainController(context);

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(mainCtrl.onChangeConfiguration, mainCtrl));
    context.subscriptions.push(mainCtrl);
}

export function deactivate() {
}
