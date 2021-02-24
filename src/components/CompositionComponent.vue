<template>
  <div class="q-pa-md" style="width:800px">

    <div class="row">
      <div class="col-12" >
         <q-card class="my-card">
          <q-card-section class="bg-green text-white">
            <div>Ajouter un TODO</div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="center">
            <q-input rounded outlined label="Nouvelle tâche" v-model="newTodo"/>
            <q-btn round color="primary" icon="playlist_add" size="18px" class="addTask" @click="addTodo"/>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col-xs-12 col-sm-6">
            <q-card class="list-card">
              <q-card-section class="bg-warning text-white">
                <div>Tâches à faire</div>
              </q-card-section>

              <q-card-actions vertical align="left" v-for="todo in todos['todos']" :key="todo.id">
                <q-item tag="label" v-ripple>
                  <q-item-section side top>
                    <q-checkbox v-model="is_done" @click="moveToDone(todo.id)"/>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ todo.title }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-actions>
            </q-card>
      </div>
       <div class="col-xs-12 col-sm-6">
        <q-card class="list-card">
          <q-card-section class="bg-info text-white">
            <div>Tâches effectuées</div>
          </q-card-section>

          <q-card-actions vertical align="left" v-for="done in doneTasks['todos']" :key="done.id">
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-checkbox v-model="is_done" @click="moveToTodo(done.id)"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ done.title }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat style="color:red" size="12px" icon="close" @click="removeTask(done.id)"/>
              </q-item-section>
            </q-item>

          </q-card-actions>
        </q-card>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
} from 'vue';
import gql from 'graphql-tag';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { WebSocketLink } from "@apollo/client/link/ws";

export default defineComponent({
  name: 'CompositionComponent',
  setup() {
    const getHeaders = () => {4
      const token = "g2IQZ2lafEMojiTdcmvnCyDCR076Y4mhAvrDq0aYVGttflijCgK2IuXMJASdXXnD";
      const headers = {
        'x-hasura-admin-secret': `${token}`
      };
      return headers;
    };

    const wsLink = new WebSocketLink({
      uri: 'wss://quasarv2-apollo.hasura.app/v1/graphql',
      options: {
        reconnect: true,
        timeout: 30000,
        connectionParams: () => {
          return { headers: getHeaders() };
        },
      }
    });

    const cache = new InMemoryCache()
    const apolloClient = new ApolloClient({
      link: wsLink,
      cache,
    })
    const GET_ALL_INCOMPLETE_TODOS = gql`
      query MyQuery {
        todos(where: {is_done: {_eq: false}}) {
          id
          title
          is_done
        }
      }
    `
    const GET_ALL_COMPLETE_TODOS = gql`
      query MyQuery {
        todos(where: {is_done: {_eq: true}}) {
          id
          title
          is_done
        }
      }
    `

    const ADD_NEW_TODO = gql`
      mutation TodoCreation($title: String!) {
        insert_todos_one(object: {title: $title}) {
          id
        }
      }
    `

    const REMOVE_TODO = gql`
      mutation TodoRemoval($id: Int!) {
        delete_todos_by_pk(id: $id) {
          id
        }
      }
    `

    const CHANGE_TODO_TO_DONE = gql`
      mutation TodoToDone($id: Int!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {is_done: true}) {
          id
        }
      }
    `

    const CHANGE_DONE_TO_TODO = gql`
      mutation DoneToTodo($id: Int!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {is_done: false}) {
          id
        }
      }
    `
    const is_done = false
    let newTodo = ref('')
    let todos = ref([])
    let doneTasks = ref([])
    listTodo()
    function listTodo() {
      apolloClient.query({
        query: GET_ALL_INCOMPLETE_TODOS}).then((res) => {
          todos.value = res.data;
        console.log(todos.value)
      })
      apolloClient.query({
        query: GET_ALL_COMPLETE_TODOS}).then((res) => {
          doneTasks.value = res.data;
        console.log(doneTasks.value)
      })
    }
    
    function addTodo () {
      apolloClient.mutate({
      mutation: ADD_NEW_TODO,
      variables: { "title": newTodo.value },
      refetchQueries: [
        { query: GET_ALL_INCOMPLETE_TODOS }
      ],
      update: () => {
        listTodo()
      }})
      newTodo.value = ''
    }

    function moveToDone (id) {
      apolloClient.mutate({
      mutation: CHANGE_TODO_TO_DONE,
      variables: { "id": id },
      refetchQueries: [
        { query: GET_ALL_INCOMPLETE_TODOS },
        { query: GET_ALL_COMPLETE_TODOS }
      ],
      update: () => {
        listTodo()
      }})
    }

    function moveToTodo (id) {
      apolloClient.mutate({
      mutation: CHANGE_DONE_TO_TODO,
      variables: { "id": id },
      refetchQueries: [
        { query: GET_ALL_INCOMPLETE_TODOS },
        { query: GET_ALL_COMPLETE_TODOS }
      ],
      update: () => {
        listTodo()
      }})
    }

    function removeTask (id) {
      apolloClient.mutate({
      mutation: REMOVE_TODO,
      variables: { "id": id },
      update: (cache, { data: { delete_todos_by_pk } }) => {
           let data: any;
           data = cache.readQuery({
             query: GET_ALL_COMPLETE_TODOS,
           });
           console.log('this is', data);
           data.todos = data.todos.filter((todo) => todo.is_done !== true);
           cache.writeQuery({
             query: GET_ALL_COMPLETE_TODOS,
             data
           });
        },})
    }

    return { 
      newTodo,
      todos,
      doneTasks,
      moveToDone,
      moveToTodo,
      addTodo,
      removeTask,
      is_done,
    };
  },
});
</script>
<style lang="sass" scoped>
.addTask
  margin-left: 15px
.list-card
  height: 300px
</style>
