import * as vscode from 'vscode';
import OpenAI from "openai";
import {DeepSeekWebViewProvider} from "./DeepSeekView";

//API key: sk-3eddc1d999174b66a56647cdd16eb354
/*[
	{
	  host: "https://api.deepseek.com",
	  userUrl: "https://api.deepseek.com/v1/user/balance",
	  apikey: "sk-c50d5356a45c4c7988b3df82fb1295e3",
	  currentModel: "deepseek-chat",
	  modelsConfig: {
		"deepseek-chat": true,
		"deepseek-reasoner": true,
	  },
	  temperature: 1,
	  max_tokens: 4096,
	},
	{
	  host: "https://api.siliconflow.cn",
	  userUrl: "https://api.siliconflow.cn/v1/user/info",
	  apikey: "sk-kgahvlalrbfjyftxrciniliopeblhxsgrxebrwgiqwwxwxth",
	  currentModel: "deepseek-ai/DeepSeek-V3",
	  modelsConfig: {
		"deepseek-ai/DeepSeek-V3": true,
		"deepseek-ai/DeepSeek-R1": true,
	  },
	  temperature: 1,
	  max_tokens: 4096,
	},
	{
	  host: "https://api.moonshot.cn",
	  userUrl: "https://api.moonshot.cn/v1/user/info",
	  apikey: "sk-MYe6K3IjdKYkDyO0ghBKXqJW4whlgBAzDZWQXLUMI1Icrn38",
	  currentModel: "moonshot-v1-8k",
	  modelsConfig: {
		"moonshot-v1-8k": true,
	  },
	  temperature: 1,
	  max_tokens: 4096,
	},
  ]
	https://api.siliconflow.cn/v1/chat/completions
	'sk-kgahvlalrbfjyftxrciniliopeblhxsgrxebrwgiqwwxwxth'
		model: "deepseek-ai/DeepSeek-V3",
		temperature: 1,
		max_tokens: 4096,
		messages: [
			{role: 'system', content: 'You are a programming AI expert, specialized in coding and programming. You will help answer questions and solve programming problems, providing clear, professional and practical advice'}
			{role: 'user', content: 'hello'}
		]
		stream: true
  */


//-----------------------------------------------------------------------------
// entry
//-----------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
	new DeepSeekWebViewProvider(context);

//	context.subscriptions.push(
//	);

}

//export function deactivate(): void {}
