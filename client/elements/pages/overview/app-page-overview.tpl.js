import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }
  .layout {
    display: flex;
    justify-content: center;
    margin-top: 25px;
  }
  table {
    border-collapse: collapse;
  }
  table th {
    text-align: left;
    padding: 0 15px;
  }
  table td {
    padding: 5px 15px;
  }
  table tr:nth-child(even) {
    background-color: #2a2a2a;
  }
  table tr:hover {
    background-color: #333;
  }
  a, a:visited {
    color: var(--link-color);
    cursor: pointer;
    text-decoration: underline;
  }
</style>

<div style="margin: 5px">
  <div><a href="/">Back</a></div>

  <div>
    <h2 style="margin-bottom: 1px">${this.name}</h2>
    <div>${new Date(this.date).toISOString()}</div>
    <div>${this.config.serverA.name}: ${this.config.serverA.baseUrl}</div>
    <div>${this.config.serverB.name}: ${this.config.serverB.baseUrl}</div>
  </div>
</div>

<div class="layout">
  <div>
    <table>
      <tr>
        <th>Path</th>
        <th>Live Links</th>
        <th>Desktop</th>
        <th>Tablet</th>
        <th>Mobile</th>
      </tr>
      ${this.pages.map(item => html`
        <tr>
          <td>
            <b>${(item.pathname || '/')}</b>
          </td>
          <td>
            <a href="${this.config.serverA.baseUrl}${item.pathname}" target="_blank">${this.config.serverA.name}</a>
            <a href="${this.config.serverB.baseUrl}${item.pathname}" target="_blank">${this.config.serverB.name}</a>
          </td>
          <td>
            <a 
              @click="${this._inspect}" 
              device="Desktop"
              pathname="${item.pathname}"
              url="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/desktop.png" target="_blank">Diff</a>
            <span>Error: %${((item.desktop.differences/item.desktop.dimension)*100).toFixed(2)}</span>
          </td>
          <td>
            <a 
              @click="${this._inspect}" 
              device="Tablet"
              pathname="${item.pathname}"
              url="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/tablet.png" target="_blank">Diff</a>
            <span>Error: %${((item.tablet.differences/item.tablet.dimension)*100).toFixed(2)}</span>
          </td>
          <td>
            <a
              @click="${this._inspect}" 
              device="Mobile"
              pathname="${item.pathname}" 
              url="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/mobile.png" target="_blank">Diff</a>
            <span>Error: %${((item.mobile.differences/item.mobile.dimension)*100).toFixed(2)}</span>
          </td>
        </tr>
      `)}
    </table>
  </div>
</div>

`;}