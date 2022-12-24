import clsx from 'clsx';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

import Layout from '../components/layout';
import ArticlePreview from '../components/articlePreview';

import { getUniqTags } from '../utils';
import { getBlogArticles } from '../server';

import styles from '../styles/blog.module.scss';

const BlogPage = ({ articles }) => {
  const router = useRouter();
  const { query } = router;

  const [searchValue, setSearchValue] = useState(query.tag || '');

  const tags = getUniqTags(articles);

  let filteredArticles = articles;

  if (query.tag) {
    filteredArticles = articles.filter(({ tag }) => {
      return tag === query.tag;
    });
  }

  return (
    <Layout>
      <Head>
        <title>Blog</title>
      </Head>
      <div className={styles.cardsContainer}>
        <div className={styles.searchContainer}>
          <input
            className={styles.search}
            placeholder={'Найти статьи'}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
        <div className={styles.tagsContainer}>
          {tags.length
            ? tags.map((tag) => {
                const isActive = tag === query.tag;

                return (
                  <Link
                    key={tag}
                    className={clsx(styles.tag, {
                      [styles['tag--active']]: isActive,
                    })}
                    href={isActive ? '/blog' : `/blog?tag=${tag}`}
                  >
                    {tag}
                  </Link>
                );
              })
            : 'Пока нет категорий'}
        </div>
        {filteredArticles?.map((article) => {
          return (
            <ArticlePreview
              className={styles.articlePreview}
              article={article}
            />
          );
        })}
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
