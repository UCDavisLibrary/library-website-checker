import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
    height: 100vh;
  }
  .layout {
    height: 100vh;
    align-items: center;
    justify-content: center;
    display: flex;
  }
</style> 

<div class="layout">
  <div>
    <div>Please enter name of crawl to view:</div>
    <div>
      <input type="text" id="crawl-name" /> <button @click="${this._onBtnClick}">Go</button>
    </div>
  </div>
</div>

`;}