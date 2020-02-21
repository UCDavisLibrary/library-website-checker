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
  a, a:visited {
    color: var(--link-color);
    cursor: pointer;
    text-decoration: underline;
  }
</style> 

<div class="layout">
  <div>
    <div>Select Run to view:</div>
    <div>
      ${this.runs.map(name => html`
        <div><a href="/?name=${encodeURIComponent(name)}">${name}</a></div>
      `)}
    </div>
  </div>
</div>

`;}