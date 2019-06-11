import React from 'react';
import moment from 'moment';

import articles from './data/articles';
import sources from './data/sources';

import { getArticles } from './scrape/scrape';

class App extends React.Component {
	constructor(props) {
		super(props);

		const headlines = this.getSortedHeadlines();

		this.state = {
			allHeadlines: headlines,
			filteredHeadlines: JSON.parse(JSON.stringify(headlines)),
			end: 30,
		}

		this.getSortedHeadlines = this.getSortedHeadlines.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}
	componentDidMount() {
		this.getSortedHeadlines();

		window.addEventListener('scroll', this.handleScroll);

		// use to scape for new articles
		// getArticles();
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
			allHeadlines,
		} = this.state;

		if ((window.innerHeight + window.scrollY) > document.body.scrollHeight - 300 && end < allHeadlines.length) {
			this.setState({
				end: end + 30
			})
		}
	}

	handleSearch (e){
		const {
			allHeadlines,
		} = this.state;
		const input = e.target.value.trim();
		let filteredHeadlines = [];

		if (input.length > 0) {
			filteredHeadlines = allHeadlines.filter((headline) => {
				return headline.toLowerCase().indexOf(input) > -1;
			})
		} else {
			filteredHeadlines = JSON.parse(JSON.stringify(allHeadlines));
		}

		this.setState({
			filteredHeadlines: filteredHeadlines,
		})
	}

	render() {
		const {
			end,
			filteredHeadlines,
		} = this.state;
		let article;

		return (
			<div className='app'>
				<header>
					<h1>
						{"Amanda O'Donnell"}
					</h1>
					<h2>
						{filteredHeadlines.length} articles
					</h2>
					<a href='https://twitter.com/amandamodo' target='_blank'>
						@amandamodo
					</a>
					<div className='search'>
						<input type='text' placeholder='search' onChange={this.handleSearch} />
					</div>
				</header>
				<div className='content'>
					<ul>
						{filteredHeadlines.slice(0, end).map((key,i) => {
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