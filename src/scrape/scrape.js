import $ from 'jquery';
import moment from 'moment';

import prevArticles from './../data/articles';

const corsProxy = 'https://api.allorigins.win/get?url=';
const muckRack = 'https://muckrack.com/amanda-odonnell/articles';
const articles = {};
const sources = {};
const duplicates = {};

const numRequests = 10;
let finishedRequests = 0;

// list of article titles that were changed slightly by other publications
const ignore = [	
	'Whataburger explores possible sale of popular burger chain',	 			// Whataburger hires Morgan Stanley to explore possible sale
	'Texas city named best place to live in America for third year in a row',	// Austin named best place to live in America for third year in a row by U.S. News and World Report
	'Texas school district announces new dress code ... for parents',			// Texas school district announces new dress code for parents
	"'Have you been to Austin? It's amazing': Nashville comedians' 'PSA' urges newcomers to opt for Austin",
	"5 things to know before shooting Fourth of July fireworks",
	"Not a tourist trap: 9 Austin Tex-Mex and Mexican restaurants to try",
	"Review: Lil Yachty at SXSW is what happens when fame meets a lack of s",
	"Texas’ most expensive rental spot is this Austin zip code, repor",
	"What Austinites are saying about the cit",
	"Pilot flies veteran father's remains home to Texas, 52 years after he went missing",
	"'It's bad': Water rescues begin as Imelda soaks east Texas",				// AP,
	"Toddler finds rare pink grasshopper in Texas backyard",
	"Texas child finds rare pink grasshopper in Austin backyard",
	"Barton Springs Pool's reopening plan revealed: reservations, masks and limited hours",
	"DELAYED: Thunderbirds flyover salute of coronavirus workers pushed to 3:40 p.m.",
	"Here are the Austin events currently under review by Austin Public Health",
	"The features first-time homebuye",
	"Hurricane Laura caused a Texas river to flow backward for hours",
	"Former Eagles linebacker Acho launches 'Uncomfortable Conversations with a Black Man'",
	"Abbott: Proposal that would land Austin police under state control has been drafted",
	"Easy Tiger to close original downtown location",
]

export function getArticles() {
	let i = 0;
	let title;
	let source;
	let timestamp;
	let text;
	let body;

	do {
		$.ajax({ 
			type: "GET",
			url: corsProxy + encodeURIComponent(muckRack + '?page=' + i),  
			dataType: 'jsonp',
			success: (data) => { 
				$(data.contents).find('.news-story').each((i, article) => {
					article = $(article);
					title = article.find('.news-story-title a')[0];
					source = article.find('.news-story-body > a:not(.timeago)')[0];
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
		// if new article, add to object
		for (i in articles) {
			if (!prevArticles[i] && ignore.indexOf(i) === -1) {
				prevArticles[i] = articles[i];
				console.log(`${JSON.stringify(i)}:`, JSON.stringify(articles[i]))
			}
		}

		//console.log(JSON.stringify(prevArticles))

		console.log(`${Object.keys(prevArticles).length} articles`)
	}
}

export default {
	getArticles
}