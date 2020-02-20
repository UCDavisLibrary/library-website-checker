import { LitElement } from 'lit-element';
import render from "./library-site-checker.tpl.js"

import "@polymer/iron-pages"

import "./pages/set-crawl/app-page-set-crawl"
import "./pages/overview/app-page-overview"
import "./pages/inspect/app-page-inspect"

export default class LibrarySiteChecker extends LitElement {

  static get properties() {
    return {
      page : {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    if( APP_CONFIG.data && !APP_CONFIG.data.error ) {
      this.page = 'overview';
    } else {
      this.page = 'set-crawl';
    }
  }

  _onInspect(e) {
    let {title, url} = e.detail;
    this.page = 'inspect';
    this.shadowRoot.querySelector('[page="inspect"]').show(title, url);
  }

  _onBack() {
    this.page = 'overview';
  }

}

customElements.define('library-site-checker', LibrarySiteChecker);
