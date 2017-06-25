import * as vscode from 'vscode';

import { IndexGenerator } from './indexGenerator';

import { Output } from './output';
import { Logger } from './logger';
import { simpleClone } from './utils';


interface ButtonOptions {
	text?: string;
	tooltip?: string;
	color?: string;

	alignment?: vscode.StatusBarAlignment;
	priority?: number;

	callback?: (...any) => void;
	callbackThisArg?: Object;
	callbackArgs?: any[];
}

const COMMAND_PREFIX = "extension.statusbar_debugger._buttonCallback";

export class Button {
	private index: number;
	options: ButtonOptions = {};	
	
	callbackCommand: string;

	statusBarItem: vscode.StatusBarItem;
	commandDisposable: vscode.Disposable; 

	//include: RegExp;
	//exclude: RegExp;


	constructor(private context: vscode.ExtensionContext, options?: ButtonOptions) {

		// Create callback command
		this.index = IndexGenerator.get();
		let callbackCommand = (COMMAND_PREFIX + this.index);

		// Registor command
		let commandDisposable = vscode.commands.registerCommand(callbackCommand, this._onTrigger.bind(this));
		context.subscriptions.push(commandDisposable);

		// Save them
		this.commandDisposable = commandDisposable;
		this.callbackCommand = callbackCommand;


		Logger.log(`Button${this.index} init... (${callbackCommand})`);

		if(options) {
			this.options = options;
			this._createStatusBarItem();
		}

	}

	dispose() {
		if (this.statusBarItem) {
			Logger.log(`Button${this.index} disposed!`);
			this.statusBarItem.dispose();
			this.statusBarItem = null;
			this.commandDisposable.dispose();
			this.options = null;
			IndexGenerator.remove(this.index);
		}
	}

	update(options: ButtonOptions) {
		Logger.log("Button update!");

		/*if(options.text)			this.options.text 			= options.text;
		if(options.tooltip)			this.options.tooltip		= options.tooltip;
		if(options.color)			this.options.color 			= options.color;
		if(options.alignment !== undefined)		this.options.alignment 	= options.alignment;
		if(options.priority !== undefined)		this.options.priority 	= options.priority;
		if(options.callback)		this.options.callback 		= options.callback;
		if(options.callbackThisArg)	this.options.callbackThisArg = options.callbackThisArg;
		if(options.callbackArgs)	this.options.callbackArgs 	= options.callbackArgs;*/

		
		simpleClone({ from: options, to: this.options, if: (prop, val) => val !== undefined});

		//Object.assign(this.options, options);

		/*if(options.priority !== undefined || options.alignment !== undefined) {
			this._createStatusBarItem();
		} else {
			this._updateStatusBarItem();
		}*/
		this._createStatusBarItem();		
	}

	show() {
		this.statusBarItem.show();
	}

	hide() {
		this.statusBarItem.hide();
	}

	onClick(callback: (...any) => void, callbackThisArg?: Object) {
		this.options.callback = callback;
		if(callbackThisArg) this.options.callbackThisArg = callbackThisArg;
	}


	private _onTrigger() {
		try {
			//Logger.log(`command '${this.statusBarItem.command}' is triggered!`);
			if(this.options.callback) this.options.callback.apply(this.options.callbackThisArg, this.options.callbackArgs);
		} catch (err) {
			Logger.log(err);
		}
	}

	/*private _updateStatusBarItem() {
		Logger.log('_updateStatusBarItem()');
		this.statusBarItem.text 	= this.options.text;
		this.statusBarItem.tooltip 	= this.options.tooltip;
		this.statusBarItem.color 	= this.options.color;
	}

	private _createStatusBarItem() {
		Logger.log('_createStatusBarItem()');		
		if(this.statusBarItem) this.statusBarItem.dispose();

		let statusBarItem = vscode.window.createStatusBarItem(this.options.alignment || vscode.StatusBarAlignment.Left, this.options.priority);
		statusBarItem.command = this.callbackCommand;
		statusBarItem.show();
		
		this.statusBarItem = statusBarItem;

		this._updateStatusBarItem();
	}*/

	private _createStatusBarItem() {
		Logger.log('_createStatusBarItem()');		
		if(this.statusBarItem) this.statusBarItem.dispose();

		let statusBarItem = vscode.window.createStatusBarItem(this.options.alignment || vscode.StatusBarAlignment.Left, this.options.priority);
		statusBarItem.text 		= this.options.text;
		statusBarItem.tooltip 	= this.options.tooltip;
		statusBarItem.color 	= this.options.color;
		statusBarItem.command 	= this.callbackCommand;
		statusBarItem.show();
		
		this.statusBarItem = statusBarItem;
	}

}
