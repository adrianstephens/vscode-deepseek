import * as vscode from 'vscode';
import OpenAI from "openai";

//API key: sk-3eddc1d999174b66a56647cdd16eb354


//-----------------------------------------------------------------------------
// entry
//-----------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
	const openai = new OpenAI({
		//baseURL:	'https://api.deepseek.com',
		baseURL:	'http://localhost:11434/v1',
		apiKey:		'sk-3eddc1d999174b66a56647cdd16eb354'
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('deepseek.chat', async () => {
			const completion = await openai.chat.completions.create({
				messages: [
					{ role: "system", content: "You are a helpful assistant." },
					{"role": "user", "content": "Who won the World Series in 2020?"}
				],
				model: "deepseek-r1:32b",//"deepseek-chat",
			});
			
			console.log(completion.choices[0].message.content);
		}),
	);

}

//export function deactivate(): void {}
