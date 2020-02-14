import { LitElement } from 'lit-element';
import render from "./app-page-inspect.tpl.js"


export default class AppPageInspect extends LitElement {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('app-page-inspect', AppPageInspect);
