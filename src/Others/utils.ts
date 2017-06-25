import { commands, Disposable } from 'vscode';


type Callback = (...args: any[]) => void;

interface RegisterCommandResonse {
	disposable: Disposable;
	setCallback: Callback;
}

export function registerCommand(command: string): Promise<RegisterCommandResonse> {
	return new Promise((resolve, reject) => {
		var callbackObj = {
			callback: () => {}
		}
		function setCallback(callback: Callback) {
			callbackObj.callback = callback;
		}
		try {
			let disposable = commands.registerCommand(command, (...args) => {
				callbackObj.callback.apply(null, args);
			});
			resolve({
				disposable: disposable, 
				setCallback: setCallback
			});
		} catch(err) {
			//if(err.message === "command with id already exists")
			reject(err);
		}	
	});
}	

export function delay(ms: number): Promise<void> {
	return new Promise<void>(resolve => setTimeout(resolve, ms));
}


/*
export function simpleClone(dist: any, soc: any, condition?: (prop: string, val: any) => boolean) {
	var props = Object.getOwnPropertyNames(soc);
	if(condition) {
		props.forEach(prop => {
			if(condition(prop, soc[prop])) dist[prop] = soc[prop];
        });
    } else {
		props.forEach(prop => {
			dist[prop] = soc[prop];
        });
    }
}*/

interface SimpleCloneParams {
	from: any;
	to: any;
	if?: (prop: string, val: any) => boolean
}
export function simpleClone(params: SimpleCloneParams) {
	var props = Object.getOwnPropertyNames(params.from);
	if(params.if) {
		props.forEach(prop => {
			if(params.if(prop, params.from[prop])) params.to[prop] = params.from[prop];
        });
    } else {
		props.forEach(prop => {
			params.to[prop] = params.from[prop];
        });
    }
}
