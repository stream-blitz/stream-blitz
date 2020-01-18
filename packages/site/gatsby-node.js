exports.onCreatePage = ({ page, actions }) => {
  if (page.path.match(/^\/account/)) {
    page.matchPath = '/account/*';
    actions.createPage(page);
  }
};
