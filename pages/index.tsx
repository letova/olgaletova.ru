import Head from 'next/head';

import Layout from '../components/layout';
import Dashboard from '../components/dashboard';

import { Article } from '../types';
import { getUniqTags } from '../utils';
import { getBlogArticles } from '../server';

interface HomePageProps {
  articles?: Article[];
}

const HomePage = ({ articles }: HomePageProps) => {
  const lastArticles = (articles || []).slice(0, 3);

  const uniqTags = getUniqTags(articles);

  return (
    <Layout>
      <Head>
        <title>Olga Letova</title>
      </Head>
      <Dashboard articles={lastArticles} tags={uniqTags} />
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
