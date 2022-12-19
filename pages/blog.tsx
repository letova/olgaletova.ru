import clsx from 'clsx';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

import Layout from '../components/layout';

import { getBlogArticles } from '../server';
import { formatDate, getUniqTags } from '../utils';

import styles from '../styles/blog.module.scss';

const BlogPage = ({ articles }) => {
  const router = useRouter();
  const { query } = router;

  const [searchValue, setSearchValue] = useState('');

  const tags = getUniqTags(articles);

  return (
    <Layout>
      <Head>
        <title>Blog</title>
      </Head>
      <div className={styles.cardsContainer}>
        <div className={styles.searchContainer}>
          <input className={styles.search} placeholder={'Найти статьи'} />
        </div>
        <div className={styles.tagsContainer}>
          {tags.length
            ? tags.map((tag) => {
                const isActive = tag === query.tag;

                return (
                  <Link
                    key={tag}
                    className={clsx(styles.tag, { [styles['tag--active']]: isActive })}
                    href={isActive ? '/blog' : `/blog?tag=${tag}`}
                  >
                    {tag}
                  </Link>
                );
              })
            : 'Пока нет категорий'}
        </div>
        {articles?.map(({ id, date, title, description }) => (
          <div key={id} className={styles.card}>
            <h2>{title}</h2>
            <p>{description}</p>
            <span>{formatDate(date)}</span>
            <Link href={`/blog/${id}`}>Читать</Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  const articles = getBlogArticles();

  return {
    props: {
      articles,
    },
  };
}

export default BlogPage;
