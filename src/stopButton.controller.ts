
import * as vscode from 'vscode';

import { Button } from './Others/button';


type TriggerHandler = () => void;

export class StopButtonController {
	private button: Button;
	private triggerHandler: TriggerHandler;


    constructor(context: vscode.ExtensionContext) {
		// Create button
		this.button = new Button(context);
		this.button.onClick(this._onTriggered, this);
	}

	dispose() {
        if(this.button) this.button.dispose();
		this.button = null;
    }
	
	onDidTrigger(handler: TriggerHandler, thisArg: Object) {
		this.triggerHandler = handler.bind(thisArg);
	}
	
	update(priority: number) {
		this.button.update({
			text: "$(x)",
			tooltip: "Stop Debug",
			color: "#ffa0a0",
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
		if(this.triggerHandler) this.triggerHandler();
	}
}