import * as vscode from 'vscode';
import {DeepSeekWebViewProvider} from "./DeepSeekView";

import * as MD from "shared/markdown";
import * as LaTeX from "shared/LaTeX";
import * as xml from "shared/xml";
import * as utils from "shared/utils"
import * as binary from "shared/binary";
import {TTFFile, ParseCurve, MakeSVGPath, Glyph} from "shared/font";

function test_markdown(md: string) : string {
	const parser	= new MD.BlockParser({softbreak: ' '});
	const doc		= parser.parse(md);

	for (const i of MD.walk(doc)) {
		if (i instanceof xml.Element) {
			delete i.attributes['data-sourcepos'];
			if (i.name === 'a' && MD.potentiallyUnsafe(i.attributes.href))
				delete i.attributes.href;
			else if (i.name === 'img' && MD.potentiallyUnsafe(i.attributes.src))
				i.attributes.src = '';

		} else if (i instanceof MD.Text) {
			const p		= new utils.StringParser(i.literal);
			const re	= /\$(.*?)\$|\\\[\s+(.*?)\s+\\]|\\\((.*?)\\\)|(?=\\boxed\{)/;
			const nodes: xml.Node[] = [];
			let prevpos	= 0;
			let m;
			while (m = p.exec(re)) {
				try {
					const text = m[1] || m[2] || m[3];
					const exp = LaTeX.expression(text ? new utils.StringParser(text) : p);
					if (exp) {
						nodes.push(i.literal.slice(prevpos, prevpos + m.index));
						nodes.push(exp);
						console.log(exp.toString());
					}
					prevpos = p.pos;
				} catch (e) {
					console.log(e);
				}
			}
			nodes.push(i.literal.slice(prevpos));
			i.parent?.children.splice(i.parent.children.indexOf(i), 1, ...nodes);
			console.log(i.parent?.toString());
		}
	}
	const html		= doc.toString();//, {indent: '', newline: ''});

	return `
<html>
<head>
	<link rel="stylesheet" type="text/css" href="assets/markdown.css"/>
	<link rel="stylesheet" type="text/css" href="assets/maths.css"/>
</head>
${html}
</html>`;

		//vscode.workspace.openTextDocument({language:'html', content}).then(doc => {
		//	vscode.window.showTextDocument(doc);
		//});
}


const sqrtMain = `
M95,622
c-2.7,0,-7.17,-2.7,-13.5,-8
c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4
c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51
c1.3,-1.3,3,-2,5,-2
c4.7,0,8.7,3.3,12,10
s173,378,173,378
c0.7,0,35.3,-71,104,-213
c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
c5.3,-9.3,12,-14,20,-14
H400000
v40
H845.2724
s-225.272,467,-225.272,467
s-235,486,-235,486
c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3
s-194,-422,-194,-422
s-65,47,-65,47
z
M834 0
h400000
v40
h-400000
z`;

function scaleSVG(path: string, minx: number, maxx: number, width: number, miny: number, maxy: number, height: number) {
	let prevx = 0, prevy = 0;
	let prevx2 = 0, prevy2 = 0;

	 const scalex = width / (maxx - minx);
	 const scaley = height / (maxy - miny);

	 const shiftx = width - (maxx - minx);
	 const shifty = height - (maxy - miny);

	function modX(x: number) 		{ prevx = x; return (prevx2 = x < minx ? x : x < maxx ? (x - minx) * scalex + minx : x + shiftx); }
	function modY(y: number) 		{ prevy = y; return (prevy2 = y < miny ? y : y < maxy ? (y - miny) * scaley + miny : y + shifty); }

	function modCommand0(command: string, params: number[]) {
		const rel = {prevx, prevy, prevx2, prevy2};

		function modXp(i: number) 		{ params[i] = modX(params[i]); }
		function modYp(i: number) 		{ params[i] = modY(params[i]); }
		function modXYp(i: number) 		{ modXp(i); modYp(i + 1); }
		function modXrelp(i: number) 	{ params[i] = modX(rel.prevx + params[i]) - rel.prevx2; }
		function modYrelp(i: number) 	{ params[i] = modY(rel.prevy + params[i]) - rel.prevy2; }
		function modXYrelp(i: number)	{ modXrelp(i); modYrelp(i + 1); }
	
		switch (command) {
			case 'M':
			case 'L':
			case 'T': modXYp(0); break;				//x y
			case 'H': modXp(0); break;				//x
			case 'V': modYp(0); break;				//y
			case 'C': modXYp(0); modXYp(2); modXYp(4); break;//x1 y1, x2 y2, x y
			case 'S':
			case 'Q': modXYp(0), modXYp(2); break;	//x1 y1, x y
			case 'A': modXYp(5); break;				//rx ry x-axis-rotation large-arc-flag sweep-flag x y

			case 'm':
			case 'l':
			case 't': modXYrelp(0); break;			//dx dy
			case 'h': modXrelp(0); break;			//dx
			case 'v': modYrelp(0); break;			//dy
			case 'c': modXYrelp(0); modXYrelp(2); modXYrelp(4); break;//dx1 dy1, dx2 dy2, dx dy
			case 's':
			case 'q': modXYrelp(0); modXYrelp(2); break;	//dx2 dy2, dx dy
			case 'a': modXYrelp(5); break;			//rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
		}
	}
	function modCommand(command: string) {
		const params0 = command.slice(1).trim();
		if (params0) {
			const params = params0.split(/[ ,]/).map(j => parseFloat(j));
			modCommand0(command[0], params);
			return command[0] + params.map(i => i.toFixed(2)).join(',');
		}
		return command;
	}
	return path.split(/(?=[a-zA-Z])/).slice(1).map(i => modCommand(i)).join('');
}

//-----------------------------------------------------------------------------
// entry
//-----------------------------------------------------------------------------
export function activate(context: vscode.ExtensionContext): void {
	vscode.workspace.fs.readFile(vscode.Uri.file("/Users/adrianstephens/Library/Fonts/Nabla-Regular.ttf")).then(buffer => {
		const ttf = new TTFFile(new binary.stream(buffer));
		if (ttf) {
			const map	= ttf.getGlyphMapping();
			const id	= map[65];
			let 	svg	= ttf.getGlyphSVG(id, false);
			if (svg)
				vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, `hidden/font.svg`), Buffer.from(svg.toString()));
			svg	= ttf.getGlyphSVG(id, true);
			if (svg)
				vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, `hidden/colr.svg`), Buffer.from(svg.toString()));
		}
	});
