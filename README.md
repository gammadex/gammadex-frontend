# EtherGamma ReactJS Spike

## Running

```
npm install
npm run start
```


## Useful Links

### React

* https://reactjs.org/tutorial/tutorial.html
* https://reactjs.org/docs/state-and-lifecycle.html
* https://github.com/react-bootstrap-table/react-bootstrap-table2
* https://reactstrap.github.io/components

### React Testing

* *Running tests* https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests
* *Testing React components* https://facebook.github.io/jest/docs/en/tutorial-react.html
* *Available insertion functions*: https://facebook.github.io/jest/docs/en/expect.html#content

#### Running Test On Linux

You can get this error if too many files are being watched causing Linux barfs. 

```
fs.js:1445
    throw error;
```

The default test run script for apps created with create-react-app (like this one) tries to watch all files in the root directory, including .git and node_modules. 
There is a lower bound set for the number of files which can be watched on linux. One heavyweight solution is to bump the number of allowable watchers on your system.

System level workaround:

* https://github.com/facebook/jest/issues/3254
* https://github.com/amasad/sane/issues/104

### BootStrap

* https://bootstrapcreative.com/resources/bootstrap-4-css-classes-index/

### EtherDelta API

* https://github.com/etherdelta/etherdelta.github.io/blob/master/docs/API.md

## JS

* http://exploringjs.com/es6/ch_destructuring.html