//import { JSDOM } from 'jsdom';
//import d3 from 'd3';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { guitarStandardTuning } from './formulas.js';
import { getChordFromNotation, mapNotesOnStrings, getScaleFromKey } from './scales-gen.js';
//import { scaleLinear } from 'd3';
//import d3 from 'd3';
import * as d3 from 'd3';

function stringsMappingToCoordinates(stringsMapping: boolean[][]): Array<number[]> {
	const noteCoordinates: Array<number[]> = [];
	for (let y = 0; y < stringsMapping.length; y++) {
		for (let x = 0; x < stringsMapping[y].length; x++) {
			if (stringsMapping[y][x]) {
				noteCoordinates.push([x, y]);
			}
		}
	}
	return noteCoordinates;
}

export function stringsMapToSvg(stringsMapping: boolean[][]): string {
	//const d3 = await import('d3');

	const jsDom: JSDOM = new JSDOM();
	const document: Document = jsDom.window.document;
	const d3Element: d3.Selection<any, any, any, any> = d3.select(document.body);

	const xLength: number = stringsMapping[0].length;
	const yLength: number = stringsMapping.length;
	const xDataMax: number = xLength - 1;
	const yDataMax: number = yLength - 1;

	const tickLabelPadding: number = 15;
	const tickLabelFontSize: number = 17;
	const margin = 40;
	const svgWidth = xDataMax * 50;
	const svgHeight = yDataMax * 50;
	const dotRadius = 10;
	const svg = d3Element
		.append('svg')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('width', `${svgWidth + margin * 2}px`)
		.attr('height', `${svgHeight * stringsMapping.length + margin * 2}px`)
		.append('g')
		.attr('transform', 'translate(' + margin + ',' + margin + ')');

	const noteCoordinates: Array<number[]> = stringsMappingToCoordinates(stringsMapping);
	console.log(noteCoordinates);

	const xScaleFn = d3.scaleLinear().domain([0, xDataMax]).range([0, svgWidth]);
	const yScaleFn = d3.scaleLinear().domain([0, yDataMax]).range([svgHeight, 0]);

	//const bottomAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(xScaleFn).tickFormat(d3.format(',.2%')).tickSize(0);
	const xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(xScaleFn).ticks(xDataMax).tickPadding(tickLabelPadding);

	const xAxisGrid: d3.Axis<d3.NumberValue> = d3
		.axisBottom(xScaleFn)
		.tickSize(-svgHeight)
		.tickFormat((val) => '')
		.ticks(xDataMax);

	const yAxis: d3.Axis<d3.NumberValue> = d3.axisLeft(yScaleFn).ticks(yDataMax).tickPadding(tickLabelPadding);

	const yAxisGrid: d3.Axis<d3.NumberValue> = d3
		.axisLeft(yScaleFn)
		.tickSize(svgWidth)
		.tickFormat((val) => '')
		.ticks(yDataMax);

	//.tickSize(0);
	const xAxisSelection = svg
		.append('g')
		.attr('transform', 'translate(0,' + svgHeight + ')')
		.call(xAxis);
	svg
		.append('g')
		.attr('transform', 'translate(0,' + svgHeight + ')')
		.call(xAxisGrid);
	const yAxisSelection = svg.append('g').call(yAxis);
	svg
		.append('g')
		.attr('transform', 'translate(' + svgWidth + ',0)')
		.call(yAxisGrid);

	xAxisSelection.selectAll('.tick').style('font-size', tickLabelFontSize + 'px');
	yAxisSelection.selectAll('.tick').style('font-size', tickLabelFontSize + 'px');

	svg
		.append('g')
		.selectAll('dot')
		//.data(lineData)
		.data(noteCoordinates)
		.enter()
		.append('circle')
		.attr('cx', function (dataElem: number[]) {
			return xScaleFn(dataElem[0]);
		})
		.attr('cy', function (dataElem: number[]) {
			return yScaleFn(dataElem[1]);
		})
		.attr('r', dotRadius)
		.style('fill', function (dataElem: number[]) {
			if (dataElem[0] === 0 || dataElem[0] === 12) {
				return 'Green';
			}

			return 'Blue';
		})
		.style('stroke', 'Black')
		.style('stroke-width', 2);

	const svgString: string = String((d3Element.select('svg').node() as any).outerHTML);
	return svgString;

	//console.log(svgString);

	//const html = jsDom.serialize();

	//fs.writeFileSync('svghtml.html', html);
}

