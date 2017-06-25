
import * as vscode from 'vscode';

import { Button } from './Others/button';

import { Logger } from './Others/logger';
import * as Utils from './Others/utils';



type ChangeLanuchConfigHandler = (selectedIndex: number) => void;


export class ConfigButtonController {
	private button: Button;

	private optionList: any[] = [];
	private quickPickItems: vscode.QuickPickItem[] = [];

	private selectedOption: any;
	private selectedIndex: number;

	private changeLanuchConfigHandler: ChangeLanuchConfigHandler;

    constructor(context: vscode.ExtensionContext) {
		// Create button
		this.button = new Button(context);
		this.button.onClick(this._onTriggered, this);
    }

	dispose() {
		if(this.button) this.button.dispose();
		this.button = null;
		this.optionList = null;
		this.quickPickItems = null;
		this.changeLanuchConfigHandler = null;
    }

	onDidChangeLaunchConfig(handler: ChangeLanuchConfigHandler, thisArgs) {
		this.changeLanuchConfigHandler = handler.bind(thisArgs);
	}

	update(priority: number, optionList: any[], selectedOption: any) {
		this.optionList = optionList;
		this.selectedOption = selectedOption;

		// Create quickPickItem
		this.quickPickItems = optionList.map((item, index) => ({ label: item.displayName , description: item.config.name, index: index }) );

		// Update button
		this.button.update({
			text: (selectedOption.displayName || selectedOption.config.name),
			tooltip: 'Select launch config', //selectedOption.tooltip || selectedOption.config.name,
			color: selectedOption.color || "white",
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
		vscode.window.showQuickPick(this.quickPickItems, {placeHolder: 'Select the launch config'})
			.then(quickPickItem => {
				if(!quickPickItem) return;

				let selectedItem = quickPickItem as any;
				this.selectedIndex = selectedItem.index;

				// Notify the handler (let the MainCtrl to update buttons)
				if(this.changeLanuchConfigHandler) this.changeLanuchConfigHandler(this.selectedIndex);
			});
	};
}

/*
export class ConfigButtonController {
	private context: vscode.ExtensionContext;
	private button: Button;

	private optionList: any[] = [];
	private quickPickItems: vscode.QuickPickItem[] = [];

	private selectedOption: any;
	private selectedIndex: number;

	private changeLanuchConfigHandler: ChangeLanuchConfigHandler;

    constructor(context: vscode.ExtensionContext, priority?: number) {
		this.context = context;
		
		this.initButton(priority);
    }

	dispose() {
		if(this.button) this.button.dispose();
		this.button = null;
		this.context = null;
		this.optionList = null;
		this.quickPickItems = null;
		this.changeLanuchConfigHandler = null;
    }

	onDidChangeLaunchConfig(handler: ChangeLanuchConfigHandler, thisArgs) {
		this.changeLanuchConfigHandler = handler.bind(thisArgs);
	}

	update(optionList: any[], selectedOption: any) {
		this.optionList = optionList;
		this.selectedOption = selectedOption;
		// Create quickPickItem
		this.quickPickItems = optionList.map((item, index) => ({ label: item.displayName , description: item.config.name, index: index }) );

		this.button.update({
			text: selectedOption.displayName || selectedOption.config.name,
			tooltip: selectedOption.tooltip || selectedOption.config.name,
			color: selectedOption.color || "white"
		});
	}

	updatePriority(priority: number) {
		this.initButton(priority);
	}


	private initButton(priority?: number) {
		if(this.button) this.button.dispose();
		this.button = null;

		// Create button
		this.button = new Button(this.context, {text: '', priority: priority});
		this.button.onClick(this.onTriggered, this);
	}

	private onTriggered() {
		vscode.window.showQuickPick(this.quickPickItems, {placeHolder: 'Select the launch config'}).then(quickPickItem => {
			if(!quickPickItem) return;

			let selectedItem = quickPickItem as any;
			this.selectedIndex = selectedItem.index;

			// Notify the handler (let the MainCtrl to update buttons)
			if(this.changeLanuchConfigHandler) this.changeLanuchConfigHandler(this.selectedIndex);
		});
	};
}*/