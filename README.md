# gatsby-source-freeindex

```
npm i gatsby-source-freeindex
```

```
yarn add gatsby-source-freeindex
```

Want to show your Freeindex reviews in your Gatsby application? Then this is the package for you.

Install this package, and add `'gatsby-source-freeindex'` to your plugins array in `gatsby-config.js`. 

You must have a variable in your `.env` file called `YELL_BUSINESS_ID`. You can find this by visiting your page on Freeindex [here](https://www.freeindex.co.uk/profile(rapid-formations-limited)_552249.htm). Your Business ID will then be `8353622`.

Once you have added the environment variable above, you can run `gatsby develop`. Proceed to the GraphQL interface e.g. `localhost:3000/___graphql`.

You can then run the following query to fetch all your Freeindex reviews.

```
{
  allYellReview {
    edges {
      node {
        id
        author
        title
        content
        score
        createdAt
      }
    }
  }
}
```

Note: Only the last 10 reviews will be fetched due to how Freeindex split reviews across pages. This will be addressed in a future update.