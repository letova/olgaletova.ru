import Article from '../../components/article';
import Layout from '../../components/layout';

import { getArticleIds, getBlogArticle } from '../../lib';

const ArticlePage = ({ article }) => {
  return (
    <Layout>
      <Article article={article} />
    </Layout>
  );
};

export async function getStaticPaths() {
  const paths = getArticleIds();

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const article = await getBlogArticle(params.id);

  return {
    props: {
      article,
    },
  };
}

export default ArticlePage;
