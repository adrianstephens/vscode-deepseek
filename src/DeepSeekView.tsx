import * as vscode from "vscode";
import * as MD from "shared/markdown";
import * as xml from "shared/xml";
import OpenAI from "openai";
import * as utils from "shared/utils";
import {CSP, Nonce, id_selector} from "../shared/src/jsx-runtime";
import * as katex from "katex";
//import "katex/dist/katex.min.css";

//-----------------------------------------------------------------------------
//	ModuleViewProvider
//-----------------------------------------------------------------------------

async function toHtml(text: string) {
	const html0 = await vscode.commands.executeCommand<string>('markdown.api.render', text);

	const parser = new MD.BlockParser({});
	const doc = parser.parse(text);

	const html = doc.toString();

	const renderedHtml = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, p1) => {
		return katex.renderToString(p1, { displayMode: true });
	}).replace(/\$([\s\S]+?)\$/g, (match, p1) => {
		return katex.renderToString(p1, { displayMode: false });
	});
	return renderedHtml;
}

export class DeepSeekWebViewProvider implements vscode.WebviewViewProvider {
	openai: OpenAI;
	view?: vscode.WebviewView;
	model		= 'deepseek-r1:32b';
	temperature	= 0;
	max_tokens	= 4096;
	lang		= 'en';

	log:	{question: string, answer: string}[]	= [];

	constructor(private context: vscode.ExtensionContext) {
		const config 		= vscode.workspace.getConfiguration('deepseek2');
		this.model			= config.get<string>('model') || 'deepseek-r1:32b';
		this.temperature	= config.get<number>('temperature') ?? 0;
		this.max_tokens 	= config.get<number>('max_tokens') ?? 4096;
		this.lang 			= config.get<string>('lang') || 'en';

		this.openai = new OpenAI({
			baseURL:	config.get<string>('server') || 'https://api.siliconflow.cn',
			apiKey:		config.get<string>('apikey') || 'sk-kgahvlalrbfjyftxrciniliopeblhxsgrxebrwgiqwwxwxth',
		});

		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider('deepseek2-view', this),
			vscode.commands.registerCommand('deepseek2.clear', () => this.view?.webview.postMessage({command:'clear'})),
		);
	}
	private async redraw() {
		const webview = this.view!.webview;
		for (const i of this.log) {
			webview.postMessage({command: 'question', text:i.question});
			webview.postMessage({command: 'begin'});
			const html = await toHtml(i.answer);
			webview.postMessage({command: 'set', html});
		}
	}

	private getUri(name: string) {
		return this.view!.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, name));
	}

	async resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Promise<void> {
		this.view = webviewView;
		const webview = webviewView.webview!;

		webview.options = {
			enableScripts: true,
		};

		webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'question':
					webview.postMessage({command: 'question', text: message.text});
					webview.postMessage({command: 'begin'});
					try {
						const stream = await this.openai.chat.completions.create({
							model: 		this.model,
							messages:	[{ role: "user", content: message.text}],
							store:		true,
							stream:		true,
						});

						let text = '';

						//const fs = require('fs');
						//const marked = require('marked');
						//const markdown = fs.readFileSync('input.md', 'utf8');
						//const html = marked(markdown);
						//fs.writeFileSync('output.html', html);

						for await (const chunk of stream) {
							text += chunk.choices[0]?.delta?.content || "";
							text = text.replace(/(?<!\n)\n<\/think>/g, '\n\n</think>');

							const html = await toHtml(text);
							webview.postMessage({command: 'set', html});
						}
						this.log.push({question: message.text, answer: text});

					} catch (e) {
						console.error(e);
						webview.postMessage({command: 'set', html:'<div style="color:red">'+e+'</div>'});
					}
			
					break;
			}
		});

		const nonce		= Nonce();
		webview.html = '<!DOCTYPE html>' + JSX.render(<html lang="en">
			<head>
				<meta charset="UTF-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
   				<CSP csp={this.view!.webview.cspSource} script={nonce}/>
				<link rel="stylesheet" type="text/css" href={this.getUri('shared/assets/shared.css')}/>
				<link rel="stylesheet" type="text/css" href={this.getUri('assets/deepseek.css')}/>
				<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css" />
				{/*
				<script nonce={nonce}>{`
					window.MathJax = {
						tex: {
							inlineMath: [['$', '$'], ['\\(', '\\)'], ['\\[', '\\]'], ['\\boxed{', '}']]
						},
						svg: {
							fontCache: 'global'
						}
					};
				`}</script>
				<script nonce={nonce} src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"/>
				*/}
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
				<script nonce={nonce.value} src={this.getUri("shared/assets/shared.js")}/>
				<script nonce={nonce.value} src={this.getUri("assets/deepseek.js")}/>
			</body>
		</html>);

		this.redraw();

		this.view.onDidChangeVisibility(() => {
			if (this.view!.visible) {
				this.view?.webview.postMessage({command: 'clear'});
				this.redraw();
			}
		})

	}
}
