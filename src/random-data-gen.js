function getRandomLowerLetter() {
	var charset = 'abcdefghijklmnopqrstuvwxyz';
	return charset.charAt(Math.floor(Math.random() * charset.length));
}
function getRandomCapitalLetter() {
	var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	return charset.charAt(Math.floor(Math.random() * charset.length));
}

//Rand word between 2, 14 chars
function getRandomWord() {
	const length = Math.floor(2 + Math.random() * 12.99);

	const letters = [];

	for (var i = 0; i < length; i++) {
		if (i === 0) {
			letters.push(getRandomCapitalLetter());
		} else {
			letters.push(getRandomLowerLetter());
		}
	}

	return letters.join('');
}

function getRandomSentence(length) {
	const words = [];
	for (var i = 0; i < length; i++) {
		words.push(getRandomWord());
	}

	return words.join(' ');
}

function generateRandomSongMeta() {
	titleWordsCnt = 1 + Math.floor(Math.random() * 3.99);
	authorWordsCnt = Math.floor(Math.random() * 3.5);

	const title = getRandomSentence(titleWordsCnt);
	var author = getRandomSentence(authorWordsCnt);
	if (author) {
		author = '(' + author + ')';
	}
	return {
		index: 0,
		number: 1 + Math.floor(Math.random() * 250),
		title: title,
		id: titleToId(title),
		author: author,
		pageNumber: 1 + Math.floor(Math.random() * 1000)
	};
}

function appendRandomSongMetas(songMetas, length) {
	for (var i = 0; i < length; i++) {
		songMetas.push(generateRandomSongMeta());
	}
	return songMetas;
}

function generateRandomSongMetas(length) {
	return appendRandomSongMetas([], length);
}
