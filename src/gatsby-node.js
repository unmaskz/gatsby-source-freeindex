const fetch = require('node-fetch');
const cheerio = require('cheerio');

const getScoreFromText = (title) => {
  return title.replace('Average rating of ', '').replace('.0', '');
}

const formatDate = (dateString) => {
  const dateArray = dateString.split(' ');
  return new Date(`${date[1]} ${date[0]}, ${date[2]}`).toISOString();
}

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, { businessId }) => {
  const { createNode } = actions;

  if (!businessId || typeof businessId !== 'string') {
    throw new Error("You must supply your unique business id from freeindex e.g. '432439'");
  }

  const url = `https://www.freeindex.co.uk/customscripts/ajax_reviews.asp?lid=${businessId}`;
  
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
      review.content = $(this).find('blockquote').text().replace('Moreexpand_more', '');
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
