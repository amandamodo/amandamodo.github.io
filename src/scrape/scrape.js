import $ from 'jquery';
import moment from 'moment';

import prevArticles from './../data/articles';

const corsProxy = 'http://www.whateverorigin.org/get?url=';
const muckRack = 'https://muckrack.com/amanda-odonnell/articles';
const articles = {};
const sources = {};
const duplicates = {};

const numRequests = 10;
let finishedRequests = 0;

export function getArticles() {
	let i = 0;
	let title;
	let source;
	let timestamp;
	let list;
	let text;
	let body;

	do {
		$.ajax({ 
			type: "GET",
			url: corsProxy + encodeURIComponent(muckRack + '?page=' + i) + '&callback=?',  
			dataType: 'jsonp',
			success: (data) => { 
				$(data.contents).find('.news-story').each((i, article) => {
					article = $(article);
					title = article.find('.news-story-title a')[0];
					source = article.find('.news-story-body > a')[0];
					timestamp = article.find('.timeago').attr('title');

					if (title) {
						title = title.innerText;
					}

					if (title && source) {
						if (!articles[title]) {
							articles[title] = {
								articles: []
							};
						}

						if (moment(timestamp).isBefore(articles[title].earliestDate) || !articles[title].earliestDate) {					
							body = article.find('.news-story-body');

							if (body[0]) {
								text = body[0].innerText.split('—')[1];

								text = text.replace(/[ \s]*Amanda O'Donnell(, Austin American-Statesman)*( @amandamodo)*[ \s]*\w+([ \s]*\w+[ \s]\d+,[ \s]\w+[ \s]\w+[ \s]\d+(:)\d+[ \s]\w+)*/g, '');

							} else {
								text = '';
							}

							articles[title].earliestDate = timestamp;
							articles[title].text = text;
							articles[title].title = title;
							articles[title].source = {
								host: source.host,
								href: source.href
							};
						}

						if (!duplicates[title + source.href]) {
							if (!sources[source.host]) {
								sources[source.host] = 1;
							} 

							sources[source.host] += 1;

							articles[title].articles.push({
								source: {
									host: source.host,
									href: source.href
								},
								timestamp: timestamp
							})
						}

						duplicates[title + source.href] = true;
					}
				}); 

				requestComplete();
			},
			error: () => {
				requestComplete();
			}
		})

		i += 1;
	} while (i < numRequests)
}

function requestComplete() {
	let i;
	finishedRequests += 1;

	if (finishedRequests === numRequests) {
		//console.log(JSON.stringify(sources))

		// if new article, add to object
		for (i in articles) {
			if (!prevArticles[i]) {
				prevArticles[i] = articles[i];
				console.log(i, JSON.stringify(articles[i]))
			}
		}

		//console.log(JSON.stringify(prevArticles))

		console.log(Object.keys(prevArticles).length, 'articles')
	}
}

export default {
	getArticles
}