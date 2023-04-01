import {kebabCase} from 'shared-library/lib/utils/StringUtils';

const allPosts = require.context('!@mdx-js/loader!~/posts', true, /(\.mdx|\.md)$/, 'lazy');

type PostType = {
  /** The Date this post was created at. Posts follow the format "yyyy_mm_dd_PostTitle.md". */
  createdAt: Date,
  /** Returns a promise that will resolve to the component when resolved. */
  lazyComponent: () => Promise<() => JSX.Element>,
};

// TODO(acorn1010): Consider caching the responses for this.
export const POSTS: {[articleId: string]: PostType} =
    Object.fromEntries(
        allPosts.keys()
            .filter(path => path.startsWith('./'))
            .map(path => {
              const lastUnderscore = path.lastIndexOf('_');
              const [yyyy, mm, dd] = path.slice('./'.length, lastUnderscore).split('_');
              // The date this post was made. If undefined, arbitrarily starts at the Unix timestamp.
              if (yyyy.length !== 4 || !mm || !dd || +mm > 12 || +mm < 1 || +dd < 1 || +dd > 31) {
                console.error(`Post has unknown date format: "${path}"`);
              }
              const createdAt = new Date(Date.UTC(+(yyyy || 1970), +(mm || 1) - 1, +(dd || 1)));
              const slug = kebabCase(path.slice(lastUnderscore + 1, path.lastIndexOf('.') - path.length));

              // noinspection JSUnusedGlobalSymbols This is used in PostPage.tsx.
              return [
                slug,
                {createdAt, lazyComponent: () => allPosts(path).then((module: any) => module.default)},
              ];
            }));
