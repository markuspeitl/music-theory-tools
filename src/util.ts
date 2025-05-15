// returns index in interval [0, rangeLength[
export function getModuloIndex(index: number, rangeLength: number) {
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

// [1, 2, 3, 4, 5, 6] --> amount: 2 --> [6, 5, 1, 2, 3, 4]
function circularShiftRightInternal<ItemType>(array: ItemType[], amount: number, invertDirection?: boolean) {
	return array.map((value: ItemType, index: number) => {
		let arrayPointerIndex = index + amount;
		if (invertDirection) {
			arrayPointerIndex = index - amount;
		}

		var circShiftedArrayIndex: number = getModuloIndex(arrayPointerIndex, array.length);
		//console.log(`in: ${arrayPointerIndex} modulo: ${circShiftedArrayIndex} of ${array.length} w: ${array}`);
		return array[ circShiftedArrayIndex ];
	});
}
const defaultCircShiftMode: '>>' | 'right' | '<<' | 'left' = '>>';
export function circularShift<ItemType>(array: ItemType[], mode: '>>' | 'right' | '<<' | 'left' = defaultCircShiftMode, amount: number) {
	if (mode === '>>' || mode === 'right') {
		return circularShiftRightInternal(array, amount, false);
	} else if (mode === '<<' || mode === 'left') {
		return circularShiftRightInternal(array, amount, false);
	}
	throw new Error('Unrecognized shift mode: ' + mode);
}

export function getSymbolFromIndex<SymbolType>(index: number, symbolSet: SymbolType[]): SymbolType {
	const shiftedIndex = getModuloIndex(index, symbolSet.length);
	return symbolSet[ shiftedIndex ];
}
