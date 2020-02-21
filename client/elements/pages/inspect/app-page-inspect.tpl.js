import { html } from 'lit-element';
import leafletCss from "leaflet/dist/leaflet.css"

export default function render() { 
return html`

<style>${leafletCss}</style>
<style>
  :host {
    display: block;
    height: 100vh
  }

  #viewer {
    height: 100%;
    border: 1px solid #ccc;
  }

  a, a:visited {
    color: var(--link-color);
    cursor: pointer;
    text-decoration: underline;
  }

  .layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  small {
    color: #333;
    font-size: 13px;
  }
</style>

<div class="layout">
  <div style="margin:5px"><a @click="${this._back}">Back</a></div>
  <h2 style="margin-left:5px">${this.title} <small ?hidden="${!this.loading}">Loading...</small></h2>

  <div id="viewer" style="flex: 1"></div>
</div>
`;}