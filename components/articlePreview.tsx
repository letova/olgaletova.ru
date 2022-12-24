import clsx from 'clsx';
import Link from 'next/link';

import { Article } from '../types';
import { formatDate } from '../utils';

import styles from './articlePreview.module.scss';

interface ArticlePreviewProps {
  className?: string;
  article?: Article;
}

const ArticlePreview = ({ className, article }: ArticlePreviewProps) => {
  const { id, title, date, description } = article;

  return (
    <div key={id} className={clsx(styles.container, className)}>
      <Link href={`/blog/${id}`}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.subtitle}>{formatDate(date)}</span>
        <p>{description}</p>
        <span>Читать</span>
        <div className={styles.arrow} />
      </Link>
    </div>
  );
};

export default ArticlePreview;
