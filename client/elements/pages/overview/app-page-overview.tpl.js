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
</style>  

<div class="layout">
  <div>
    <table>
      <tr>
        <th>Path</th>
        <th>Desktop</th>
        <th>Tablet</th>
        <th>Mobile</th>
      </tr>
      ${this.pages.map(item => html`
        <tr>
          <td>
            <b>${(item.pathname || '/')}</b>
            <a href="${this.config.serverA.baseUrl}${item.pathname}" target="_blank">${this.config.serverA.name}</a>
            <a href="${this.config.serverB.baseUrl}${item.pathname}" target="_blank">${this.config.serverB.name}</a>
          </td>
          <td>
            <a href="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/desktop.png" target="_blank">Diff</a>
            <span>Error: %${Math.ceil((item.desktop.differences/item.desktop.dimension)*100)}</span>
          </td>
          <td>
            <a href="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/tablet.png" target="_blank">Diff</a>
            <span>Error: %${Math.ceil((item.tablet.differences/item.tablet.dimension)*100)}</span>
          </td>
          <td>
            <a href="https://storage.googleapis.com/website-diffs/${this.name}/diff${item.pathname}/mobile.png" target="_blank">Diff</a>
            <span>Error: %${Math.ceil((item.mobile.differences/item.mobile.dimension)*100)}</span>
          </td>
        </tr>
      `)}
    </table>
  </div>
</div>

`;}