//Calc freqs
//Calc alternative tunings

import { noteSet } from './scales-gen.js';

// A3 = 220, A2 = 110, A0 = 65
function calcNoteFrequency(targetNote: string, refFreq: number = 440, refNote: string = 'A4'): number {
	const refNoteKey: string = refNote[0];
	const refOctave: number = Number(refNote.slice(1));
	const targetNoteKey: string = targetNote.slice(0, targetNote.length - 1);
	const targetOctave: number = Number(targetNote.slice(targetNote.length - 1));

	const octaveDiff: number = targetOctave - refOctave;
	const noteDiff: number = noteSet.indexOf(targetNoteKey) - noteSet.indexOf(refNoteKey);

	const notefreq: number = refFreq * Math.pow(2, octaveDiff + noteDiff / noteSet.length);
	return notefreq;
}

//~440Hz
console.log(calcNoteFrequency('A4'));
//~261.6Hz
console.log(calcNoteFrequency('C4'));
//~146.8Hz
console.log(calcNoteFrequency('D3'));
//~1396Hz
console.log(calcNoteFrequency('F6'));
//~69.3Hz
console.log(calcNoteFrequency('C#2'));
