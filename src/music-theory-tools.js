const romanNumbers = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const noteSet = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const majorSelection = [2, 2, 1, 2, 2, 2, 1];
const minorSelection = [2, 1, 2, 2, 1, 2, 2];
const harmonicminor = new Array(minorSelection);
harmonicminor[6]++; // sharpened 7.th note
const melodicminor = new Array(minorSelection);
melodicminor[6]++; // sharpened 7.th note
melodicminor[5]++; // sharpened 6.th note

const scaleformulas = {
	major: majorSelection,
	minor: minorSelection,
	harmonicminor: harmonicminor,
	harmonicminor: melodicminor,
	hijaz: [1, 3, 1, 2, 1, 2, 2]
};
const modeScales = {
	ionian: 0,
	dorian: 1,
	phrygian: 2,
	lydian: 3,
	mixoladian: 4,
	aeolian: 5,
	locrian: 6
};
const calculatedScales = {};

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

generateDegreeBasedScaleFormulars();
calculateScalesFromFormulas(scaleformulas);

//Generate scale modes that relate to the major scale in 'shift' - degrees
function generateDegreeBasedScaleFormulars() {
	Object.keys(modeScales).forEach((name) => {
		const shiftedScale = circularShift(majorSelection, modeScales[name]);
		//console.log(shiftedScale)
		scaleformulas[name] = shiftedScale;
	});
}

function getModuloIndex(index, rangelength) {
	if (index < 0) {
		const scaletimes = Math.floor(-index / rangelength);
		return index + rangelength * scaletimes;
	} else if (index >= rangelength) {
		return index % rangelength;
	}
	return index;
}

function circularShift(array, amount) {
	const newArray = [];
	for (
		var arrayPointerIndex = amount;
		arrayPointerIndex < array.length + amount;
		arrayPointerIndex++
	) {
		var shiftedArrayPointer = getModuloIndex(arrayPointerIndex, array.length);
		newArray.push(array[shiftedArrayPointer]);
	}

	return newArray;
}

//Calculate every scale for every mode -> example for minor = aeolian mode -> calculate all 12 scales: Cm, C#m, Dm, D#m ... Bm
function calculateScalesFromFormulas(scaleformulas) {
	Object.keys(scaleformulas).forEach((scaleName) => {
		calculatedScales[scaleName] = {};
		noteSet.forEach((note) => {
			calculatedScales[scaleName][note] = [];

			const noteScale = getScale(note, scaleName);
			calculatedScales[scaleName][note].push(noteScale);
		});
	});
	return calculatedScales;
}

function getNoteFromIndex(index) {
	const shiftedIndex = getModuloIndex(index, noteSet.length);
	return noteSet[shiftedIndex];
}

function getScale(rootkey, scaletype) {
	//console.log("getScale: " + rootkey + " + " + scaletype)

	/*if(calculatedScales[scaletype] && calculatedScales[scaletype][rootkey]){
        return calculatedScales[scaletype][rootkey];
    }*/

	const rootIndex = noteSet.indexOf(rootkey);

	const noteAbsoluteIndices = [rootIndex];
	var lastIndex = rootIndex;
	scaleformulas[scaletype].forEach((halfsteps) => {
		noteAbsoluteIndices.push(lastIndex + halfsteps);
		lastIndex = noteAbsoluteIndices[noteAbsoluteIndices.length - 1];
	});

	//console.log(noteSet)
	//console.log(noteAbsoluteIndices)

	const selectedNotes = noteAbsoluteIndices.map((position) => {
		return getNoteFromIndex(position);
	});

	calculatedScales[scaletype][rootkey] = selectedNotes;
	return selectedNotes;
}

function extractChordBase(chord) {
	const trimmedchord = chord.trim();
	return trimmedchord.charAt(0);
}

function getChordNumbers(chordsProgressionSet, rootkey, scaletype) {
	const scale = getScale(extractChordBase(rootkey), scaletype);
	//console.log(scale)

	const resultProgressionSet = [];
	chordsProgressionSet.forEach((chordProgressionRow) => {
		const resultProgressionRow = chordProgressionRow.map((chord) =>
			Number(scale.indexOf(extractChordBase(chord)))
		);
		resultProgressionSet.push(resultProgressionRow);
	});

	return resultProgressionSet;
}

