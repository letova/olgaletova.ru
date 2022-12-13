import Link from 'next/link';

import { Article } from '../types';
import { formatDate } from '../utils';

import styles from './dashboard.module.scss';

interface DashboardProps {
  articles?: Article[];
  tags?: string[];
}

const Dashboard = ({ articles, tags = [] }: DashboardProps) => {
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.header} />
        <h2>Недавно добавленное</h2>
        {articles
          ? articles.map((article) => {
              const { id, title, description, date } = article;

              return (
                <div className={styles.articlePreview}>
                  <h3 className={styles.title}>
                    <Link href={`/blog/${id}`}>{title}</Link>
                  </h3>
                  <span className={styles.subtitle}>{formatDate(date)}</span>
                  <p>{description}</p>
                  <Link href={`/blog/${id}`}>Читать</Link>
                  <svg
                    className={styles.arrow}
                    focusable="false"
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
                  </svg>
                </div>
              );
            })
          : 'Что-то пошло не так'}
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
