const SVGO = require("svgo");

const svgo = new SVGO({
  plugins: [
    { removeComments: true },
    { removeDoctype: true },
    { removeEmptyText: false },
    { removeHiddenElems: false },
    { convertPathData: true },
    { convertTransform: true },
    { cleanupIDs: false },
    { cleanupNumericValues: true },
  ],
  floatPrecision: 2,
});

module.exports = function(source) {
  const resolve = this.async();

  svgo.optimize(source).then((min) => {
    resolve(null, `\
const parser = new DOMParser();
const xmlDocument = parser.parseFromString(${JSON.stringify(min.data)}, "image/svg+xml");
const doc_p = SavageDOM.Context.contexts.take(1).toPromise().then((context) => {
  return new SavageDOM.SVGDocument(context, xmlDocument);
});
module.exports = class extends SavageDOM.Elements.Renderables.Component {
  constructor() {
    super({ x: 0, y: 0 });
    this.loaded = doc_p.then((doc) => {
      doc.children.forEach((child) => {
        const importedNode = this.context.window.document.importNode(child, true);
        this.add(importedNode);
      });
    });
  }
}`);
  });
};
