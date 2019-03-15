import React from 'react';
import moment from 'moment';

import articles from './data/articles';
import sources from './data/sources';

//import { getArticles } from './scrape/scrape';

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
		const d = document.documentElement;
		const offset = d.scrollTop + window.innerHeight;
		const height = d.offsetHeight;

		if (offset > height - 300 && this.state.end < this.state.headlinesList.length) {
			this.setState({
				end: this.state.end += 30
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
				<div className='content'>
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
									<p>
										{article.text}
									</p>
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