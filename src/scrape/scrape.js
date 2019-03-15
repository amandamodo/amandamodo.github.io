import $ from 'jquery';
import moment from 'moment';

const corsProxy = 'http://www.whateverorigin.org/get?url=';
const muckRack = 'https://muckrack.com/amanda-odonnell/articles';
const articles = {};
const sources = {};
const duplicates = {};

const numRequests = 40;
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
					//console.log(article)
					article = $(article);
					title = article.find('.news-story-title')[0];
					source = article.find('.news-story-body a')[0];
					timestamp = article.find('.timeago').attr('title');

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
	finishedRequests += 1;

	if (finishedRequests === numRequests) {
		console.log(JSON.stringify(articles))
		console.log(JSON.stringify(sources))
	}
}

export default {
	getArticles
}