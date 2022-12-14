import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

import { formatDate } from '../utils';

import styles from './article.module.scss';

const Article = ({ article }) => {
  const { title, date, content } = article;

  return (
    <article className={styles.container}>
      <h1>{title}</h1>
      <span className={styles.subtitle}>{formatDate(date)}</span>
      <div
        className={styles.contentContainer}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};

export default Article;
