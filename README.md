# todo-app (todo-hasura-quasar2)

A simple TODO app using Quasar v2 (vue v3 composition API + typescript) with Hasura via Apollo

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

* Difficultés : 
- La version 4 de vue-apollo qui supporte vue 3 est encore un WIP, je l'ai essayé mais au final j'ai préféré ne pas du tout l'utiliser, j'ai utilisé directement @apollo/client à la place
- Je n'ai pas encore pu exploiter le cache pour rafraîchir les données affichées à la suite d'une requête, j'ai utilisé la réponse retournée par Hasura à la place
- La composition API est très différente de la forme classique avec les options data, mounted, methods, ...
- Sur TypeScript on a moins de liberté pour laisser le langage décider du type d'une variable. D'une manière générale, l'écriture de code TS prend plus de temps mais c'est bien plus clair.
- Les technologies sont très récentes et ça implique qu'il y a encore peu de issues signalés sur github et stackoverflow, certaines docs ne sont pas à jour et les package node ne sont pas encore tout à fait compatibles entre eux

* Avantages par rapport à avant :
- C'est beaucoup mieux structuré que sur la v2 de vue
- La requête subscription de GraphQL accélèrera la récupération de nouvelles entrées dans la BDD, et ça, je pense que Apollo le gère bien
- TypeScript permet d'écrire du code plus propre
- La composition api de la v3 est très pratique pour les projets avec de très nombreux components