/*
	vscode.workspace.fs.readFile(vscode.Uri.file("/Users/adrianstephens/Library/Fonts/HouseOfTheDragonColor-rge8L.otf")).then(buffer => {
		const ttf = new TTFFile(new binary.stream(buffer));
		if (ttf) {
			const map		= ttf.getGlyphMapping();
			const id		= map[97];
			const test		= ttf.getGlyphSVG(id);
			if (test)
				vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, `hidden/font.svg`), Buffer.from(test));
		}
	});

	vscode.workspace.fs.readFile(vscode.Uri.file("/System/Library/Fonts/Apple Color Emoji.ttc")).then(buffer => {
		const ttc = new TTCFile(buffer);
		const ttf = ttc.getSub('Regular');
		if (ttf) {
			const images	= ttf.getGlyphImages(200);
			const map		= ttf.getGlyphMapping();
			const id		= map[8252];
			const test		= images[id];
			if (test)
				vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, `hidden/font.png`), Buffer.from(test.data));
		}
	});

	vscode.workspace.fs.readFile(vscode.Uri.file("/System/Library/Fonts/Menlo.ttc")).then(buffer => {
		const ttc = new TTCFile(buffer);
		const ttf = ttc.getSub('Regular');
		if (ttf) {
			const map = ttf.getGlyphMapping();
			const test = ttf.glyphs[map[0x221a]];
			if (test)
				SaveGlyphSVG(test, vscode.Uri.joinPath(context.extensionUri, `hidden/font221a.svg`));
		}
	});

	vscode.workspace.fs.readFile(vscode.Uri.file("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")).then(buffer => {
		const ttf = new TTFFile(new binary.stream(data));
		const map = ttf.getGlyphMapping();

		const test = ttf.glyphs[map[0x221a]];
		if (test)
			SaveGlyphSVG(test, vscode.Uri.joinPath(context.extensionUri, `hidden/font221a.svg`));


		for (let i = 33; i < 58; i++) {
			const glyphid	= map[i];
			const glyph		= ttf.glyphs[glyphid];

			if (glyph)
				SaveGlyphSVG(glyph, vscode.Uri.joinPath(context.extensionUri, `hidden/font${i}.svg`));
		}

	});
*/
	const svg2 = scaleSVG(sqrtMain, 500, 500, 0, 45, 45, 500);

	const svg = new xml.Element('svg', {xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 2000 2000", width: 2000, height: 2000}, [
		new xml.Element('path', {d: sqrtMain, fill: 'black'}),
		new xml.Element('path', {d: svg2, fill: 'blue'}),
	]);
	vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, "hidden/sqrt.svg"), Buffer.from(svg.toString()));

	vscode.workspace.fs.readFile(vscode.Uri.joinPath(context.extensionUri, "hidden/sample.md"))
	.then(buffer => {
		const content = test_markdown(buffer.toString());
		vscode.workspace.fs.writeFile(vscode.Uri.joinPath(context.extensionUri, "math.html"), Buffer.from(content));
	});

	new DeepSeekWebViewProvider(context);

//	context.subscriptions.push(
//	);

}
//export function deactivate(): void {}
