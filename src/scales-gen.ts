import { baseScaleFormulas, chordFormulas, generateMajorScaleDegreeFormula, scaleModeShifts } from './formulas.js';
import { circularShift, getModuloIndex, getSymbolFromIndex } from './util.js';

//Symbols
const romanNumbers: string[] = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const noteSet: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteFromIndex(index: number): string {
	return getSymbolFromIndex(index, noteSet);
}

function getScaleFormulaFromId(scaleTypeId: string): number[] {
	if (baseScaleFormulas[scaleTypeId]) {
		return baseScaleFormulas[scaleTypeId];
	}
	if (scaleModeShifts.hasOwnProperty(scaleTypeId)) {
		return generateMajorScaleDegreeFormula(scaleModeShifts[scaleTypeId]);
	}
	throw new Error('Could not find the scale ' + scaleTypeId);
}

//Based on major scale
function getAllScaleFormulas(): Record<string, number[]> {
	const allScaleFormulas: Record<string, number[]> = {};
	Object.assign(allScaleFormulas, baseScaleFormulas);
	/*for (const key in baseScaleFormulas) {
		allScaleFormulas[key]
	}*/
	for (const key in scaleModeShifts) {
		allScaleFormulas[key] = generateMajorScaleDegreeFormula(scaleModeShifts[key]);
	}
	return allScaleFormulas;
}

function getNoteIndicesFromOffset(startOffset: number, scaleFormula: number[]): number[] {
	const noteAbsoluteIndices = [startOffset];
	let lastAbsoluteIndex: number = startOffset;
	for (let i = 0; i < scaleFormula.length - 1; i++) {
		const halfStepIncrementCnt: number = scaleFormula[i];
		noteAbsoluteIndices.push(lastAbsoluteIndex + halfStepIncrementCnt);
		lastAbsoluteIndex = noteAbsoluteIndices[noteAbsoluteIndices.length - 1];
	}
	return noteAbsoluteIndices;
}

function getScaleFromSymbol<SymbolType>(rootSymbol: SymbolType, scaleTypeId: string, symbolSet: SymbolType[]): SymbolType[] {
	const scaleFormula: number[] = getScaleFormulaFromId(scaleTypeId);
	return getScaleFromFormula(rootSymbol, scaleFormula, symbolSet);
}
function getScaleFromFormula<SymbolType>(rootSymbol: SymbolType, scaleFormula: number[], symbolSet: SymbolType[]) {
	const rootIndex = symbolSet.indexOf(rootSymbol);
	//console.log('Selected formula: ' + scaleFormula);
	const scaleAbsIndices: number[] = getNoteIndicesFromOffset(rootIndex, scaleFormula);
	const scaleNotes: SymbolType[] = scaleAbsIndices.map((index: number) => getSymbolFromIndex(index, symbolSet));
	return scaleNotes;
}

export function getScaleFromKey(rootKey: string, scaleTypeId: string): string[] {
	return getScaleFromSymbol(rootKey, scaleTypeId, noteSet);
}

function indexArrayToKeys(array: number[]): string[] {
	return array.map((index: number) => getSymbolFromIndex(index, noteSet));
}

//Todo example ['dorian', 'mixoladian', 'pentatonic'] - apply a row of mutations to the base formula (by how they relate to the major scale)
//function stackMutateScale()

function transPoseKey(toTransposeKey: string, currentRootKey: string, targetRootKey: string): string {
	if (noteSet.indexOf(toTransposeKey) <= -1) {
		throw new Error('Invalid key to transpose: ' + toTransposeKey + ' is not part of: ' + JSON.stringify(noteSet));
	}
	const toTransposeIndex: number = noteSet.indexOf(toTransposeKey);
	const currentRootKeyIndex: number = noteSet.indexOf(currentRootKey);
	const targetRootKeyIndex: number = noteSet.indexOf(targetRootKey);
	const targetShift: number = targetRootKeyIndex - currentRootKeyIndex;
	const transposedIndex: number = toTransposeIndex + targetShift;
	const selectedKey: string = getSymbolFromIndex(transposedIndex, noteSet);
	return selectedKey;
}

function transPoseKeyProgression(progressionKeys: string[], currentRootKey: string, targetRootKey: string): string[] {
	if (progressionKeys.some((key: string) => noteSet.indexOf(key) === -1)) {
		throw new Error('Key progression contains keys that are not valid notes');
	}
	return progressionKeys.map((key: string) => transPoseKey(key, currentRootKey, targetRootKey));
	/*const keyIndices: number[] = progressionKeys.map((key: string) => noteSet.indexOf(key));
	const currentRootKeyIndex: number = noteSet.indexOf(currentRootKey);
	const targetRootKeyIndex: number = noteSet.indexOf(targetRootKey);
	const targetShift: number = targetRootKeyIndex - currentRootKeyIndex;
	const transposedIndices: number[] = keyIndices.map((index: number) => index + targetShift);
	const transposedKeys: string[] = transposedIndices.map((index: number) => getSymbolFromIndex(index, noteSet));
	return transposedKeys;*/
}

