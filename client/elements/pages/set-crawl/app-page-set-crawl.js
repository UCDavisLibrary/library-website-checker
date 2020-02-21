import { LitElement } from 'lit-element';
import render from "./app-page-set-crawl.tpl.js"


export default class AppPageSetCrawl extends LitElement {

  static get properties() {
    return {
      runs : []
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    if( APP_CONFIG.data.type === 'list' ) {
      this.runs = APP_CONFIG.data.results.map(name => name.replace(/\/$/, ''));
    } else {
      this.runs = [];
    }
  }

  _onBtnClick() {
    window.location = '/?name='+this.shadowRoot.querySelector('#crawl-name').value;
  }

}

customElements.define('app-page-set-crawl', AppPageSetCrawl);
