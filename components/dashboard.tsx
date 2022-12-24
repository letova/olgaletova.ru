import Link from 'next/link';

import { Article } from '../types';

import ArticlePreview from './articlePreview';

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
              return (
                <ArticlePreview
                  className={styles.articlePreview}
                  article={article}
                />
              );
            })
          : 'Что-то пошло не так'}
      </div>
      <div className={styles.tagsContainer}>
        <h2>Категории</h2>
        {tags.length
          ? tags.map((tag) => {
              return (
                <Link
                  key={tag}
                  className={styles.tag}
                  href={`/blog?tag=${tag}`}
                >
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
