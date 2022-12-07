import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './header.module.scss';

const Header = () => {
  const router = useRouter();
  const currentRoute = router.pathname;

  const getListItemClassName = (route: string) =>
    clsx(styles.navigationListItem, {
      [styles['navigationListItem--active']]: route === currentRoute,
    });

  return (
    <header className={styles.container}>
      <nav className={styles.navigation}>
        <Link href="/">
          <span className={styles.logo}>Olga Letova</span>
        </Link>
        <ul className={styles.navigationList}>
          <li className={getListItemClassName('/blog')}>
            <Link href="/blog">Блог</Link>
          </li>
          <li className={getListItemClassName('/about')}>
            <Link href="/about">Об авторе</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
