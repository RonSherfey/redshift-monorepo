# SDK Usage Sample - Vue

A sample application showcasing how the REDSHIFT SDK can be integrated into a Vue application

## Getting Started

**Warning:** This project exists for demo purposes only and should NOT be used on mainnet.

### Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn start
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Run your unit tests
```
yarn test:unit
```

## Folder Structure

    src/
    ├── api/           # Various API clients, which simplify communication with multiple backends
    ├── components/    # Vue components, including everything from a simple button to a page
    ├── filters/       # Filters used for text formatting and other transformations
    ├── scss/          # SCSS used to style the entire application
    ├── types/         # Typescript types and declaration files
    ├── main           # The entry point to the Vue application
    └── router         # The Vue Router, which enables multi-page navigation in the application

    public/
    └── index.html     # The applications's HTML entry point
