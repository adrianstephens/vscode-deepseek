import * as vscode from 'vscode';
import {DeepSeekWebViewProvider} from "./DeepSeekView";
import * as font from "@isopodlabs/binary_fonts";

//-----------------------------------------------------------------------------
// entry
//-----------------------------------------------------------------------------

async function testFont(srce: vscode.Uri, dest: vscode.Uri) {
	return vscode.workspace.fs.readFile(srce).then(async buffer => {
		for (;;) {
			try {
			const f = await font.load(buffer);
			if (f && f instanceof font.Font) {
				const map	= f.getGlyphMapping();
				const id	= map![66];
				const svg	= f.getGlyphSVG(id);
				if (svg) {
					await vscode.workspace.fs.writeFile(dest, Buffer.from(svg.toString()));
					console.log(`Done ${srce.fsPath}`);
				}
			} else {
				console.log(`Not a font ${srce.fsPath}`);
			}
			return;

		} catch (e) {
			console.log("problem with ", srce)
		}
	}
	});
}

function testFonts(dir: vscode.Uri, dest: vscode.Uri) {
	vscode.workspace.fs.readDirectory(dir).then(async entries => {
		for (const [name, type] of entries) {
			await testFont(vscode.Uri.joinPath(dir, name), vscode.Uri.joinPath(dest, name + '.svg'));
		}
	});
}

export function activate(context: vscode.ExtensionContext): void {
//	testFonts(vscode.Uri.file("/Users/adrianstephens/Library/Fonts"), vscode.Uri.joinPath(context.extensionUri, 'hidden'));
	const deep = new DeepSeekWebViewProvider(context);
	vscode.workspace.fs.readFile(vscode.Uri.joinPath(context.extensionUri, "hidden/sample.md"))
		.then(buffer => deep.addMessage("why", buffer.toString()));

}
