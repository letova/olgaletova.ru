import Head from 'next/head';
import Link from 'next/link';

import Layout from '../components/layout';

import { formatDate } from '../utils';
import { getBlogArticles } from '../lib';

import styles from '../styles/blog.module.scss';

const BlogPage = ({ articles }) => {
  return (
    <Layout>
      <Head>
        <title>Blog</title>
      </Head>
      <div className={styles.cardsContainer}>
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
