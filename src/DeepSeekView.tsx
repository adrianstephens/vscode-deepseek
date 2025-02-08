import * as vscode from "vscode";
import OpenAI from "openai";
import * as utils from "shared/utils";
import {CSP, Nonce, id_selector} from "../shared/src/jsx-runtime";

//-----------------------------------------------------------------------------
//	ModuleViewProvider
//-----------------------------------------------------------------------------

export class DeepSeekWebViewProvider implements vscode.WebviewViewProvider {
	openai: OpenAI;
	view?: vscode.WebviewView;
	//model = 'deepseek-ai/DeepSeek-V3';								//	'deepseek-r1:32b'
	model = 'deepseek-r1:32b'


	constructor(private context: vscode.ExtensionContext) {
		this.openai = new OpenAI({
			baseURL:'http://localhost:11434/v1',
			//baseURL:'https://api.siliconflow.cn',
			apiKey:	'sk-kgahvlalrbfjyftxrciniliopeblhxsgrxebrwgiqwwxwxth',	//	'sk-3eddc1d999174b66a56647cdd16eb354',
		});
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider('deepseek2-view', this),
			vscode.commands.registerCommand('deepseek2.clear', () => this.view?.webview.postMessage({command:'clear'})),
		);
	}

	private webviewUri(webview: vscode.Webview, name: string) {
		return webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, name));
	}
	async resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Promise<void> {
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
		};

		webviewView.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'message':
					const stream = await this.openai.chat.completions.create({
						model: 		this.model,
						messages:	[{ role: "user", content: message.message}],
						store:		true,
						stream:		true,
					});
					this.view?.webview.postMessage({command: 'message', message:''});

					let text = '';

					//const fs = require('fs');
					//const marked = require('marked');
					//const markdown = fs.readFileSync('input.md', 'utf8');
					//const html = marked(markdown);
					//fs.writeFileSync('output.html', html);

					for await (const chunk of stream) {
						const message = chunk.choices[0]?.delta?.content || "";
						text += message;
						text = text.replace(/think>\n(?!\n)/g, 'think>\n\n');
						

						const html = await vscode.commands.executeCommand<string>('markdown.api.render', text);
						this.view?.webview.postMessage({command: 'set', html});
						//this.view?.webview.postMessage({command: 'stream', message});
					}
		
					break;
			}
		});

		webviewView.webview.html = this.updateView();

	}

	getUri(name: string) {
		return this.webviewUri(this.view!.webview, name);
	}

	updateView() : string {
		//return '<!DOCTYPE html>'+ JSX.render(<html lang="en">
		//	<body>
		//		No Modules
		//	</body>
		//</html>);

		const nonce		= Nonce();

		return '<!DOCTYPE html>' + JSX.render(<html lang="en">
			<head>
				<meta charset="UTF-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
				<CSP csp={this.view!.webview.cspSource} nonce={nonce}/>
				<link rel="stylesheet" type="text/css" href={this.getUri('shared/assets/shared.css')}/>
				<link rel="stylesheet" type="text/css" href={this.getUri('assets/deepseek.css')}/>
				<title>Modules</title>
			</head>
			<body>
			<div class="chat-container" id="chat-container">
				{// Chat messages will be appended here
				}
			</div>
			<div class="input-container">
		        <textarea id="chat-input" placeholder="Type your question here..."/>
				<button id="send-button">Send</button>
			</div>

			<script>

			</script>
				<script nonce={nonce} src={this.getUri("shared/assets/shared.js")}></script>
				<script nonce={nonce} src={this.getUri("assets/deepseek.js")}></script>
			</body>
		</html>);

	}
}
