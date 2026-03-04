/* eslint-disable react-refresh/only-export-components */
import SeoContentPage from './SeoContentPage';
import {
  BLOG_ARTICLE_PATHS,
  BLOG_LEGACY_PATHS,
  BLOG_TOPIC_SLUGS,
  getBlogRouteInfo
} from '../seo/seoCatalog';

function BlogArticlePage({ routeInfo, theme = 'light' }) {
  return <SeoContentPage routeInfo={routeInfo} theme={theme} />;
}

export { BLOG_ARTICLE_PATHS, BLOG_LEGACY_PATHS, BLOG_TOPIC_SLUGS, getBlogRouteInfo };
export default BlogArticlePage;
