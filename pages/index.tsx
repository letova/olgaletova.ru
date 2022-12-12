import Head from 'next/head';

import Layout from '../components/layout';
import Dashboard from '../components/dashboard';

import { Article } from '../types';
import { getBlogArticles } from '../server';

interface HomePageProps {
  articles?: Article[];
}

const HomePage = ({ articles }: HomePageProps) => {
  const [lastArticle] = articles || [];

  const tags: string[] = articles.reduce((result, { tag }) => {
    return tag ? [...result, tag] : result;
  }, []);

  const uniqTags = tags.length ? Array.from(new Set(tags)) : [];

  return (
    <Layout>
      <Head>
        <title>Olga Letova</title>
      </Head>
      <Dashboard article={lastArticle} tags={uniqTags} />
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

export default HomePage;
