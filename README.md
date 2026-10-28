# CAP MCP Quotation Approval

A minimal SAP CAP (Node.js) project that exposes a quotation service to AI clients through the **Model Context Protocol (MCP)**, using the [`@cap-js/mcp`](https://github.com/cap-js/mcp) adapter.

Adding the `@mcp` annotation to a CAP service is all it takes. There is no hand-written MCP server.

> The `@cap-js/mcp` adapter is in **Beta**, so behavior may change. This is a learning project and uses CAP mock authentication. It is not production-ready.

## What it does

- Serves `Quotations` as a read-only entity.
- Provides an `approveQuotation` action that approves an `OPEN` quotation by its number.
- Exposes the service over OData V4 and MCP.

```
AI client / MCP Inspector  -->  /mcp/quotation  -->  QuotationService (CAP)  -->  SQLite (in-memory)
```

## Project structure

```
.
├── db/
│   ├── schema.cds
│   └── data/demo-Quotations.csv
├── srv/
│   ├── service.cds
│   └── service.js
└── package.json
```

## Prerequisites

- Node.js 18 or later
- `@sap/cds-dk` installed globally (`npm i -g @sap/cds-dk`)

## Setup

```bash
git clone https://github.com/<your-username>/cap-mcp-quotation-approval.git
cd cap-mcp-quotation-approval
npm install
```

If you are creating the project from scratch instead:

```bash
cds init cap-mcp-quotation-approval --add sqlite
cd cap-mcp-quotation-approval
npm install
npm add @cap-js/mcp
```

## Run

PowerShell:

```powershell
$env:DEBUG="mcp"; cds watch
```

Bash:

```bash
DEBUG=mcp cds watch
```

The log should show:

```
[cds] - serving QuotationService { at: [ '/odata/v4/quotation', '/mcp/quotation' ] }
[mcp] - registering MCP services: [ 'QuotationService' ]
```

| Protocol | URL |
|---|---|
| OData V4 | `http://localhost:4004/odata/v4/quotation` |
| MCP (Streamable HTTP) | `http://localhost:4004/mcp/quotation` |

The database is in-memory, so restarting the server resets the data from the CSV.

## Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

1. Choose **Add Servers** > **Add manually**.
2. Transport: **Streamable HTTP**.
3. URL: `http://localhost:4004/mcp/quotation`
4. Header: `Authorization: Basic YWxpY2U6` (mock user `alice` with an empty password).
5. Connect and open the **Tools** tab. The adapter provides three generic tools:

| Tool | Purpose |
|---|---|
| `describe` | Lists the entities and actions of the service |
| `query` | Runs a CQL `SELECT` |
| `call` | Calls an action |

### Example calls

`query`:

```
SELECT from Quotations WHERE status = 'OPEN'
```

`call` (turn on **Edit as JSON**):

```json
{
  "action": "approveQuotation",
  "parameters": { "quotationNo": "Q-1002" }
}
```

Run the `query` again to confirm that Q-1002 is now `APPROVED`.

## Test the action without MCP

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:4004/odata/v4/quotation/approveQuotation" `
  -Headers @{ Authorization = "Basic YWxpY2U6" } `
  -ContentType "application/json" `
  -Body '{"quotationNo":"Q-1002"}'
```

## Use with Claude Code (optional)

When CAP starts, the adapter registers the MCP endpoint with Claude Code. Open Claude Code in this folder and ask:

- *Show me all open quotations*
- *Approve Q-1002*

Claude Code asks for permission before it runs a tool that changes data.

## How it works

`srv/service.cds`:

```cds
@mcp
@odata
service QuotationService {
  @readonly entity Quotations as projection on demo.Quotations;
  action approveQuotation(quotationNo : String @mandatory) returns String;
}
```

- `@mcp` makes CAP serve the service as an MCP server.
- `@readonly` limits the AI to reading data. It can only change data through `approveQuotation`.
- `@mcp.instructions` gives the AI hints about the service.

## Troubleshooting

| Problem | Fix |
|---|---|
| `NO_DATABASE_CONNECTION` | Run `npm add @cap-js/sqlite --save-dev` and restart `cds watch` |
| `ASSERT_MANDATORY` on `quotationNo` | Send `quotationNo` inside `parameters` in the `call` tool |
| `fetch failed` | `cds watch` is not running, or the port is not 4004 |
| 401 from the MCP endpoint | Check the `Authorization` header |

## Next steps

- Replace mock authentication with XSUAA and restrict `approveQuotation` to an approver role.
- Deploy to SAP BTP Cloud Foundry and connect a remote MCP client.
- Add a CAP agent with the `@cap-js/agent` plugin.

## References

- [CAP: Model Context Protocol Adapter](https://cap.cloud.sap/docs/guides/ai/cap-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
