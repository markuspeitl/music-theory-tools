//import { JSDOM } from 'jsdom';
//import d3 from 'd3';
import { JSDOM } from 'jsdom';
import fs from 'fs';
async function testD3() {
	const d3 = await import('d3');

	const jsDom: JSDOM = new JSDOM();
	const document: Document = jsDom.window.document;
	const d3Element: d3.Selection<any, any, any, any> = d3.select(document.body);

	const margin = 40;
	const svgWidth = 500;
	const svgHeigth = 500;
	const svg = d3Element
		.append('svg')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('width', '580px')
		.attr('height', '580px')
		.append('g')
		.attr('transform', 'translate(' + margin + ',' + margin + ')');

	const lineData: boolean[] = [false, true, false, true, true];
	const data = lineData.map((state: boolean, index: number) => [index, state]);

	const xScaleFn = d3.scaleLinear().domain([0, lineData.length]).range([0, svgWidth]);
	const yScaleFn = d3.scaleLinear().domain([1, 0]).range([svgHeigth, 0]);

	svg
		.append('g')
		.attr('transform', 'translate(0,' + svgHeigth + ')')
		.call(d3.axisBottom(xScaleFn));

	svg.append('g').call(d3.axisLeft(yScaleFn));

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
			return yScaleFn(Number(dataElem[1]));
		})
		/*.attr('cx', function (dataElem: boolean) {
			return xScaleFn(lineData.indexOf(dataElem));
		})
		.attr('cy', function (dataElem: boolean) {
			return yScaleFn(Number(dataElem));
		})*/
		.attr('r', 3)
		.style('fill', 'Red');

	/*const height: number = 100;
	const width: number = 100;
	var xAxisFn = d3.scaleLinear().range([0, width]);
	var yAxisFn = d3.scaleLinear().range([height, 0]);
	d3.axisBottom;
	//const yAxis = d3.axisLeft().orient("left").outerTickSize(0);
	grid_chart.y_scale = d3.scaleOrdinal();

	//Data domain --> visualization Range
	const ordinalMapperFn = d3.scaleOrdinal().domain(['0', '1']).range(['white', 'black']);
	//.attr("fill", (d) => colorScale(parseTime(d.date).getFullYear()))
	*/

	const svgString: string = String(d3Element.select('svg').node());
	const html = jsDom.serialize();

	fs.writeFileSync('svghtml.html', html);
}
//testD3();
