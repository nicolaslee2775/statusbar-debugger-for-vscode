
import * as vscode from 'vscode';

import { Button } from './Others/button';

import { StartButtonController } from './startButton.controller';
import { StopButtonController } from './stopButton.controller';
import { ConfigButtonController } from './configButton.controller';
import { PanelButtonController } from './panelButton.controller';

import { Output, OutputLog } from './Others/output';
import { Logger } from './Others/logger';
import * as Utils from './Others/utils' 


enum DebugState { Idle, Starting, Stopping }
enum DebugAction { None, Start, Stop }

export class MainController {
	// State
	private debugState: DebugState = DebugState.Idle;
	private nextDebugaction: DebugAction = DebugAction.None; // Used for queueing

	// From setting
	private priority: number;
	private clearConsoleBeforeDebug: boolean;
	private optionList: any[];
	private defaultLaunchConfig: any;

	// UI selected
	private isTogglePanel: boolean = true;
	private selectedOption: any;
	private selectedOptionIndex: number;

	// Button Controllers
	private startBtnCtrls: StartButtonController;
	private stopBtnCtrls: StopButtonController;
	private configBtnCtrl: ConfigButtonController;
	private panelButtonCtrl: PanelButtonController;

	// Command Disposable List
	private commandDisposableList: vscode.Disposable[] = [];

	//private finishExecutionEvent: vscode.EventEmitter<any>;


    constructor(private context: vscode.ExtensionContext) {

		// Create buttons
		this.startBtnCtrls = new StartButtonController(this.context);
		this.startBtnCtrls.onDidTrigger(this.onStartDebug, this);

		this.stopBtnCtrls = new StopButtonController(this.context);
		this.stopBtnCtrls.onDidTrigger(this.onStopDebug, this);

		this.configBtnCtrl = new ConfigButtonController(this.context);
		this.configBtnCtrl.onDidChangeLaunchConfig(this.onChangeSelectedOption, this);

		this.panelButtonCtrl = new PanelButtonController(this.context);
		this.panelButtonCtrl.onDidChangePanelMode(this.onChangePanelMode, this);
		

		// Registor command
		let that = this;
		Utils.registerCommand("extension.statusbarDebugger.startDebug")
			.then(response => {
				Logger.log("Registor `extension.statusbarDebugger.startDebug` command!");
				that.commandDisposableList.push(response.disposable);
				response.setCallback(that.onStartDebug.bind(that));
			});
		
		Utils.registerCommand("extension.statusbarDebugger.stopDebug")
			.then(response => {
				Logger.log("Registor `extension.statusbarDebugger.stopDebug` command!");
				that.commandDisposableList.push(response.disposable);
				response.setCallback(that.onStopDebug.bind(that));
			});

		
		// Event
		//this.finishExecutionEvent = new vscode.EventEmitter();


		// Init config and selected debug option
		this._updateConfig();
		this._updateSelectedOption();
    }

    
    onChangeConfiguration() {
		this._updateConfig();
		this._updateSelectedOption();
    }

	dispose() {
		this.selectedOption = null;
		
		if(this.startBtnCtrls) {
			this.startBtnCtrls.dispose();
			this.startBtnCtrls = null;
		}
		if(this.stopBtnCtrls) {
			this.stopBtnCtrls.dispose();
			this.stopBtnCtrls = null;
		}
		if(this.configBtnCtrl) {
			this.configBtnCtrl.dispose();
			this.configBtnCtrl = null;
		}

		if(this.commandDisposableList) {
			this.commandDisposableList.forEach(item => item.dispose());
			this.commandDisposableList = null;
		}
    }

	//onChangeReplMode(isToggleRepl: boolean) {
	onChangePanelMode() {
		this.isTogglePanel = !this.isTogglePanel;
		Logger.log(`onChangePanelMode! this.isTogglePanel:`, this.isTogglePanel);
		this._updateButtons();
	}

