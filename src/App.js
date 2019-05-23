import React from 'react';
import moment from 'moment';

import articles from './data/articles';
import sources from './data/sources';

import { getArticles } from './scrape/scrape';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			headlinesList: this.getSortedHeadlines(),
			end: 30
		}
		this.getSortedHeadlines = this.getSortedHeadlines.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
	}
	componentDidMount() {
		this.getSortedHeadlines();

		window.addEventListener('scroll', this.handleScroll);

		// use to scape for new articles
		//getArticles();
	}
	componentWillUnmount(){
		window.removeEventListener('scroll');
	}
	getSortedHeadlines() {
		return Object.keys(articles).sort((a,b) => {
			if (moment(articles[a].earliestDate).isAfter(moment(articles[b].earliestDate))) {
				return -1;
			}
			return 1;
		})
	}
	handleScroll(e) {
		const {
			end,
			headlinesList
		} = this.state;

		if ((window.innerHeight + window.scrollY) > document.body.scrollHeight - 300 && end < headlinesList.length) {
			this.setState({
				end: end + 30
			})
		}
	}
	render() {
		const {
			end,
			headlinesList
		} = this.state;
		let article;

		return (
			<div className='app'>
				<header>
					<h1>
						{"Amanda O'Donnell"}
					</h1>
					<h2>
						{headlinesList.length} articles
					</h2>
					<a href='https://twitter.com/amandamodo' target='_blank'>
						@amandamodo
					</a>
				</header>
				<div className='content'>
					<ul>
						{headlinesList.slice(0, end).map((key,i) => {
							article = articles[key];
							return (
								<li key={i}>
									<div className='article-content'>
										<h2>
											{article.title}
										</h2>
										<h3>
											{moment(article.earliestDate).format('LL')}
										</h3>
										{article.articles.length > 1 ?
											<h3>
												shared by {article.articles.length} media outlets
											</h3>
											:
											null
										}
										<p>
											<a href={article.source.href} aria-label={`Read ${article.title}`} target='_blank'>
												{article.source.host}
											</a>
										</p>
										<p>
											{article.text}
										</p>
									</div>
								</li>
							)
						})}
					</ul>
				</div>
			</div>
		)
	}
}

export default App;