//Transpose any detected notes in the passed chords (example Am|^F with root Am and target Em is transposed to Em|^C) everything that is not a note is ignored during the transpose process
export function transposeChordProgression(chordProgression: string[], currentRootKey: string, targetRootKey: string): string[] {
	return chordProgression.map((chord: string) => {
		const chordChars: string[] = chord.split('');
		for (var i = 0; i < chordChars.length; i++) {
			if (noteSet.includes(chordChars[i])) {
				chordChars[i] = transPoseKey(chordChars[i], currentRootKey, targetRootKey);
			}
		}
		return chordChars.join('');
	});
}

//Find and itentify all chords within a key
//function searchChordsInKey(rootKey: string) {}

function getChordSelectionKernel(selectedNotesCnt: number) {
	//for 3 -> [1, 0, 1, 0, 1], 4 -> [1, 0, 1, 0, 1, 0, 1]
	const selectionKernel: boolean[] = [];
	for (var i = 0; i < selectedNotesCnt * 2 - 1; i++) {
		if (i % 2 === 0) {
			selectionKernel.push(true);
		} else {
			selectionKernel.push(false);
		}
	}
	return selectionKernel;
}

function selectElemsWithKernel<ItemType>(offSetIndex: number, array: ItemType[], kernel: boolean[]): ItemType[] {
	const keysSelection: ItemType[] = kernel
		.map((selectedPos: boolean, index: number) => {
			if (selectedPos) {
				const currentIndex: number = getModuloIndex(offSetIndex + index, array.length);
				return array[currentIndex];
			}
			return undefined;
		})
		.filter((item: ItemType | undefined) => item) as ItemType[];
	return keysSelection;
}

//Example A, [1, 5, 6, 4], minor
// 0 is not allowed, chord indexing starts at 1
function getProgressionKeys(rootKey: string, progressionNumbers: number[], scaleTypeId: string, notes: number = 3): string[][] {
	const selectedScale: string[] = getScaleFromKey(rootKey, scaleTypeId);
	const selectionKernel: boolean[] = getChordSelectionKernel(notes);

	const resultChords: string[][] = progressionNumbers.map((progressionPos: number) => selectElemsWithKernel(progressionPos - 1, selectedScale, selectionKernel));
	return resultChords;

	/*progressionNumbers.forEach((progressionPos: number) => {
		const kernelProgressionIndices: number[] = selectionKernel.map((keySelected: boolean, index: number) => {
			if (keySelected) {
				return progressionPos + index;
			}
			return -1;
		});
		const chordIndices: number[] = kernelProgressionIndices.filter((index: number) => index > -1);
		const chordKeys: string[] = indexArrayToKeys(chordIndices);

		resultChords.push(chordKeys);
	});

	//Map indices
	const resultChords: string[][] = [];
	return resultChords;*/
}

//For physical mapping of formulas
export function halfStepsToBoolFormula(halfStepFormula: number[]): boolean[] {
	const scaleLength: number = halfStepFormula.reduce((prevResult: number, itemVal: number) => prevResult + itemVal);
	const boolFormula: boolean[] = new Array<boolean>(scaleLength);

	let index: number = 0;
	boolFormula[0] = true;
	for (const hsLength of halfStepFormula) {
		let halfStepsLeftTillNote: number = hsLength;
		while (halfStepsLeftTillNote > 0) {
			index++;
			boolFormula[index] = false;
		}
		index++;
		boolFormula[index] = true;
	}
	return boolFormula;
}

export function mapNotesOnRange(rangeStartKey: string, rangeLength: number, notesToMap: string[]): boolean[] {
	const rangeSubDivisionPoints: boolean[] = new Array<boolean>(rangeLength);

	const rangeStartIndex: number = noteSet.indexOf(rangeStartKey);
	//let currentNoteSetIndex: number = rangeStartIndex;

	for (let i = 0; i < rangeSubDivisionPoints.length; i++) {
		const currentRangeNoteIndex: number = getModuloIndex(rangeStartIndex + i, noteSet.length);
		const currentRangeNote: string = noteSet[currentRangeNoteIndex];
		if (notesToMap.includes(currentRangeNote)) {
			rangeSubDivisionPoints[i] = true;
		} else {
			rangeSubDivisionPoints[i] = false;
		}
	}

	return rangeSubDivisionPoints;
}

