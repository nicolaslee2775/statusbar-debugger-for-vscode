import { window, OutputChannel } from 'vscode';
import { Logger } from './logger'


export class Output {
	static outputChannel: OutputChannel = window.createOutputChannel("Statusbar Debugger");
	static append(value: string) {
		Output.outputChannel.append(value);
	}
	static appendLine(value: string) {
		Output.outputChannel.appendLine(value);
	}
	static log(...args) {
		var str = args.map(arg => 
				typeof arg === "object" ? JSON.stringify(arg, null, 4) : arg
			)
			.join(" ");
		Output.outputChannel.appendLine(str);
	}
}

export class OutputLog {
	static outputChannel: OutputChannel = window.createOutputChannel("Statusbar Debugger");
	static log(...args) {
		Output.log(...args);
		Logger.log(...args);
	}
}