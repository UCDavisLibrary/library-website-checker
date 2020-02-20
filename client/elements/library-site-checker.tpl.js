import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }
</style>  

<iron-pages selected="${this.page}" attr-for-selected="page">
  <app-page-set-crawl page="set-crawl"></app-page-set-crawl>
  <app-page-overview page="overview" @inspect="${this._onInspect}"></app-page-overview>
  <app-page-inspect page="inspect" @back="${this._onBack}"></app-page-inspect>
</iron-pages>

`;}