export function mapScaleOnRange(rangeStartKey: string, rangeLength: number, scaleRootKey: string, scaleTypeId: string): boolean[] {
	const scaleNotes: string[] = getScaleFromKey(scaleRootKey, scaleTypeId);
	return mapNotesOnRange(rangeStartKey, rangeLength, scaleNotes);
}

export function mapScaleOnStrings(baseTuning: string[], scaleRootKey: string, scaleTypeId: string, rangeLength: number = 12): boolean[][] {
	return baseTuning.map((stringRootNote: string) => mapScaleOnRange(stringRootNote, rangeLength, scaleRootKey, scaleTypeId));
}
export function mapNotesOnStrings(baseTuning: string[], notes: string[], rangeLength: number = 12): boolean[][] {
	return baseTuning.map((stringRootNote: string) => mapNotesOnRange(stringRootNote, rangeLength, notes));
}

const guitarStandardTuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'];
export function mapPrintGuitarScale(scaleRootKey: string, scaleTypeId: string, rangeLength: number = 14, tuning: string[] = guitarStandardTuning): void {
	console.log(`Guitar Map: ${scaleRootKey}${scaleTypeId} - Range: ${rangeLength} - Tuning: ${JSON.stringify(tuning)}`);

	const stringsScaleMapping: boolean[][] = mapScaleOnStrings(tuning, scaleRootKey, scaleTypeId, rangeLength);
	printStrings(stringsScaleMapping);
	printStringsHorizontal(stringsScaleMapping);
}
export function mapPrintGuitarChord(chordNotation: string, rangeLength: number = 14, tuning: string[] = guitarStandardTuning): void {
	console.log(`Guitar Map: ${chordNotation} - Range: ${rangeLength} - Tuning: ${JSON.stringify(tuning)}`);
	const chordNotes: string[] = getChordFromNotation(chordNotation);
	console.log(JSON.stringify(chordNotes));
	const stringsScaleMapping: boolean[][] = mapNotesOnStrings(tuning, chordNotes, rangeLength);
	printStrings(stringsScaleMapping);
	printStringsHorizontal(stringsScaleMapping);
}

function printStrings(noteSets: boolean[][]): void {
	console.log('Strings map: ');

	const stringLength: number = noteSets[0].length;
	for (let i = 0; i < stringLength; i++) {
		let stringsLineString: string = '|';
		for (const stringSet of noteSets) {
			if (stringSet[i]) {
				stringsLineString += 'X|';
			} else {
				stringsLineString += 'O|';
			}
		}
		console.log(stringsLineString);
	}
	console.log();
}

function printStringsHorizontal(noteSets: boolean[][], mirror?: boolean): void {
	console.log('Strings map horizontal: ');
	const stringLength: number = noteSets[0].length;
	let selectedNoteSet: boolean[][] = noteSets.reverse();
	if (mirror) {
		selectedNoteSet = noteSets;
	}

	let headerString: string = '|';
	for (let i = 0; i < stringLength; i++) {
		headerString += `${i % 10}|`;
	}
	console.log(headerString);
	for (const stringSet of selectedNoteSet) {
		let stringsLineString: string = '|';
		for (let i = 0; i < stringLength; i++) {
			let stringMapIndex: number = i;
			if (stringSet[stringMapIndex]) {
				stringsLineString += 'X|';
			} else {
				stringsLineString += 'O|';
			}
		}
		console.log(stringsLineString);
	}
	console.log(headerString);
}

function findCircularShiftEquivalenceIndex<ItemType>(array1: ItemType[], array2: ItemType[]): number {
	if (array1.length !== array2.length) {
		return -1;
	}

	for (let i = 0; i < array2.length; i++) {
		const shiftedArray2: ItemType[] = circularShift(array2, '>>', i);
		//const shiftedArray2: ItemType[] = circularShift(array2, '>>', i);
		if (JSON.stringify(array1) === JSON.stringify(shiftedArray2)) {
			return i;
		}
	}
	return -1;
}

export function getRelativeScales(rootNote: string, srcScaleTypeId: string): string[] {
	const allScaleFormulas: Record<string, number[]> = getAllScaleFormulas();
	const refScaleFormula: number[] = allScaleFormulas[srcScaleTypeId];
	const equivalentShifts: Record<string, number> = {};
	for (const scaleTypeId in allScaleFormulas) {
		const shiftEquivalenceIndex: number = findCircularShiftEquivalenceIndex(refScaleFormula, allScaleFormulas[scaleTypeId]);
		if (shiftEquivalenceIndex > -1) {
			equivalentShifts[scaleTypeId] = shiftEquivalenceIndex;
		}
	}

	const refScale: string[] = getScaleFromFormula(rootNote, refScaleFormula, noteSet);
	//const rootNoteIndex: number = refScale.indexOf(rootNote)
	const equivalentScaleTypes: string[] = [];
	//const rootNoteIndex: number = noteSet.indexOf(rootNote);
	for (const scaleTypeId in equivalentShifts) {
		const shiftEquivalenceIndex: number = -equivalentShifts[scaleTypeId];
		const shiftedNoteIndex: number = getModuloIndex(shiftEquivalenceIndex, refScale.length);
		//const shiftedNote: string = noteSet[shiftedNoteIndex];
		const shiftedNote: string = refScale[shiftedNoteIndex];
		equivalentScaleTypes.push(shiftedNote + ' ' + scaleTypeId);
	}
	return equivalentScaleTypes;
}

