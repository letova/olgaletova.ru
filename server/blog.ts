import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkPrism from 'remark-prism';

const blogPath = path.join(process.cwd(), 'content', 'blog');

const readFile = (name: string) => {
  const filePath = path.join(blogPath, name);

  return fs.readFileSync(filePath, 'utf8');
};

export const getBlogArticle = async (id: string) => {
  const fileContent = readFile(`${id}.md`);
  const { data: metadata, content } = matter(fileContent);

  const processedContent = await remark()
    .use(remarkPrism, { plugins: ['line-numbers'] })
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return {
    id,
    content: processedContent.toString(),
    ...metadata,
  };
};

export const getBlogArticles = () => {
  const fileNames = fs.readdirSync(blogPath);

  const articles = fileNames.map((fileName) => {
    const fileContent = readFile(fileName);
    const { data: metadata } = matter(fileContent);

    return {
      id: fileName.replace(/\.md$/, ''),
      ...metadata,
    };
  });

  return (articles as any).sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
};

export const getArticleIds = () => {
  const fileNames = fs.readdirSync(blogPath);

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    };
  });
};
