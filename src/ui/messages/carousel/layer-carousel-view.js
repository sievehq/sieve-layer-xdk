/**
 * UI for a Carousel Message.
 *
 * @class Layer.UI.messages.CarouselView
 * @mixin Layer.UI.messages.MessageViewMixin
 * @extends Layer.UI.components.Component
 */
import { registerComponent } from '../../components/component';
import { animatedScrollLeftTo } from '../../base';
import MessageViewMixin from '../message-view-mixin';
import Throttler from '../../mixins/throttler';
import Clickable from '../../mixins/clickable';

registerComponent('layer-carousel-view', {
  template: `
    <span layer-id='prev' class="layer-next-icon layer-previous-icon" ></span>
    <div class="layer-carousel-view-items" layer-id="items"></div>
    <span layer-id='next' class="layer-next-icon" ></span>
  `,
  style: `
  layer-carousel-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    max-width: 100%;
    position: relative;
  }
  layer-carousel-view .layer-next-icon {
    display: inline-block;
    z-index: 10;
    position: absolute;
    cursor: pointer;
  }

  layer-carousel-view.layer-carousel-end .layer-next-icon:not(.layer-previous-icon) {
    display: none;
  }
  layer-carousel-view.layer-carousel-start .layer-previous-icon {
    display: none;
  }
  .layer-carousel-view-items {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow-x: hidden;
  }
  .layer-carousel-view-items:after {
    content: "";
    flex: 0 0 5px;
  }
  `,

  mixins: [MessageViewMixin, Throttler, Clickable],

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {

    /**
     * Use a Titled Display Container to render this UI if there is a title; not supported on mobile devices
     *
     * @experimental
     * @property {String} [messageViewContainerTagName=layer-titled-display-container]
     */
    messageViewContainerTagName: {
      noGetterFromSetter: true,
      get() {
        return this.model.title ? 'layer-titled-display-container' : null;
      },
    },

    // See parent class
    widthType: {
      value: 'flex-width',
    },
  },
  methods: {

    /**
     * @experimental
     */
    _getIconClass() {
      return '';
    },

    /**
     * @experimental
     */
    _getTitle() {
      return this.model.title;
    },

    onDestroy() {
      window.removeEventListener('resize', this.properties.onResize);
    },

    /**
     * On creating this component, wire up all the event handlers and initial property values.
     *
     * * Wire up click-next/click-prev buttons for scrolling through carousel items.
     * * Wire up touch events for touch scrolling the carousel
     * * Wire up the window.resize event to resize the carousel
     *
     * @method onCreate
     */
    onCreate() {
      this.addClickHandler('click-next', this.nodes.next, this._scroll.bind(this, true));
      this.addClickHandler('click-prev', this.nodes.prev, this._scroll.bind(this, false));
      this.properties.startX = this.properties.startY = null;
      this.properties.touching = false;
      this.properties.dx = 0;
      this.addEventListener('touchstart', this.touchstart.bind(this));
      this.addEventListener('touchend', this.touchend.bind(this));
      this.addEventListener('touchmove', this.touchmove.bind(this));

      this.properties.onResize = this._onResize.bind(this);
      window.addEventListener('resize', this.properties.onResize);
    },

    /**
     * Whenever there is a change of state in the model, or during intitializtion, rerender each carousel item.
     *
     * There are not currently any relevant states.
     *
     * @method onRerender
     */
    onRerender() {
      if (!this.properties._internalState.onAttachCalled) return;
      this._adjustCarouselWidth();

      // Cache all of the items so we can resuse them
      const itemUIs = Array.prototype.slice.call(this.nodes.items.childNodes);

      // Clear the DOM
      this.nodes.items.innerHTML = '';

      // Calculate a maximum allowed Carousel Item Width
      const maxCardWidth = this._getMaxMessageWidth();

      // Generate/reuse each Carousel Item
      this.model.items.forEach((item) => {
        let card;

        // See if we've already generated the Carousel Item UI and add it back into the DOM if so.
        for (let i = 0; i < itemUIs.length; i++) {
          if (itemUIs[i].model === item) {
            card = itemUIs[i];
            this.nodes.items.appendChild(card);
            break;
          }
        }

        // Generate the Carousel Item UI Component if not cached
        if (!card) {
          card = this.createElement('layer-message-viewer', {
            //message: this.model.message,
            //rootPart: item.part,
            model: item,
            parentNode: this.nodes.items,
          });
        }

        // Apply some appropiate widths based on the cards preferences and behaviors and our Maximum
        // Carousel Item Width calculated above.
        const preferedMinWidth = card.nodes.ui.preferredMinWidth;
        const preferedMaxWidth = Math.min(maxCardWidth, card.nodes.ui.preferredMaxWidth);
        switch (card.widthType) {
          case 'full-width':
            card.style.width = card.style.minWidth = preferedMaxWidth + 'px';
            break;
          case 'flex-width':
            if (preferedMaxWidth < preferedMinWidth) {
              card.style.maxWidth = card.style.minWidth = card.style.width = preferedMaxWidth + 'px';
            } else {
              card.style.maxWidth = card.style.minWidth = card.style.width = preferedMinWidth + 'px';
            }
            break;
        }
      });

      // Rerender the scroll buttons after rendering of the carousel has settled
      setTimeout(this._updateScrollButtons.bind(this), 10);
    },

    /**
     * After being added to the DOM structure (lifecycle method), rerender.
     *
     * Component gets key sizing information once its on the DOM.
     *
     * @method onAttach
     */
    onAttach: {
      mode: registerComponent.MODES.AFTER,
      value() {
        setTimeout(this._updateScrollButtons.bind(this), 10);
        this.onRerender();
      },
    },

    /**
     * Call Layer.UI.messages.CarouselView._adjustCarouselWidth any time the window resizes.
     *
     * @method _onResize
     * @private
     */
    _onResize() {
      this._throttler(() => this._adjustCarouselWidth());
    },

    /**
     * Any time the width changes (or might have changed) recalculate the Carousel's width.
     *
     * @method _adjustCarouselWidth
     * @private
     */
    _adjustCarouselWidth() {
      const parent = this.parentComponent.parentNode;
      if (!parent || !parent.clientWidth) return 0;
      const carouselWidth = parent.clientWidth ? Math.floor(parent.clientWidth - 2) : 0;
      if (carouselWidth) this.messageViewer.style.maxWidth = carouselWidth + 'px';
    },

    /**
     * Get the maximum allowed width for individual (generic) Carousel Items.
     *
     * Individual Carousel Items may have their own preferences, but they should not excede this value.
     *
     * @method _getMaxMessageWidth
     * @returns {Number}
     * @private
     */
    _getMaxMessageWidth() {
      const parent = this.parentComponent.parentNode;
      if (!parent || !parent.clientWidth) return 350;
      let width = parent.clientWidth;
      if (width > 600) width = width * 0.6;
      else width = width * 0.8;
      return Math.floor(width);
    },

    /**
     * Update whether the Scroll Back and Scroll Forwards buttons are visible.
     *
     * Bases decision on available width, and current scroll state.
     *
     * @method _updateScrollButtons
     * @private
     */
    _updateScrollButtons() {
      const root = this.nodes.items;
      if (!root.childNodes.length) return;
      this.toggleClass('layer-carousel-start', root.scrollLeft <= root.firstElementChild.offsetLeft);

      const lastVisible = this._findLastFullyVisibleItem() || this._findFirstPartiallyVisibleItem();
      const children = this.nodes.items.childNodes;
      this.toggleClass('layer-carousel-end', lastVisible === children[children.length - 1]);
    },

    /**
     * Scroll to the next/previous set of carousel items in response to clicking the next/prev buttons.
     *
     * @param {Boolean} isForward     Scroll to the end of the carousel-items (true) or start of the carousel-items (false)
     * @param {Event} evt
     * @private
     */
    _scroll(isForward, evt) {
      evt.preventDefault();
      evt.stopPropagation();
      const root = this.nodes.items;
      const nodes = root.childNodes;
      const currentScroll = root.scrollLeft;

      if (isForward) {
        const lastVisible = this._findLastFullyVisibleItem() || this._findFirstPartiallyVisibleItem();
        const lastVisibleIndex = Array.prototype.indexOf.call(root.childNodes, lastVisible);
        if (lastVisible && lastVisibleIndex !== -1 && lastVisibleIndex < root.childNodes.length - 1) {
          const scrollToNode = nodes[lastVisibleIndex + 1];
          const scrollTo = scrollToNode.offsetLeft;
          animatedScrollLeftTo(root, scrollTo, 200, this._updateScrollButtons.bind(this));
          this.classList.remove('layer-carousel-start');
        }
      } else {
        this.classList.remove('layer-carousel-end');
        const firstVisible = this._findFirstFullyVisibleItem();
        const firstVisibleIndex = Array.prototype.indexOf.call(nodes, firstVisible);

        // If we aren't already at the left most item, process the scroll request
        if (firstVisibleIndex > 0) {

          // Starting with one item left of the first fully visible item, look for the right amont to scroll
          const rightMostCard = nodes[firstVisibleIndex - 1];
          const minScrollLeft = rightMostCard.offsetLeft - root.clientWidth + rightMostCard.clientWidth + 10;
          let found = false;
          for (let i = 0; i <= firstVisibleIndex - 1; i++) {
            const node = nodes[i];
            const scrollTo = node.offsetLeft;
            if (scrollTo > minScrollLeft) {
              animatedScrollLeftTo(root, scrollTo, 200, this._updateScrollButtons.bind(this));
              this.toggleClass('layer-carousel-start', scrollTo <= nodes[0].offsetLeft);
              found = true;
              break;
            }
          }
          if (!found) {
            const scrollTo = nodes[firstVisibleIndex - 1].offsetLeft;
            animatedScrollLeftTo(root, scrollTo, 200, this._updateScrollButtons.bind(this));
            this.toggleClass('layer-carousel-start', scrollTo <= nodes[0].offsetLeft);
            found = true;
          }
        }
      }
    },

    _findLastFullyVisibleItem(optionalScroll) {
      const root = this.nodes.items;
      if (!optionalScroll) optionalScroll = root.scrollLeft;
      const nodes = root.childNodes;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if ((node.offsetLeft + node.clientWidth) <= (root.offsetLeft + root.clientWidth + optionalScroll) &&
            node.offsetLeft >= root.offsetLeft + optionalScroll) return node;
      }
    },

    _findFirstFullyVisibleItem() {
      const root = this.nodes.items;
      const nodes = root.childNodes;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.offsetLeft >= root.offsetLeft + root.scrollLeft) return node;
      }
    },

    _findFirstPartiallyVisibleItem() {
      const root = this.nodes.items;
      const nodes = root.childNodes;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.offsetLeft + node.clientWidth >= root.offsetLeft + root.scrollLeft) return node;
      }
    },

    touchstart(evt) {
      this.properties.touching = true;
      const touch = evt.touches ? evt.touches[0] : evt;
      this.properties.dx = 0;
      this.properties.startScrollX = this.nodes.items.scrollLeft;
      this.properties.startX = touch.pageX;
      this.properties.startY = touch.pageY;
      //this.width = this.$element.width()
    },

    touchmove(evt) {
      if (!this.properties.touching) return;
      const touch = evt.touches ? evt.touches[0] : evt;
      const dx = touch.pageX - this.properties.startX;
      const dy = touch.pageY - this.properties.startY;
      if (Math.abs(dx) < Math.abs(dy)) return; // vertical scroll

      evt.preventDefault(); // prevent vertical scroll

      const scrollLeft = -dx;
      this.nodes.items.scrollLeft = this.properties.startScrollX + scrollLeft;
      if (document.activeElement.tagName === 'TEXTAREA') document.activeElement.blur();
    },

    touchend(evt) {
      if (!this.properties.touching) return;
      const root = this.nodes.items;

      const touch = evt.changedTouches ? evt.changedTouches[0] : evt;

      // If finger ended on a larger X than it started, then it moved right
      // If finger moved right, we are decreasing our scrollLeft value
      const fingerDirection = touch.pageX - this.properties.startX > 0 ? 'right' : 'left';

      const firstPartialCard = this._findFirstPartiallyVisibleItem();
      const cardWidth = firstPartialCard.clientWidth;
      const visibleItemWidth = firstPartialCard.offsetLeft + firstPartialCard.clientWidth - root.scrollLeft;
      const percentShown = visibleItemWidth / cardWidth;
      const distanceToEnd = root.scrollWidth - root.scrollLeft - root.clientWidth;
      const percentDistanceToEnd = distanceToEnd / cardWidth;

      if (fingerDirection === 'left') {
        if (percentDistanceToEnd < 0.6) {
          animatedScrollLeftTo(root, root.lastChild.offsetLeft, 200, this._updateScrollButtons.bind(this));
        } else if (percentShown > 0.6) {
          animatedScrollLeftTo(root, firstPartialCard.offsetLeft, 200, this._updateScrollButtons.bind(this));
        } else {
          animatedScrollLeftTo(root, firstPartialCard.nextElementSibling.offsetLeft, 200, this._updateScrollButtons.bind(this));
        }
      } else {
        if (percentDistanceToEnd < 0.4) {
          animatedScrollLeftTo(root, root.lastChild.offsetLeft, 200, this._updateScrollButtons.bind(this));
        } else if (percentShown < 0.4) {
          animatedScrollLeftTo(root, firstPartialCard.nextElementSibling.offsetLeft, 200, this._updateScrollButtons.bind(this));
        } else {
          animatedScrollLeftTo(root, firstPartialCard.offsetLeft, 200, this._updateScrollButtons.bind(this));
        }
      }
      this.properties.touching = false;
    },
  },
});