function transposeChordProgression(
	chordsProgressionSet,
	oldRootKey,
	scaletype,
	newRootKey,
	newScaleType
) {
	//console.log("Transpose chord progression: ")
	//console.log(chordsProgressionSet)
	//console.log("From " + oldRootKey + " " + scaletype + " to " + newRootKey + " " + newScaleType)

	const chordScaleIndices = getChordNumbers(chordsProgressionSet, oldRootKey, scaletype);
	//console.log(chordScaleIndices)
	if (newRootKey === 'N') {
		return chordIndicesToDisplayNumbers(chordScaleIndices);
	} else if (newRootKey === 'R') {
		const chordIndicesDisplayNumbers = chordIndicesToDisplayNumbers(chordScaleIndices);
		return chordDisplayNumbersToRomanNumbers(chordIndicesDisplayNumbers);
	}

	const newScale = getScale(extractChordBase(newRootKey), newScaleType);

	const resultProgressionRootKeys = chordScaleIndices.map((chordRow) =>
		chordRow.map((chordIndex) => newScale[chordIndex])
	);

	if (scaletype === newScaleType) {
		for (var y = 0; y < resultProgressionRootKeys.length; y++) {
			for (var x = 0; x < resultProgressionRootKeys[y].length; x++) {
				const originalChord = chordsProgressionSet[y][x];
				const originalChordType = originalChord.slice(1);

				resultProgressionRootKeys[y][x] =
					resultProgressionRootKeys[y][x] + originalChordType;
			}
		}
	}

	return resultProgressionRootKeys;
}

function chordIndicesToDisplayNumbers(chordNumbers) {
	return chordNumbers.map((chordRow) => chordRow.map((chordNumber) => chordNumber + 1));
}

function chordDisplayNumbersToRomanNumbers(chordDpNumbers) {
	return chordDpNumbers.map((chordRow) =>
		chordRow.map((chordNumber) => romanNumbers[chordNumber])
	);
}

//calculateScalesFromFormulas(scaleformulas);
/*//console.log(getScale('E', 'phrygian'))
//console.log(getScale('A', 'aeolian'))
const allScalesRange = calculateScalesFromFormulas(scaleformulas);
//console.log(allScalesRange)
const chordProgression = [['Em', 'C', 'D', 'Em'], ['C', 'D', 'C', 'D', 'Em'], ['Em', 'A']];
const chordNumbers = getChordNumbers(chordProgression, 'E', 'minor');
const adaptedChordNumbers = chordIndicesToDisplayNumbers(chordNumbers)
const romanChordNumbers = chordDisplayNumbersToRomanNumbers(adaptedChordNumbers)
console.log(JSON.stringify(chordProgression))
console.log(JSON.stringify(adaptedChordNumbers))
console.log(JSON.stringify(romanChordNumbers))

const transposedProgression = transposeChordProgression(chordProgression,'E', 'minor', 'A', 'minor')
console.log(JSON.stringify(transposedProgression))*/

function chordToNote(chord) {
	chord = chord.trim();
	chord = chord[0];
	return chord;
}

function detectScaleType(rootKey) {
	if (!rootKey) {
		return '';
	}

	if (rootKey.slice(1) === 'm') {
		return 'minor';
	}
	return 'major';
}

function extractChordProgression(parentElem) {
	const chordRowDivs = $(parentElem).find('div');
	return $.map(chordRowDivs, (chordRow) => {
		const chordRowText = chordRow.innerText;
		const chordsList = chordRowText.split('/');

		const result = { data: chordsList };

		if ($(chordRow).hasClass('repeated')) {
			result.repeated = 1;
		}
		if (chordRow.attributes['data-repeated'] && chordRow.attributes['data-repeated'].value) {
			result.repeated = Number(chordRow.attributes['data-repeated'].value);
		}

		// [array] stupid workaround as jquery auto flattens returned elements and does not give option to disable this behaviour
		return result;
	});
}

const openingTag = '<div>';
const seperator = '/';
const closeTag = '</div>';
function chordProgressionDataToHtmlRow(chordProgression) {
	var openingTag = '<div>';
	if (chordProgression.repeated) {
		openingTag = `${openingTag.slice(0, openingTag.length - 1)} data-repeated="${
			chordProgression.repeated
		}"${openingTag.slice(openingTag.length - 1)}`;
	}

	return openingTag + chordProgression.data.join(seperator) + closeTag;
}
function chordProgressionToHtml(chordProgressionDataList) {
	return chordProgressionDataList
		.map((chordProgression) => chordProgressionDataToHtmlRow(chordProgression))
		.join('');
}

function chordProgressionDataToTable(chordProgressionDataList) {
	return chordProgressionDataList.map((chordRowItem) => chordRowItem.data);
}
function copyProgressionTableIntoData(chordProgressionData, chordProgressionTable) {
	for (var i = 0; i < chordProgressionTable.length; i++) {
		chordProgressionData[i].data = chordProgressionTable[i];
	}
	return chordProgressionData;
}

