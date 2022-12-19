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
                <div key={id} className={styles.articlePreview}>
                  <Link href={`/blog/${id}`}>
                    <h3 className={styles.title}>{title}</h3>
                    <span className={styles.subtitle}>{formatDate(date)}</span>
                    <p>{description}</p>
                    <span>Читать</span>
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
                  </Link>
                </div>
              );
            })
          : 'Что-то пошло не так'}
      </div>
      <div className={styles.tagsContainer}>
        <h2>Категории</h2>
        {tags.length
          ? tags.map((tag) => {
              return (
                <Link key={tag} className={styles.tag} href={`/blog?tag=${tag}`}>
                  {tag}
                </Link>
              );
            })
          : 'Пока нет категорий'}
      </div>
    </div>
  );
};

export default Dashboard;
