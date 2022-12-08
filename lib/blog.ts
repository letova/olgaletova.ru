import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogPath = path.join(process.cwd(), 'content', 'blog');

const readFile = (name: string) => {
  const filePath = path.join(blogPath, name);

  return fs.readFileSync(filePath, 'utf8');
};

export const getBlogArticle = (slug: string) => {
  const fileContent = readFile(`${slug}.md`);
  const { data: metadata } = matter(fileContent);

  return {
    slug,
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
