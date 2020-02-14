import { LitElement } from 'lit-element';
import render from "./app-page-overview.tpl.js"


export default class AppPageOverview extends LitElement {

  static get properties() {
    return {
      pages : {type: Array},
      config : {type: Object},
      name : {type: String}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.config = APP_CONFIG.data.config;
    this.name = this.config.name.replace(/ /g, '-');

    let pages = [];
    for( let pathname in APP_CONFIG.data.diff ) {
      let info = APP_CONFIG.data.diff[pathname];
      pages.push({
        pathname,
        maxScore : Math.max(info.desktop.differences, info.tablet.differences, info.mobile.differences),
        desktop : info.desktop,
        tablet : info.tablet,
        mobile : info.mobile
      });
    }
    pages.sort((a, b) => a.maxScore > b.maxScore ? -1 : 1);

    this.pages = pages;
  }

}

customElements.define('app-page-overview', AppPageOverview);
