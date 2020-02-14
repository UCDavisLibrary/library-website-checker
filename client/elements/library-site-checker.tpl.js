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
  <app-page-overview page="overview"></app-page-overview>
  <app-page-inspect page="inspect"></app-page-inspect>
</iron-pages>

`;}