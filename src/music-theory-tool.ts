#!/usr/bin/env node

import argparse, { ArgumentParser } from 'argparse';
export * from './scales-gen.js';
import { getRelativeScales, getScaleFromKey, mapPrintGuitarChord, mapPrintGuitarScale, transposeChordProgression } from './scales-gen.js';

//npx ts-node --esm src/music-theory-tool.ts scale A minor
function scaleGen(args: Record<string, any>): void {
	console.log('scaleGen');
	console.log(`Scale: ${args.root_key} -- Type: ${args.scale_type}`);
	console.log(getScaleFromKey(args.root_key, args.scale_type).join(' - '));
}

//npx ts-node --esm src/music-theory-tool.ts transpose A E A "G" D C
function transposeProgression(args: Record<string, any>): void {
	console.log('transposeProgression');
	//console.log(transPoseKeyProgression(['A', 'G', 'D', 'C'], 'A', 'E'));
	//'Em|^C', 'D', 'Em', 'G'
	//console.log(transposeChordProgression(['Am|^F', 'G', 'Am', 'C'], 'A', 'E'));

	console.log(transposeChordProgression(args.progression, args.src_key, args.target_key));
}

//npx ts-node --esm src/music-theory-tool.ts map_guitar Am
//npx ts-node --esm src/music-theory-tool.ts map_guitar A major
function mapPrintGuitar(args: Record<string, any>): void {
	console.log('mapPrintGuitar');
	//mapPrintGuitarChord('Bdim');
	//mapPrintGuitarScale('E', 'dorian');
	if (args.scale_type) {
		mapPrintGuitarScale(args.key_signature, args.scale_type);
	} else {
		mapPrintGuitarChord(args.key_signature);
	}
}

//npx ts-node --esm src/music-theory-tool.ts relative_scales B minor
function getPrintRelativeScales(args: Record<string, any>): void {
	console.log('getRelativeScales');
	console.log(`Scale: ${args.root_key} -- Type: ${args.scale_type}`);
	console.log(getRelativeScales(args.root_key, args.scale_type).join(' - '));
}

export function parsePassedArgs(): Record<string, any> {
	const parser = new ArgumentParser({
		description: 'A builder for overlayable application meta packages/modules that can be mounted to a system'
	});

	parser.add_argument('-v', '--version', { action: 'version', version: '0.1.0' });

	const subParsers: argparse.SubParser = parser.add_subparsers();

	const scaleGenParser: ArgumentParser = subParsers.add_parser('scale', { help: 'Generate scale of type' });
	const transposeParser: ArgumentParser = subParsers.add_parser('transpose', { help: 'Transpose one chord or key progression of key to another key' });
	const mapGuitarParser: ArgumentParser = subParsers.add_parser('map_guitar', { help: 'Generate notes and map them on guitar strings' });
	const getRelativeScalesParser: ArgumentParser = subParsers.add_parser('relative_scales', { help: 'Find relative equivalent scales that match the source scale' });

	scaleGenParser.add_argument('root_key', { help: 'Root key of the scale to generate' });
	scaleGenParser.add_argument('scale_type', { help: 'Type of scale to generate major, minor, dorian, etc.' });
	scaleGenParser.set_defaults({ handlerFunction: scaleGen });

	transposeParser.add_argument('src_key', { help: 'Current key of progression to transpose from' });
	transposeParser.add_argument('target_key', { help: 'Target key of progression to transpose to' });
	transposeParser.add_argument('progression', { help: 'Chord or key progression to transpose', nargs: '+' });
	transposeParser.set_defaults({ handlerFunction: transposeProgression });

	mapGuitarParser.add_argument('key_signature', { help: 'Target chord or scale key to map on guitar strings' });
	mapGuitarParser.add_argument('scale_type', { help: 'Type of the scale based on key_signature root key to map on guitar', nargs: '?' });
	mapGuitarParser.set_defaults({ handlerFunction: mapPrintGuitar });

	getRelativeScalesParser.add_argument('root_key', { help: 'Root key of the scale' });
	getRelativeScalesParser.add_argument('scale_type', { help: 'Type of scale to find equivalent scales for' });
	getRelativeScalesParser.set_defaults({ handlerFunction: getPrintRelativeScales });

	//parser.add_argument('-log', '--log_out_file', { action: 'store_true', help: 'Print the installer file' });
	const args: Record<string, any> = parser.parse_args();
	//console.log(args);
	args.handlerFunction(args);

	return args;
}

function run(): void {
	const args: Record<string, any> = parsePassedArgs();
}

function isDirectCalled(): boolean {
	//console.log(import.meta.url);
	//console.log(process.argv);
	return import.meta.url.replace('file://', '') === process.argv[1] || process.argv[1].includes('/bin/');
}
if (isDirectCalled()) {
	run();
}

export function testModule(): void {
	if (isDirectCalled()) {
		console.log('Is directCalled');
	} else {
		console.log('Was module imported');
	}
}
