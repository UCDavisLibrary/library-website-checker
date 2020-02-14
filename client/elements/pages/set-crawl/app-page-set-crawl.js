import { LitElement } from 'lit-element';
import render from "./app-page-set-crawl.tpl.js"


export default class AppPageSetCrawl extends LitElement {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

  _onBtnClick() {
    window.location = '/?name='+this.shadowRoot.querySelector('#crawl-name').value;
  }

}

customElements.define('app-page-set-crawl', AppPageSetCrawl);