function getChord(rootKey: string, chordTypeId: string): string[] {
	if (!chordFormulas[chordTypeId]) {
		throw new Error('Chord of type: ' + chordTypeId + 'is not registered in chordFormulas');
	}
	const chordHsFormula: number[] = chordFormulas[chordTypeId];
	const rootAbsIndex: number = noteSet.indexOf(rootKey);
	const absNoteIndices: number[] = chordHsFormula.map((hsSteps: number) => getModuloIndex(rootAbsIndex + hsSteps, noteSet.length));
	return absNoteIndices.map((noteIndex: number) => noteSet[noteIndex]);
}
function extractKeyFromChordDef(chordNotation: string): string {
	return chordNotation[0];
}
function extractChordTypeFromChordDef(chordNotation: string): string {
	if (chordNotation.length <= 1) {
		return 'major';
	}

	return chordNotation.slice(1);
}
function getChordFromNotation(chordNotation: string) {
	return getChord(extractKeyFromChordDef(chordNotation), extractChordTypeFromChordDef(chordNotation));
}

//Todo map passed notes on string set (scale, chords, .etc) example get Am notes (A C E) and map them on guitar strings

//function generateChord(rootKey: string, chordType: string): string[] {}
//function getHsDistancesOfChord(chord: string[]): number[] {}

function runSamples(): void {
	console.log('Starting music theory examples: ------------------------');
	console.log(getScaleFromKey('C', 'major'));
	console.log(getScaleFromKey('C', 'ionian'));
	console.log(`A minor scale: `);
	// 1, 2, 3, 4, 5, 6, 7
	// A, B, C, D, E, F, G
	console.log(getScaleFromKey('A', 'minor'));
	// A, B, C, D, E, F, G
	console.log(getScaleFromKey('A', 'aeolian'));
	// E, F, G#, A, B, C, D
	console.log(`C - Ionian: ${getScaleFromKey('C', 'ionian')}`);
	console.log(`D - Dorian: ${getScaleFromKey('D', 'dorian')}`);
	console.log(`E - Phrygian: ${getScaleFromKey('E', 'phrygian')}`);
	console.log(`F - Lydian: ${getScaleFromKey('F', 'lydian')}`);
	console.log(`G - Mixolydian: ${getScaleFromKey('G', 'mixolydian')}`);
	console.log(`A - Aeolian: ${getScaleFromKey('A', 'aeolian')}`);
	console.log(`B - Locrian: ${getScaleFromKey('B', 'locrian')}`);
	//E, D, A, G
	console.log(transPoseKeyProgression(['A', 'G', 'D', 'C'], 'A', 'E'));
	//'Em|^C', 'D', 'Em', 'G'
	console.log(transposeChordProgression(['Am|^F', 'G', 'Am', 'C'], 'A', 'E'));
	//[A, C, E], [E, G, B], [F, A, C], [D, F, A]
	console.log(`getProgressionKeys ${JSON.stringify(getProgressionKeys('A', [1, 5, 6, 4], 'minor'))}`);
	//[A, C, E, G], [E, G, B, D], [F, A, C, E], [D, F, A, C]
	console.log(`getProgressionKeys ${JSON.stringify(getProgressionKeys('A', [1, 5, 6, 4], 'minor', 4))}`);
	console.log(`getProgressionKeys ${JSON.stringify(getProgressionKeys('A', [1, 6, 7, 8], 'minor'))}`);

	const stringsScaleMapping: boolean[][] = mapScaleOnStrings(guitarStandardTuning, 'A', 'minor', 13);
	printStrings(stringsScaleMapping);
	printStringsHorizontal(stringsScaleMapping);
	//mapPrintGuitarChord('Bdim');
	mapPrintGuitarChord('Am');

	//E dorian == Bminor
	//mapPrintGuitarScale('E', 'dorian');
	//const relScales: string[] = getRelativeScales('E', 'dorian');
	//console.log(relScales);

	//Expected Cmajor, Ddorian, Ephrygian ......
	//const relScales: string[] = getRelativeScales('A', 'minor');
	//console.log(relScales);
}
