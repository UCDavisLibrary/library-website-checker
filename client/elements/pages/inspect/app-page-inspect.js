import { LitElement } from 'lit-element';
import render from "./app-page-inspect.tpl.js"

import "leaflet"

export default class AppPageInspect extends LitElement {

  static get properties() {
    return {
      loading : {type: Boolean},
      title : {type: String}
    }
  }

  constructor() {
    super();
    this.loading = false;
    this.render = render.bind(this);
  }

  _initViewer() {
    this.viewer = L.map(this.shadowRoot.querySelector('#viewer'), {
      crs: L.CRS.Simple,
      minZoom: -4,
      zoomControl : true
    });
  }

  async show(title, url) {
    this.title = title;
    if( !this.viewer ) this._initViewer();

    if( this.overlay ) {
      this.viewer.removeLayer(this.overlay);
      this.overlay = null;
    }

    this.url = url;
    await this._loadImage(url);
    if( url !== this.url ) return;

    this.overlay = L.imageOverlay(url, this.bounds).addTo(this.viewer);
    this.viewer.fitBounds(this.bounds);
  }

  _loadImage(url) {
    this.loading = true;

    return new Promise((resolve, reject) => {
      var img = new Image();
      img.onload = () => {
        let res = [img.naturalHeight, img.naturalWidth];
        this.bounds = [[0,0], res];
        this.loading = false;
        resolve();
      };
      img.src = url;
    });
  }

  _back() {
    this.dispatchEvent(new CustomEvent('back'));
  }

}

customElements.define('app-page-inspect', AppPageInspect);
