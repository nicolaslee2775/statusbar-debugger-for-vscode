
import * as vscode from 'vscode';

import { Button } from './Others/button';

import { Logger } from './Others/logger';
import * as Utils from './Others/utils';



//type ChangeReplModeHandler = (isToggleRepl: boolean) => void;
type ChangePanelModeHandler = () => void;


export class PanelButtonController {
	private button: Button;
	//private isToggleRepl: boolean;

	private changePanelModeHandler: ChangePanelModeHandler;

    constructor(context: vscode.ExtensionContext) {
		// Create button
		this.button = new Button(context);
		this.button.onClick(this._onTriggered, this);
    }

	dispose() {
		if(this.button) this.button.dispose();
		this.button = null;
		this.changePanelModeHandler = null;
    }

	onDidChangePanelMode(handler: ChangePanelModeHandler, thisArgs) {
		this.changePanelModeHandler = handler.bind(thisArgs);
	}

	//update(priority: number, isToggleRepl?: boolean) {
	update(priority: number, isTogglePanel: boolean) {
		//if(isToggleRepl) this.isToggleRepl;

		// Update button
		this.button.update({
			//text: (this.isToggleRepl ? '$(browser)' : '$(dash)') + ' ]',
			text: (isTogglePanel ? '$(browser)' : '$(dash)') + ' ]',
			tooltip: (isTogglePanel ? "Disply panel after launching debug" : "Don't disply panel after launching debug"),
			color: 'white',
			priority: priority
		});
	}

	show() {
		if(this.button) this.button.show();
	}

	hide() {
		if(this.button) this.button.hide();
	}

	private _onTriggered() {
		//this.isToggleRepl = !this.isToggleRepl;

		//if(this.changeReplModeHandler) this.changeReplModeHandler(this.isToggleRepl);
		if(this.changePanelModeHandler) this.changePanelModeHandler();
	};
}
