const fetch = require('node-fetch');
const cheerio = require('cheerio');
const moment = require('moment');

const getScoreFromText = (title) => {
  return title.replace('Average rating of ', '').replace('.0', '');
}

const formatDate = (date) => {
  return moment(date, "D MMM YYYY");
}

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, { businessId }) => {
  const { createNode } = actions;

  if (!businessId || typeof businessId !== 'string') {
    throw new Error("You must supply a valid identifier from freeindex e.g. '(company-name)_432439'");
  }

  const url = `https://www.freeindex.co.uk/profile${businessId}.htm`;
  
  return fetch(url)
  .then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body);
    let reviews = [];

    $('#reviews-container .reviewrow').each(function () {
      let review = {
        id: '',
        author: '',
        content: '',
        score: '',
        createdAt: '',
      };
      review.id = $(this).attr('id');
      review.author = $(this).find('.reviewPic .user_image').attr('title');
      review.content = $(this).find('blockquote').text().split('<span>')[0];
      review.score = getScoreFromText($(this).find('.ratinglarge').attr('title'));
      review.createdAt = formatDate($(this).find('.reviewTopLine .pull-left.grey.small').text().split('</span>')[1]);

      reviews.push(review);
    });

    reviews.forEach(datum => {
      const nodeContent = JSON.stringify(datum);
      const nodeMeta = {
        id: createNodeId(`freeindex-review-${datum.author.split(' ')[0]}`),
        parent: null,
        children: [],
        internal: {
          type: `FreeindexReview`,
          content: nodeContent,
          contentDigest: createContentDigest(datum)
        }
      };
      const node = Object.assign({}, datum, nodeMeta);
      createNode(node);
    });

    return;
  });
};
