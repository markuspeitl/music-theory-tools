import { circularShift } from './util.js';

function mutateScale(srcScaleFormula: number[], mutation: number[]): number[] {
	if (srcScaleFormula.length !== mutation.length) {
		throw new Error('Size of scale and mutation must match');
	}
	const scaleClone: number[] = Array.from(srcScaleFormula);
	return scaleClone.map((value: number, index: number, array: number[]) => value + mutation[index]);
}

//Degree between 0 and 6
function generateScaleDegree(referenceScaleFormula: number[], degree: number): number[] {
	//Modes must be based on existing scale formula (and are shifted)
	//Dorian
	//const shiftedFormula: number[] = referenceScaleFormula.map((hsDistance: number) => hsDistance + degree);

	return circularShift(referenceScaleFormula, '>>', degree);
}
export function generateMajorScaleDegreeFormula(degree: number): number[] {
	return generateScaleDegree(majorScaleHSFormula, degree);
}

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

export const baseScaleFormulas: Record<string, number[]> = {
	major: majorScaleHSFormula,
	minor: minorScaleHSFormula,
	harmonicminor: harmonicMinorScaleHSFormula,
	melodicminor: melodicMinorScaleHSFormula,
	hijaz: hijazScaleHSFormula
};
export const scaleModeShifts: Record<string, number> = {
	ionian: 0, //=major
	dorian: 1,
	phrygian: 2, //E based start
	lydian: 3,
	mixolydian: 4,
	aeolian: 5, //12 - 3 = 9
	locrian: 6
};

//SUS - Remove note on 3rd pos from triad and add note on SUS number position Am: A C E -> Asus2: A B E -> Asus4: A D E
//ADD - Add note on ADD number position to triad
export const chordFormulas: Record<string, number[]> = {
	major: [0, 4, 7],
	minor: [0, 3, 7],
	m: [0, 3, 7],
	dim: [0, 3, 6],
	'°': [0, 3, 6],
	'7': [0, 4, 7, 10],
	maj7: [0, 4, 7, 11],
	m7: [0, 3, 7, 10],
	sus2: [0, 2, 7],
	sus4: [0, 5, 7],
	add9: [0, 2, 3, 7],
	'9': [],
	maj9: [],
	min9: []
};

export const guitarStandardTuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'];
