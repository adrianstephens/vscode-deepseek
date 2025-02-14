import * as vscode from 'vscode';
import {DeepSeekWebViewProvider} from "./DeepSeekView";

import { BlockParser, HtmlRenderer } from "shared/markdown";
import * as fs from 'fs';

function test_markdown(filename: string) {
	try {
		const md = fs.readFileSync(filename, 'utf8');

		const parser	= new BlockParser({});
		const doc		= parser.parse(md);

		const renderer	= new HtmlRenderer({});
		const html		= renderer.render(doc);

		const content	= `
	<html>
	<head>
		<style>
html {
    --markdown-font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
    --markdown-font-size: 14px;
    --markdown-line-height: 1.6;
    --vscode-editor-foreground: #3b3b3b;
    --vscode-textLink-foreground: #005fb8;
    --vscode-textLink-activeForeground: #005fb8;
    --vscode-textPreformat-foreground: #3b3b3b;
    --vscode-textPreformat-background: rgba(0, 0, 0, 0.12);
    --vscode-textBlockQuote-background: #f8f8f8;
    --vscode-textBlockQuote-border: #e5e5e5;
    --vscode-textCodeBlock-background: #f8f8f8;
	--vscode-editor-font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
    --vscode-editor-font-weight: normal;
    --vscode-editor-font-size: 12px;
    --vscode-widget-shadow: rgba(0, 0, 0, 0.16);
    --vscode-widget-border: #e5e5e5;
}

body {
    overscroll-behavior-x: none;
    background-color: transparent;
    color: var(--vscode-editor-foreground);
    font-family: var(--markdown-font-family);
    font-size: var(--markdown-font-size);
    margin: 0;
    padding: 0 20px;
}

p {
	margin-bottom: 16px;
}

img, video {
    max-width: 100%;
    max-height: 100%;
}

a, a code {
    color: var(--vscode-textLink-foreground);
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}

p > a {
    text-decoration: var(--text-link-decoration);
}

a:hover {
    color: var(--vscode-textLink-activeForeground);
}

a:focus,
input:focus,
select:focus,
textarea:focus {
    outline: 1px solid -webkit-focus-ring-color;
    outline-offset: -1px;
}

pre {
	background-color: var(--vscode-textCodeBlock-background);
	border: 1px solid var(--vscode-widget-border);
}

code {
	font-family: var(--vscode-editor-font-family, "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace);
    color: var(--vscode-textPreformat-foreground);
    background-color: var(--vscode-textPreformat-background);
    padding: 1px 3px;
    border-radius: 4px;
	font-size: 1em;
	line-height: 1.357em;
}

pre code {
	display: inline-block;
	color: var(--vscode-editor-foreground);
	tab-size: 4;
	background: none;
    padding: 0;
}

blockquote {
    background: var(--vscode-textBlockQuote-background);
    border-color: var(--vscode-textBlockQuote-border);
}

sub,
sup {
	line-height: 0;
}

ul ul:first-child,
ul ol:first-child,
ol ul:first-child,
ol ol:first-child {
	margin-bottom: 0;
}

li p {
	margin-bottom: 0.7em;
}

ul,
ol {
	margin-bottom: 0.7em;
}

hr {
	border: 0;
	height: 1px;
	border-bottom: 1px solid;
}

h1 {
	font-size: 2em;
	margin-top: 0;
	padding-bottom: 0.3em;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h2 {
	font-size: 1.5em;
	padding-bottom: 0.3em;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h3 {
	font-size: 1.25em;
}

h4 {
	font-size: 1em;
}

h5 {
	font-size: 0.875em;
}

h6 {
	font-size: 0.85em;
}

table {
	border-collapse: collapse;
	margin-bottom: 0.7em;
}

th {
	text-align: left;
	border-bottom: 1px solid;
}

th,
td {
	padding: 5px 10px;
}

table > tbody > tr + tr > td {
	border-top: 1px solid;
}

blockquote {
	margin: 0;
	padding: 0px 16px 0 10px;
	border-left-width: 5px;
	border-left-style: solid;
	border-radius: 2px;
}

body.wordWrap pre {
	white-space: pre-wrap;
}

pre:not(.hljs),
pre.hljs code > div {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

</style>
	</head>
	${html}
	</html>`;
		vscode.workspace.openTextDocument({language:'html', content}).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	} catch (e) {
		console.error(e);
	}
}

//-----------------------------------------------------------------------------
// entry
//-----------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
	test_markdown('/Volumes/DevSSD/dev/github/commonmark.js/README.md');

	new DeepSeekWebViewProvider(context);

//	context.subscriptions.push(
//	);

}

//export function deactivate(): void {}
