import Link from 'next/link';

import { Article } from '../types';
import { formatDate } from '../utils';

import styles from './dashboard.module.scss';

interface DashboardProps {
  article?: Article;
  tags?: string[];
}

const Dashboard = ({ article, tags = [] }: DashboardProps) => {
  const { id, title, description, date } = article || {};

  return (
    <div className={styles.container}>
      <div className={styles.articlePreview}>
        <h2>Недавно добавленное</h2>
        {article ? (
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
            <span>{formatDate(date)}</span>
            <Link href={`/blog/${id}`}>Читать</Link>
          </div>
        ) : (
          'Что-то пошло не так'
        )}
      </div>
      <div className={styles.categories}>
        <h2>Категории</h2>
        {tags.length
          ? tags.map((tag) => {
              return <span className={styles.tag}>{tag}</span>;
            })
          : 'Пока нет категорий'}
      </div>
    </div>
  );
};

export default Dashboard;
