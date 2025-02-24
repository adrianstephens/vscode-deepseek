
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

function scaleSVG(path, minx, maxx, scalex, miny, maxy, scaley) {
	let prevx = 0, prevy = 0;
	let prevx2 = 0, prevy2 = 0;

	const shiftx = (maxx - minx) * scalex;
	const shifty = (maxy - miny) * scaley;

	function modX(x) 		{ prevx = x; return (prevx2 = x < minx ? x : x < maxx ? (x - minx) * scalex + minx : x + shiftx); }
	function modY(y) 		{ prevy = y; return (prevy2 = y < miny ? y : y < maxy ? (y - miny) * scaley + miny : y + shifty); }

	function modCommand0(command, params) {
		const rel = {prevx, prevy, prevx2, prevy2};

		function modXp(i) 		{ params[i] = modX(params[i]); }
		function modYp(i) 		{ params[i] = modY(params[i]); }
		function modXYp(i) 		{ modXp[i]; modYp[i + 1]; }
		function modXrelp(x) 	{ params[i] = modX(rel.prevx + params[i]) - rel.prevx2; }
		function modYrelp(y) 	{ params[i] = modX(rel.prevy + params[i]) - rel.prevy2; }
		function modXYrelp(x, y) { modXrelp[i]; modYrelp[i + 1]; }
	
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
	function modCommand(command) {
		const params = command.slice(1).split(/[ ,]/).map(j => parseFloat(j));
		modCommand0(command[0], params);
		return command[0] + params.map(i => i.toString()).join(',');
	}
	return path.split(/(?=[a-zA-Z])/).map(i => modCommand(i)).join('');
}