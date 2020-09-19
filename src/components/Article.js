import React from 'react';
import moment from 'moment';

export default (props) => {
    const article = props.article;
    
    return (
        <div className='article'>
            <div className='article-content'>
                <h3>
                    {moment(article.earliestDate).format('LL')}
                </h3>
                <h2>
                    {article.title}
                </h2>
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
            {article.image &&
                <div className='article-image'>
                    <img src={article.image} alt={`Image for ${article.title}`} rel="nofollow noopener" />
                </div>
            }
        </div>
    )
}