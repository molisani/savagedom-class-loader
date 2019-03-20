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

function parseQuery(query) {
  if (!query) {
    return {};
  }
  return JSON.parse(`{"${decodeURI(query.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')}"}`);
}

module.exports = function(source) {
  const resolve = this.async();

  const options = parseQuery(this.resourceQuery);
  options.x = options.x || 0;
  options.y = options.y || 0;

  svgo.optimize(source).then((min) => {
    resolve(null, `\
const parser = new DOMParser();
const xmlDocument = parser.parseFromString(${JSON.stringify(min.data)}, "image/svg+xml");
module.exports = class extends SavageDOM.Elements.Renderables.Component {
  constructor() {
    super({ x: ${options.x}, y: ${options.y} });
    this.injectDocument(xmlDocument);
  }
}`);
  });
};