export function writeSvgToFile(svgString: string, filePath: string): void {
	console.log(svgString);
	fs.writeFileSync(filePath, svgString);
}

export function mapStringsOutPutSvg(chordNotation: string, rangeLength: number = 14, tuning: string[] = guitarStandardTuning): void {
	console.log(`Guitar Map: ${chordNotation} - Range: ${rangeLength} - Tuning: ${JSON.stringify(tuning)}`);
	const notesToMap: string[] = getChordFromNotation(chordNotation);
	//const notesToMap: string[] = getScaleFromKey('A', 'minor');
	console.log(JSON.stringify(notesToMap));
	const stringsScaleMapping: boolean[][] = mapNotesOnStrings(tuning, notesToMap, rangeLength);
	const svgString: string = stringsMapToSvg(stringsScaleMapping);
	const svgPath: string = chordNotation + '.svg';
	writeSvgToFile(svgString, svgPath);
}

/*mapStringsOutPutSvg('Am');

import open from 'open';
open('Am.svg', { wait: true });*/

//import open from 'open';
//await open('svghtml.html', { wait: true });

/*function stringsMapToSvg(stringsMapping: boolean[][]): void {
	//const d3 = await import('d3');

	const jsDom: JSDOM = new JSDOM();
	const document: Document = jsDom.window.document;
	const d3Element: d3.Selection<any, any, any, any> = d3.select(document.body);

	const margin = 40;
	const svgWidth = 500;
	const svgHeight = 50;
	const dotRadius = 10;
	const svg = d3Element
		.append('svg')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('width', `${svgWidth + margin * 2}px`)
		.attr('height', `${svgHeight * stringsMapping.length + margin * 2}px`)
		.append('g')
		.attr('transform', 'translate(' + margin + ',' + margin + ')');

	//const lineData: boolean[] = [ false, true, false, true, true ];

	for (let i = 0; i < stringsMapping.length; i++) {
		//const lineData: boolean[] = stringsMapping[0];
		const lineData: boolean[] = stringsMapping[stringsMapping.length - 1 - i];

		const data = lineData.map((state: boolean, index: number) => [index, state]);

		const xScaleFn = d3.scaleLinear().domain([0, lineData.length]).range([0, svgWidth]);
		const yScaleFn = d3.scaleLinear().domain([1, 0]).range([svgHeight, 0]);

		//const bottomAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(xScaleFn).tickFormat(d3.format(',.2%')).tickSize(0);
		const bottomAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(xScaleFn).tickFormat((val) => '');

		const xAxisGrid: d3.Axis<d3.NumberValue> = d3
			.axisBottom(xScaleFn)
			.tickSize(-svgHeight + dotRadius)
			.tickFormat((val) => '');
		//.tickSize(0);
		svg
			.append('g')
			.attr('transform', 'translate(0,' + svgHeight * i + ')')
			.call(bottomAxis);
		svg
			.append('g')
			.attr('transform', 'translate(0,' + svgHeight * i + ')')
			.call(xAxisGrid);

		//svg.append('g').call(d3.axisLeft(yScaleFn));

		svg
			.append('g')
			.selectAll('dot')
			//.data(lineData)
			.data(data)
			.enter()
			.append('circle')
			.attr('cx', function (dataElem) {
				return xScaleFn(Number(dataElem[0]));
			})
			.attr('cy', function (dataElem) {
				if (!dataElem[1]) {
					return -10000;
				}

				return svgHeight * i; //+ yScaleFn(Number(dataElem[1]));
			})
			.attr('r', dotRadius)
			.style('fill', function (dataElem) {
				if (dataElem[0] === 0 || dataElem[0] === 12) {
					return 'Green';
				}

				return 'Blue';
			})
			.style('stroke', 'Black')
			.style('stroke-width', 2);
	}

	const svgString: string = String(d3Element.select('svg').node());
	const html = jsDom.serialize();

	fs.writeFileSync('svghtml.html', html);
}*/
