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
            <q-input  v-on:keyup.enter="addTodo" rounded outlined label="Nouvelle tâche" v-model="newTodo"/>
            <q-btn round color="primary" icon="playlist_add" size="18px" class="addTask" @click="addTodo"/>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col-xs-12 col-sm-6">
            <q-card class="list-card" style="height: 300px;">
              <q-card-section class="bg-warning text-white">
                <div>Tâches à faire</div>
              </q-card-section>

              <q-scroll-area style="height: 240px;">
                <q-card-actions vertical align="left" v-for="todo in todos" :key="todo.id" >
                  <q-item tag="label" v-ripple>

                    <q-item-section side>
                      <q-btn flat size="16px" icon="crop_square" @click="moveToDone(todo.id)"/>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ todo.title }}</q-item-label>
                    </q-item-section>

                  </q-item>
                </q-card-actions>
              </q-scroll-area>
            </q-card>
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-card class="list-card" style="height: 300px;">
          <q-card-section class="bg-info text-white">
            <div>Tâches effectuées</div>
          </q-card-section>

          <q-scroll-area style="height: 240px;">
            <q-card-actions vertical align="left" v-for="done in doneTasks" :key="done.id">
              <q-item tag="label" v-ripple>

                <q-item-section side>
                  <q-btn flat color="green" size="14px" icon="check_box" @click="moveToTodo(done.id)"/>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ done.title }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat style="color:red" size="12px" icon="close" @click="removeTask(done.id)"/>
                </q-item-section>
              </q-item>

            </q-card-actions>
          </q-scroll-area>
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
    const getHeaders = () => {
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
          title
          is_done
        }
      }
    `

    const REMOVE_TODO = gql`
      mutation TodoRemoval($id: Int!) {
        delete_todos_by_pk(id: $id) {
          id
          title
          is_done
        }
      }
    `

    const CHANGE_TODO_TO_DONE = gql`
      mutation TodoToDone($id: Int!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {is_done: true}) {
          id
          title
          is_done
        }
      }
    `

    const CHANGE_DONE_TO_TODO = gql`
      mutation DoneToTodo($id: Int!) {
        update_todos_by_pk(pk_columns: {id: $id}, _set: {is_done: false}) {
          id
          title
          is_done
        }
      }
    `
    const newTodo = ref('')
    const todos : any = ref([])
    const doneTasks : any = ref([])

    listTodo()
    function listTodo() {
      apolloClient.query({
        query: GET_ALL_INCOMPLETE_TODOS}).then((res) => {
          todos.value = res.data['todos'];
      })
      apolloClient.query({
        query: GET_ALL_COMPLETE_TODOS}).then((res) => {
          doneTasks.value = res.data['todos'];
      })
    }
    
    function addTodo () {
      apolloClient.mutate({
      mutation: ADD_NEW_TODO,
      variables: { "title": newTodo.value },
      refetchQueries: [
        { query: GET_ALL_INCOMPLETE_TODOS }
      ],}).then((res) => { 
        const addedTodo = {id: res.data['insert_todos_one']['id'], title: res.data['insert_todos_one']['title'], is_done: res.data['insert_todos_one']['is_done']}
        todos.value = todos.value.concat(addedTodo)
        })
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
      }).then((res) => { 
        const movedTodo = {id: res.data['update_todos_by_pk']['id'], title: res.data['update_todos_by_pk']['title'], is_done: res.data['update_todos_by_pk']['is_done']}
        doneTasks.value = doneTasks.value.concat(movedTodo)
        todos.value = todos.value.filter(function(item) {
            return item.id !== res.data['update_todos_by_pk']['id']
        })
      })
    }

    function moveToTodo (id) {
      apolloClient.mutate({
      mutation: CHANGE_DONE_TO_TODO,
      variables: { "id": id },
      refetchQueries: [
        { query: GET_ALL_INCOMPLETE_TODOS },
        { query: GET_ALL_COMPLETE_TODOS }
      ],
      }).then((res) => { 
        const movedDone = {id: res.data['update_todos_by_pk']['id'], title: res.data['update_todos_by_pk']['title'], is_done: res.data['update_todos_by_pk']['is_done']}
        todos.value = todos.value.concat(movedDone)
        doneTasks.value = doneTasks.value.filter(function(item) {
            return item.id !== res.data['update_todos_by_pk']['id']
        })
      })
    }

    function removeTask (id) {
      apolloClient.mutate({
      mutation: REMOVE_TODO,
      variables: { "id": id },
      }).then((res) => { 
        doneTasks.value = doneTasks.value.filter(function(item) {
            return item.id !== res.data['delete_todos_by_pk']['id']
        })
      })
    }

    return { 
      newTodo,
      todos,
      doneTasks,
      moveToDone,
      moveToTodo,
      addTodo,
      removeTask,
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
