import Layout from '../../components/layout';

import { getArticleIds, getBlogArticle } from '../../lib';

const Article = ({ article }) => {
  return (
    <Layout>
      {article.title}
      <br />
      {article.id}
      <br />
      {article.date}
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
  const article = getBlogArticle(params.id);

  return {
    props: {
      article,
    },
  };
}

export default Article;
