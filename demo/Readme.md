
To run this demo you __need__ to start a special development server. To do that all you need to do is run the following commands:

```bash
npm install -g packin
make
```

This server just rebuilds the project when requested over http meaning you only need to refresh your browser after making changes. The underlying build tool is similar to browserify.

### windows

Unless however your on windows in which case your best hope is to run:

```bash
npm install -g packin
npm install -g jkroso/serve
packin install -e --folder node_modules --meta deps.json,component.json,package.json
serve
```

### component

Because I'm a fan of the component community (just not component(1) itself) I've also included "./demo/component.html" which works using normal component tooling. To run that:

```bash
component install
component build
open ./demo/component.html
```
