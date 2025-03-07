import * as net from 'net';
import { workspace, languages, window, commands, ExtensionContext, Disposable, WorkspaceConfiguration } from 'vscode';
import {
	ExecuteCommandRequest,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	StreamInfo
} from 'vscode-languageclient/node';
  
let client : LanguageClient;

export function activate(context: ExtensionContext) {
	var props : WorkspaceConfiguration = workspace.getConfiguration('Deployer');

	// Consider (mainly for debugging) that the user may have LSP running on a socket
	var connectToServer : number = 0;
	if (props) {
		var prop : string | undefined = props.get("connectToServer");
		if (prop)
			connectToServer = parseInt(prop);
	}

	// launch FLAS in server mode
	let serverOptions: ServerOptions;
	
	var connMsg;
	if (connectToServer && connectToServer > 0) { // defined and not null
		connMsg = "connecting to existing server on " + connectToServer;
		serverOptions = connectToSocket(connectToServer);
	} else {
		var command = "deployer-lsp";
	
		connMsg = "attempting to start server " + command;
		serverOptions = { command }; // an Executable
	};
	
	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
    	// Register for our languages
		documentSelector: [
			{ scheme: 'file', language: 'deployer-dply' }
		],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'Deployer',
		},
		outputChannelName: "Deployer Language Server"
	};
	// Create the language client and start the client.
	client = new LanguageClient(
		'Deployer',
		'Deployer',
		serverOptions,
		clientOptions
	);
	
	client.outputChannel.appendLine(connMsg);

	// Start the client. This will also launch the server
	client.start().then(() => {
		client.sendRequest(ExecuteCommandRequest.type, {
			command: 'deploy/readyForNotifications',
			arguments: [ ]
		});	
	});
}

function connectToSocket(port: number) {
	return function() : Promise<StreamInfo> {
		return new Promise((resolve, reject) => {
			var sock : net.Socket = net.connect(port);
			var si : StreamInfo = { reader: sock, writer: sock };
			resolve(si);
		});
	};
}