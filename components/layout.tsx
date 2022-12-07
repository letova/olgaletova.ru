import Footer from './footer';
import Header from './header';

import styles from './layout.module.scss';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
