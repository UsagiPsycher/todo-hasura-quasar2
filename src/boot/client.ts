import { provide } from 'vue';
import { DefaultApolloClient, provideApolloClient } from '@vue/apollo-composable';
import { ApolloClient, createHttpLink, InMemoryCache, gql } from '@apollo/client/core';
export default {
  setup() {
    const GET_ALL_TODOS = gql`
      query MyQuery {
        todos {
          id
          title
        }
    `
    const httpLink = createHttpLink({
      uri: 'https://quasarv2-apollo.hasura.app/v1/graphql',
    })

    const cache = new InMemoryCache()

    const apolloClient = new ApolloClient({
      link: httpLink,
      cache,
    })
    provideApolloClient(apolloClient)
  }
}