	onChangeSelectedOption(selectedIndex: number) {
		this.selectedOptionIndex = selectedIndex;
		this._updateSelectedOption(); // only update the selectedOption
	}

	
	onStartDebug() {
		let defaultLaunchConfig = this.defaultLaunchConfig,
			selectedLaunchConfig = this.selectedOption.config;
		
		let launchConfig = Object.assign({}, defaultLaunchConfig, selectedLaunchConfig);

		if(this.debugState !== DebugState.Idle) {
			// Override the 'nextDebugaction' and perform the action when this action finished
			this.nextDebugaction = DebugAction.Start;
		
		} else if(!selectedLaunchConfig.name){
			OutputLog.log(`======================== Error ============================`);
			OutputLog.log(`=== The selected launch config has no "name" attribute! ===`);
			OutputLog.log(`config : ${JSON.stringify(selectedLaunchConfig, null, 4)}`);
			OutputLog.log(`===========================================================`);

		} else {
			this.debugState = DebugState.Starting;
			
			OutputLog.log("Start Debug...");
			Logger.indent();
			OutputLog.log("launchConfig:", launchConfig);
			OutputLog.log("selectedLaunchConfig:", selectedLaunchConfig);

			let useRepl = launchConfig.console === "none" || launchConfig.console === undefined,
				useIntegratedTerminal = launchConfig.console === "integratedTerminal",
				useExternalTerminal = launchConfig.console === "externalTerminal";

			let	shouldTogglePanle = this.isTogglePanel && (useRepl || useIntegratedTerminal),
				shouldClearPanel = this.clearConsoleBeforeDebug && (useRepl || useIntegratedTerminal);
			
			let executeCommand = vscode.commands.executeCommand;
			executeCommand("workbench.action.focusActiveEditorGroup")
				.then(() => executeCommand("workbench.action.debug.stop"))
				.then(() => Utils.delay(200))	
				.then(() => executeCommand("vscode.startDebug", launchConfig))
				
				.then(() => executeCommand("workbench.action.closePanel"))
				.then(() => 
					useRepl ? 
						Promise.resolve()
							.then(() => shouldTogglePanle ? executeCommand("workbench.debug.action.toggleRepl") : null)
							.then(() => shouldClearPanel ? executeCommand("workbench.debug.panel.action.clearReplAction") : null)
					: (useIntegratedTerminal ? 
						Promise.resolve()
							.then(() => shouldTogglePanle ? executeCommand("workbench.action.terminal.toggleTerminal") : null)
							.then(() => shouldClearPanel ? executeCommand("workbench.action.terminal.clear") : null)
					: 
						null
					)
				)
				//.then(() => executeCommand("workbench.action.closePanel"))
				//.then(() => shouldTogglePanle ? executeCommand("workbench.debug.action.toggleRepl") : null)
				//.then(() => shouldClearPanel ? executeCommand("workbench.debug.panel.action.clearReplAction") : null)
				.then(() => {
					OutputLog.log("Start Debug is done!");
					Logger.indentLeft();
					this.debugState = DebugState.Idle;

					//this.finishExecutionEvent.fire({ source: "onStartDebug" });
					if(this.nextDebugaction === DebugAction.Stop) {
						this.nextDebugaction = DebugAction.None;
						this.onStopDebug();					
					}
				});
		}
		
	}

	
	onStopDebug() {
		if(this.debugState !== DebugState.Idle)  {
			// Override the 'nextDebugaction' and perform the action when this action finished
			this.nextDebugaction = DebugAction.Stop;

		} else {
			this.debugState = DebugState.Stopping;

			OutputLog.log("Stop Debug...");
			
			let executeCommand = vscode.commands.executeCommand;
			executeCommand("workbench.action.focusActiveEditorGroup")
				.then(() => executeCommand("workbench.action.debug.stop"))
				.then(() => this.isTogglePanel ? executeCommand("workbench.action.closePanel") : null)
				.then(() => {
					OutputLog.log("Stop Debug is done!");
					this.debugState = DebugState.Idle;

					//this.finishExecutionEvent.fire({ source: "onStopDebug" });
					if(this.nextDebugaction === DebugAction.Start) {
						this.nextDebugaction = DebugAction.None;
						this.onStartDebug();
					}
				});
		}
		
	}

	private _updateConfig() {
		Logger.log("updateConfig...");

		const config = vscode.workspace.getConfiguration('statusbar_debugger');

		this.priority 				= config.get<number>('positionPriority');
		this.clearConsoleBeforeDebug = config.get<boolean>('clearConsoleBeforeDebug');
		this.optionList 			= config.get<any[]>('optionList');
		this.defaultLaunchConfig 	= config.get<any[]>('defaultConfig');

		Logger.log("this.priority:", this.priority);
		Logger.log("this.clearReplBeforeDebug:", this.clearConsoleBeforeDebug);
		Logger.log("this.optionList:", this.optionList);
		Logger.log("this.defaultLaunchConfig:", this.defaultLaunchConfig);

		//this.updateSelectedOption();
	}

	
	private _updateSelectedOption() {
		Logger.log("updateSelectedOption...");
		Logger.indent();

		// if not selected / the selected index is out of the range, find the option with 'selected' prop
		if(this.selectedOptionIndex === null || this.selectedOptionIndex >= this.optionList.length) {
			this.selectedOptionIndex = this.optionList.findIndex(item => item.selected);
		}

		// Set selectedOption
		this.selectedOption = this.optionList[this.selectedOptionIndex]  				// get the selected config
							|| this.optionList[0] 										// if not found, use the first elemt
							|| { displayName: 'none', color: '#ffa0a0', config: {} };	// if the list is empty, use a 'none' config
	
		Logger.log('mainController.selectedOption:', this.selectedOption);
		Logger.indentLeft();
		
		// Update buttons
		this._updateButtons();

		// Hide the button if optionList is not set
		if(this.optionList.length === undefined || this.optionList.length === 0) {
			Logger.log('no option list!');
			Output.appendLine('no option list!')
			this.startBtnCtrls.hide();
			this.stopBtnCtrls.hide();
			this.configBtnCtrl.hide();
			this.panelButtonCtrl.hide();		
		} else {
			Logger.log('has option list!');
			Output.appendLine('has option list!')
			this.startBtnCtrls.show();
			this.stopBtnCtrls.show();
			this.configBtnCtrl.show();
			this.panelButtonCtrl.show();	
		}
	}

	private _updateButtons() {
		/*new Button(this.context, {
			text: '[',
			priority: this.priority + 3
		});*/
		this.startBtnCtrls.update(this.priority+2);
		this.stopBtnCtrls.update(this.priority+1);
		this.configBtnCtrl.update(this.priority, this.optionList, this.selectedOption);
		this.panelButtonCtrl.update(this.priority-1, this.isTogglePanel);
		/*new Button(this.context, {
			text: ']',
			priority: this.priority - 1
		});*/
	}

}