function detectChordProgressionRoot(element) {
	//console.log("Detecting chord progression from element")
	const innerText = $(element).text().trim();

	var chordLines = innerText.split('\n');
	chordLines = chordLines.map((line) => line.trim());
	var chordsMatrix = chordLines.map((line) => line.split('/'));

	//Simple behaviour just take the first chord -> later detect based on all chords
	if (chordsMatrix.length > 0 && chordsMatrix[0].length > 0) {
		return chordsMatrix[0][0];
	}
	return null;
}

function isChordProgression(text) {
	return text && text.length > 3 && text.includes('/') && text.match(/[A-Z]+/g);
}

function detectAddRootKey(originalChordsDiv) {
	if (!originalChordsDiv.length) {
		return null;
	}
	const rootKey = detectChordProgressionRoot(originalChordsDiv);
	if (!rootKey) {
		return null;
	}
	originalChordsDiv.attr('data-origkey', rootKey);
	return rootKey;
}

function getRootKey(chordHolderElem) {
	var originalChordsDiv = $(chordHolderElem).find('div[data-origkey]');
	if (!originalChordsDiv.length) {
		originalChordsDiv = $(chordHolderElem).children().first();
		return detectAddRootKey(originalChordsDiv);
	} else {
		return $(originalChordsDiv).attr('data-origkey');
	}
}

function generateTranspositionsForChordsHolder(chordHolderElem) {
	var originalRootKey = getRootKey(chordHolderElem);
	const originalScaleType = detectScaleType(originalRootKey);
	var transpositions = $(chordHolderElem).find('div[data-transposekey]');

	var originalChordsDiv = $(chordHolderElem).find('div[data-origkey]');
	const extractedChordProgression = extractChordProgression(originalChordsDiv);
	const extractedChordProgressionTable = chordProgressionDataToTable(extractedChordProgression);
}

function generateTranspositionsForSong(songHolderElem) {
	iterateElementsFromParent(
		songHolderElem,
		'.chordsholder',
		generateTranspositionsForChordsHolder
	);
}

function generateTranspositions() {
	//console.log("Starting to generate Chord Transpositions")
	//const originalChordsDivList = $("div[data-origkey]");
	const chordHolderList = $('.chordsholder');

	chordHolderList.each((originalChordsIndex, chordHolderDiv) => {
		var originalChordsDiv = $(chordHolderDiv).find('div[data-origkey]');

		if (!originalChordsDiv.length) {
			//originalChordsDiv = $(chordHolderDiv).find(':first-child');
			originalChordsDiv = $(chordHolderDiv)
				.children()
				.filter((index, elem) => isChordProgression(elem.textContent))
				.first();
			//return this.textContent && this.textContent.length > 3 && this.textContent.includes('/')
			if (!originalChordsDiv.length) {
				return;
			}
			const rootKey = detectChordProgressionRoot(originalChordsDiv);
			if (!rootKey) {
				return;
			}
			originalChordsDiv.attr('data-origkey', rootKey);
		}

		//console.log(originalChordsDiv)

		const origkey = $(originalChordsDiv).attr('data-origkey');
		const origScaleType = detectScaleType(origkey);

		//console.log("Found original Scale type: " + origkey + " / " + origScaleType)

		var transpositions = $(originalChordsDiv).siblings('.transposedchords');
		if (!transpositions.length) {
			console.log('No transpose siblings');
		}

		const extractedChordProgression = extractChordProgression(originalChordsDiv);
		const extractedChordProgressionTable =
			chordProgressionDataToTable(extractedChordProgression);

		//console.log("Extracted chord progression: ")
		//console.log(extractedChordProgression)

		transpositions.each((transpositionIndex, transpositionElem) => {
			//console.log("Found transposition placeholder element")

			const transposekey = transpositionElem.attributes['data-transposekey'].value;
			const transposeScaleType = detectScaleType(transposekey);
			const transposedProgression = transposeChordProgression(
				extractedChordProgressionTable,
				origkey,
				origScaleType,
				transposekey,
				transposeScaleType
			);

			//console.log("Extracted transposed Progression for " + transposekey + " " + transposeScaleType + " :")
			//console.log(transposedProgression)

			const transposedProgressionData = copyProgressionTableIntoData(
				extractedChordProgression,
				transposedProgression
			);
			//console.log(transposedProgressionData)

			const transposedProgressionHtml = chordProgressionToHtml(transposedProgressionData);

			transpositionElem.innerHTML = transposedProgressionHtml;
		});
	});
}
