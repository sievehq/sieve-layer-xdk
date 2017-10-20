/**
 * The Layer Replaceable Content widget allows for content to be inserted into widgets.
 *
 * TODO: Should be able to access mainComponent's originalChildNodes and find matching children
 *
 * @class layer.UI.components.ReplaceableContent
 * @extends layer.UI.components.Component
 */
import { registerComponent } from '../component';

registerComponent('layer-replaceable-content', {
  properties: {
    name: {},
  },
  methods: {
    _onProcessReplaceableContent() {
      if (!this.name) throw new Error('Unnamed replaceable content detected');

      let processed = false;
      const parents = [];
      let node = this;
      while (node.parentComponent) {
        node = node.parentComponent;
        parents.unshift(node);
      }
      const mainComponent = parents[0];

      // TODO: Check for HTML content ShadowDOM style in the top component and load it into this component
      for (let parentIndex = 0; parentIndex < parents.length; parentIndex++) {
        const parent = parents[parentIndex];
        const generator = parent.replaceableContent && parent.replaceableContent[this.name];
        if (generator) {
          this.loadContent(parent, generator);
          processed = true;
          break;
        }
      }

      if (!processed) {
        const originalNodes = mainComponent.properties.originalChildNodes || [];
        originalNodes.forEach((parentNode) => {
          if (processed) return;
          const name = parentNode.getAttribute('layer-replaceable-name') || parentNode.getAttribute('data-replaceable-name');
          if (name === this.name) {
            this.loadContent(mainComponent, parentNode);
            processed = true;
          } else {
            this._findNodesWithin(parentNode, (node, isComponent) => {
              if (processed) return;
              const name = node.getAttribute('layer-replaceable-name') || node.getAttribute('data-replaceable-name');
              if (name === this.name) {
                this.loadContent(mainComponent, node);
                processed = true;
              }
            });
          }
        });
      }


      if (!processed && this.properties.originalChildNodes) {
        this.properties.originalChildNodes.forEach(item => this.nodes.content.appendChild(item));
        delete this.properties.originalChildNodes;
        this._findNodesWithin(this, (node, isComponent) => {
          const layerId = node.getAttribute && node.getAttribute('layer-id');
          if (layerId) this.parentComponent.nodes[layerId] = node;

          if (isComponent) {
            if (!node.properties) node.properties = {};
            node.properties.parentComponent = this.parentComponent;
          }
        });
      }
    },
    loadContent(parent, generator) {
      let newNode;

      if (typeof generator === 'function') {
        const oldChild = this.nodes.content;
        this.removeChild(oldChild);
        newNode = generator.call(parent, this.parentComponent, this);
        if (!newNode) this.appendChild(oldChild); // lame... but handles case where callback returns null
      } else {
        newNode = generator;
      }

      if (newNode) {
        const alreadyInWidget = this.contains(newNode);

        // React only works well if React inserts the node itself (event handlers such as <div onclick={handler} /> get lost otherwise)
        if (!alreadyInWidget && (newNode.tagName !== 'DIV' || !newNode.firstChild)) {
          const tmpNode = document.createElement('div');
          tmpNode.appendChild(newNode);
          newNode = tmpNode;
        }

        if (!newNode.classList.contains('layer-replaceable-inner')) newNode.classList.add('layer-replaceable-inner');
        this.nodes.content = newNode;
        if (!alreadyInWidget) {
          this.appendChild(newNode);
        }
        this.parentComponent.onReplaceableContentAdded(this.name, newNode);
      }
    },
  },
});

