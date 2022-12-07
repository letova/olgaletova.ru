import Head from 'next/head';
import Link from 'next/link';

const HomePage = () => {
  // const router = useRouter();
  // const currentRoute = router.pathname;

  return (
    <>
      <Head>
        <title>Olga Letova</title>
      </Head>
      <div>
        <nav>
          <div>
            <Link href="/">Olga Letova</Link>
          </div>
          <ul>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>
        Home page
      </div>
    </>
  );
};

export default HomePage;
