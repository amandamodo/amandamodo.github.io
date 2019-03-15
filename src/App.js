import React from 'react';
import $ from 'jquery';
import moment from 'moment';

const corsProxy = 'https://crossproxy.me/';
const muckRack = 'https://muckrack.com/amanda-odonnell/articles';
const articles = {};
const sources = {};
const duplicates = {};

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			articles: {},
			headlinesList: [],
			sources: {},
			end: 50
		}

		this.setArticles = this.setArticles.bind(this);
	}
	componentDidMount() {
		this.setArticles();
	}
	setArticles() {
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
						source = article.find('a')[0];
						timestamp = article.find('.timeago').attr('title');

						if (title) {
							title = title.innerText.replace(/"/g, '')
						}
 
						if (!articles[title]) {
							articles[title] = {
								articles: []
							};
						}

						if (moment(timestamp).isBefore(articles[title].earliestDate) || !articles[title].earliestDate) {					
							body = article.find('.news-story-body');

							if (body[0]) {
								text = body[0].innerText.split('—')[1];
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

						let headlinesList = Object.keys(articles).sort((a,b) => {
							if (moment(articles[a].earliestDate).isAfter(moment(articles[b].earliestDate))) {
								return -1;
							}
							return 1;
						})

						this.setState({
							articles: articles,
							sources: sources,
							headlinesList: headlinesList
						})
					}); 
				}
			})

			i += 1;
		} while (i < 20)
	}
	render() {
		const {
			articles,
			end,
			headlinesList
		} = this.state;
		let article;
		return (
			<div className='app'>
				<h1>
					{"Amanda O'Donnell"}
				</h1>
				<a href='https://twitter.com/amandamodo' target='_blank'>
					@amandamodo
				</a>
				<ul>
					{headlinesList.slice(0, end).map((key,i) => {
						article = articles[key];
						return (
							<li key={i}>
								<h2>
									{article.title}
								</h2>
								<h3>
									{moment(article.earliestDate).format('LL')}
								</h3>
								<h3>
									shared by {article.articles.length} media {article.articles.length > 1 ? 'outlets' : 'outlet'}
								</h3>
								<a href={article.source.href} target='_blank'>
									{article.source.host}
								</a>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}

export default App;