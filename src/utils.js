/* General JS */

function iterateArray(elemList, consumerFunction) {
	iterateArrayCollect(elemList, consumerFunction);
}
function iterateArrayCollect(elemList, consumerFunction, args) {
	const resultArray = [];
	if (!elemList || elemList.length <= 0) {
		return resultArray;
	}

	elemList.forEach((elem) => {
		if (args && args.length > 0) {
			resultArray.push(consumerFunction(elem, ...args));
		} else {
			resultArray.push(consumerFunction(elem));
		}
	});
	return resultArray;
}

/* General Jquery */

function iterateElements(classSelector, consumerFunction) {
	iterateElementsCollect(classSelector, consumerFunction);
}
function iterateElementsCollect(classSelector, consumerFunction) {
	const elemList = $(classSelector);
	const resultArray = [];
	elemList.each((index, elem) => {
		resultArray.push(consumerFunction(elem));
	});
	return resultArray;
}
function iterateElementsFromParent(parentElem, classSelector, consumerFunction) {
	iterateElementsFromParentCollect(parentElem, classSelector, consumerFunction);
}
function iterateElementsFromParentCollect(parentElem, classSelector, consumerFunction) {
	const elemList = $(parentElem).find(classSelector);
	const resultArray = [];
	elemList.each((index, elem) => {
		resultArray.push(consumerFunction(elem));
	});
	return resultArray;
}
function applyOperationArray(elem, operationArray) {
	operationArray.forEach((operation) => {
		operation(elem);
	});
}

/* Dom specific */

//Tracks the registered dom events and removes the handlers if
// a subscription with the same function exists on the element

//Example
/*registeredEvtHandlersDict = {
    elem1: {
        'click': [evtHandlerFn1, evtHandlerFn2, evtHandlerFn3],
        'blur': [blurFn1]
    },
    elem2: {

    }
}*/
const registeredEvtHandlersDict = {};
function removeEventHandlerOfFunction(elem, label, evtHandlerFn) {
	if (registeredEvtHandlersDict.hasOwnProperty(elem)) {
		const elemEntry = registeredEvtHandlersDict[elem];

		if (elemEntry.hasOwnProperty(label)) {
			const labelSubs = elemEntry[label];
			//console.log(registeredEvtHandlersDict)
			labelSubs.forEach((subscribedEvtHandlerFn) => {
				if (subscribedEvtHandlerFn === evtHandlerFn) {
					elem.removeEventListener(label, subscribedEvtHandlerFn);
				}
			});

			delete registeredEvtHandlersDict[elem][label];
		}
	}
}

function registerEventHandler(elem, label, evtHandlerFn) {
	if (!registeredEvtHandlersDict.hasOwnProperty(elem)) {
		registeredEvtHandlersDict[elem] = {};
	}
	const subsDictForElem = registeredEvtHandlersDict[elem];

	if (!subsDictForElem[label]) {
		subsDictForElem[label] = [];
	}
	//const labelSubs = subsDictForElem[label]
	/*if (labelSubs.length > 0) {
        labelSubs.forEach((eventHandler) => $(elem).removeEventListener(label, eventHandler));
    }*/

	if (subsDictForElem[label].length > 0) {
		registeredEvtHandlersDict[elem][label].push(evtHandlerFn);
	} else {
		registeredEvtHandlersDict[elem][label] = [evtHandlerFn];
	}
}

function addUniqueEventListener(elem, evtLabel, evtHandlerFn) {
	var activeElem = elem;

	if (activeElem && !activeElem.addEventListener) {
		console.log(elem);
		activeElem = $(elem)[0];
	}

	if (activeElem) {
		removeEventHandlerOfFunction(activeElem, evtLabel);
		activeElem.addEventListener(evtLabel, evtHandlerFn);
		registerEventHandler(activeElem, evtLabel, evtHandlerFn);
	}
}

function addUniqueEventListenerToArray(elemArray, evtLabel, evtHandlerFn) {
	if (Array.isArray(elemArray)) {
		elemArray.forEach((elem) => {
			addUniqueEventListener(elem, evtLabel, evtHandlerFn);
		});
	} else {
		elemArray.each((index, elem) => {
			addUniqueEventListener(elem, evtLabel, evtHandlerFn);
		});
	}
}
