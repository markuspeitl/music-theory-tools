function mutateScale(srcScaleFormula: number[], mutation: number[]): number[] {
	if (srcScaleFormula.length !== mutation.length) {
		throw new Error('Size of scale and mutation must match');
	}
	const scaleClone: number[] = Array.from(srcScaleFormula);
	return scaleClone.map((value: number, index: number, array: number[]) => value + mutation[index]);
}

//Symbols
const romanNumbers: string[] = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const noteSet: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

//Default reference point in common music theory is major scale starting from C note
const majorScaleHSFormula: number[] = [2, 2, 1, 2, 2, 2, 1];
const minorScaleHSFormula: number[] = [2, 1, 2, 2, 1, 2, 2];
// sharpened 7.th note
const harmonicMinorScaleHSFormula: number[] = mutateScale(minorScaleHSFormula, [0, 0, 0, 0, 0, 0, 1]);
// sharpened 6.th note
const melodicMinorScaleHSFormula: number[] = mutateScale(minorScaleHSFormula, [0, 0, 0, 0, 0, 1, 1]);
const hijazScaleHSFormula: number[] = [1, 3, 1, 2, 1, 2, 2];
const majorPentaTonic: number[] = [2, 2, 3, 2, 3];
const minorPentaTonic: number[] = [3, 2, 2, 3, 2];

/*const harmonicminor: number[] = Array.from(minorSelection);
harmonicminor[6]++; // sharpened 7.th note
const melodicminor = Array.from(minorSelection);
melodicminor[6]++; // sharpened 7.th note
melodicminor[5]++; // sharpened 6.th note*/

const baseScaleFormulas: Record<string, number[]> = {
	major: majorScaleHSFormula,
	minor: minorScaleHSFormula,
	harmonicminor: harmonicMinorScaleHSFormula,
	melodicMinor: melodicMinorScaleHSFormula,
	hijaz: [1, 3, 1, 2, 1, 2, 2]
};
const scaleModeShifts: Record<string, number> = {
	ionian: 0, //=major
	dorian: 1,
	phrygian: 2, //E based start
	lydian: 3,
	mixolydian: 4,
	aeolian: 5, //12 - 3 = 9
	locrian: 6
	/*ionian: 0, //=major
	halfdorian: 1,
	dorian: 2,
	halfphrygian: 3,
	phrygian: 4, //E based start
	lydian: 5,
	halfmixolydian: 6,
	mixolydian: 7,
	halfaolian: 8,
	aeolian: 9, //12 - 3 = 9
	halflocrian: 10,
	locrian: 11*/
};
//SUS - Remove note on 3rd pos from triad and add note on SUS number position Am: A C E -> Asus2: A B E -> Asus4: A D E
//ADD - Add note on ADD number position to triad
const chordFormulas = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	7: [0, 4, 7, 10],
	maj7: [0, 4, 7, 11],
	m7: [0, 3, 7, 10],
	sus2: [0, 2, 7],
	sus4: [0, 5, 7],
	add9: [0, 2, 3, 7],
	dim: [0, 0, 0],
	9: [],
	maj9: [],
	min9: []
};

// returns index in interval [0, rangeLength[
function getModuloIndex(index: number, rangeLength: number) {
	const indexInRange: number = index % rangeLength;
	if (indexInRange >= 0) {
		return indexInRange;
	}
	return rangeLength + indexInRange;

	/*if (index < 0) {
		const residue: number = Math.abs(index) % rangeLength;
		return rangeLength - residue;
	} else if (index >= rangeLength) {
		return index % rangeLength;
	}
	return index;*/
}

function circularShift<ItemType>(array: ItemType[], amount: number) {
	return array.map((value: ItemType, index: number) => {
		const arrayPointerIndex = index + amount;
		var circShiftedArrayIndex: number = getModuloIndex(arrayPointerIndex, array.length);
		//console.log(`in: ${arrayPointerIndex} modulo: ${circShiftedArrayIndex} of ${array.length} w: ${array}`);
		return array[circShiftedArrayIndex];
	});
	/*const newArray = [];
	for (var arrayPointerIndex = amount; arrayPointerIndex < array.length + amount; arrayPointerIndex++) {
		var shiftedArrayPointer = getModuloIndex(arrayPointerIndex, array.length);
		newArray.push(array[shiftedArrayPointer]);
	}
	return newArray;*/
}

//Degree between 0 and 6
function generateScaleDegree(referenceScaleFormula: number[], degree: number): number[] {
	//Modes must be based on existing scale formula (and are shifted)
	//Dorian
	//const shiftedFormula: number[] = referenceScaleFormula.map((hsDistance: number) => hsDistance + degree);

	return circularShift(referenceScaleFormula, degree);
}
function generateMajorScaleDegreeFormula(degree: number): number[] {
	return generateScaleDegree(majorScaleHSFormula, degree);
}

function getSymbolFromIndex<SymbolType>(index: number, symbolSet: SymbolType[]): SymbolType {
	const shiftedIndex = getModuloIndex(index, noteSet.length);
	return symbolSet[shiftedIndex];
}

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

function getNoteIndicesFromOffset(startOffset: number, scaleFormula: number[]): number[] {
	/*let lastIndexValue: number = startOffset;
	const scaleFormulaWithSelf: number[] = [0].concat(scaleFormula);
	return scaleFormulaWithSelf.map((halfStepIncrementCnt: number, index: number, array: number[]) => {
		if (index <= 0) {
			return startOffset;
		}
		const currentIndex: number = lastIndexValue + halfStepIncrementCnt;
		lastIndexValue = currentIndex;
		return currentIndex;
	});*/

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
	const rootIndex = symbolSet.indexOf(rootSymbol);
	const scaleFormula: number[] = getScaleFormulaFromId(scaleTypeId);
	console.log('Selected formula: ' + scaleFormula);
	const scaleAbsIndices: number[] = getNoteIndicesFromOffset(rootIndex, scaleFormula);
	const scaleNotes: SymbolType[] = scaleAbsIndices.map((index: number) => getSymbolFromIndex(index, symbolSet));
	return scaleNotes;
}
function getScaleFromKey(rootKey: string, scaleTypeId: string): string[] {
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
function transposeChordProgression(chordProgression: string[], currentRootKey: string, targetRootKey: string): string[] {
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

//Calc freqs
//Calc alternative tunings
