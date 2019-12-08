exports.onCreatePage = ({ page, actions }) => {
  if (page.path.match(/^\/account/)) {
    page.matchPath = '/account/*';
    actions.createPage(page);
  }
};

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /auth0-js/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
};
