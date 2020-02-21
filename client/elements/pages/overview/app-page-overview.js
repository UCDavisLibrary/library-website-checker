import { LitElement } from 'lit-element';
import render from "./app-page-overview.tpl.js"


export default class AppPageOverview extends LitElement {

  static get properties() {
    return {
      pages : {type: Array},
      config : {type: Object},
      name : {type: String},
      date : {type: Number}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    if( APP_CONFIG.data.type === 'list' ) {
      this.pages = [];
      this.name = '';
      this.config = {
        serverA : {},
        serverB : {}
      };
      this.date = 0;
      return;
    }

    let data = APP_CONFIG.data.results;
    this.date = data.timestamp;
    this.config = data.config;
    this.name = this.config.name.replace(/ /g, '-');

    let pages = [];
    for( let pathname in data.diff ) {
      let info = data.diff[pathname];
      pages.push({
        pathname,
        maxScore : Math.max(
          info.desktop.differences/info.desktop.dimension, 
          info.tablet.differences/info.desktop.dimension, 
          info.mobile.differences/info.desktop.dimension
        ),
        desktop : info.desktop,
        tablet : info.tablet,
        mobile : info.mobile
      });
    }
    pages.sort((a, b) => a.maxScore > b.maxScore ? -1 : 1);

    this.pages = pages;
  }

  _inspect(e) {
    let url = e.currentTarget.getAttribute('url');
    let device = e.currentTarget.getAttribute('device');
    let pathname = e.currentTarget.getAttribute('pathname');

    this.dispatchEvent(new CustomEvent('inspect', {detail: {
      url,
      title: device+' - '+pathname
    }}))
  }

}

customElements.define('app-page-overview', AppPageOverview);
