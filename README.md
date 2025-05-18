# Obsidian MCP REST Server

An MCP (Model Context Protocol) server implementation that provides access to Obsidian vaults through a local REST API. This server allows AI assistants to interact with Obsidian notes and manage vault content through a standardized interface.

## Features

- Access Obsidian vault contents through MCP
- Read and write notes
- List vault contents
- Search functionality
- Secure local REST API integration
- Compatible with Claude Desktop and other AI assistants

## Prerequisites

- Node.js 16 or higher
- Obsidian with Local REST API plugin installed and configured
- An Obsidian vault with Local REST API enabled

## Installation

Install the package globally:

```bash
npm install -g PublikPrinciple/obsidian-mcp-rest
```

Or if you prefer using a specific version/branch:

```bash
npm install -g PublikPrinciple/obsidian-mcp-rest#main
```

## Configuration

1. First, configure [Obsidian Local REST API plugin](https://github.com/coddingtonbear/obsidian-local-rest-api):

   - Install the Local REST API plugin in Obsidian
   - Configure the API port (default: 27123)
   - Generate and save an API key

2. Create a configuration file `config.json`:

```json
{
  "obsidian": {
    "apiKey": "your-api-key-here",
    "port": 27123,
    "host": "localhost"
  },
  "server": {
    "name": "obsidian-mcp",
    "version": "1.0.0"
  }
}
```

Pre-configured:

- `config.wsl2.jsonc` - WSL2 configuration for Obsidian Local REST API
- `config.secured.jsonc` - HTTPS enabled access to the Obsidian Local REST API

MCP Configuration listen to global environment variables:

- `API_HOST` - host of the Obsidian Local REST API
- `API_PORT` - port of the Obsidian Local REST API
- `API_KEY` - API key for Obsidian Local REST API

## Usage

1. Start the server:

```bash
obsidian-mcp-rest --config path/to/config.json
```

2. The server will start and listen for MCP requests via stdin/stdout.

### Using with Claude Desktop

1. Configure Claude Desktop to use this MCP server:

   - Open Claude Desktop settings
   - Navigate to the MCP section
   - Add new server configuration:
     ```json
     {
       "name": "obsidian-mcp",
       "command": "obsidian-mcp-rest",
       "args": ["--config", "path/to/config.json"]
     }
     ```

2. Claude can now access your Obsidian vault through commands like:
   ```
   Read note "Projects/MyProject.md"
   List all notes in "Projects" folder
   Search for notes containing "typescript"
   ```

## Available Tools

- `listNotes`: List all notes in the vault or a specific folder
- `readNote`: Read the contents of a specific note
- `writeNote`: Create or update a note
- `searchNotes`: Search for notes using a query string
- `getMetadata`: Get metadata for a specific note

## Security

- The server only runs locally and communicates through stdin/stdout
- All requests to Obsidian REST API are authenticated with your API key
- No external network access is required
- Data remains local to your machine

## Development

1. Clone the repository:

```bash
git clone https://github.com/PublikPrinciple/obsidian-mcp-rest.git
cd obsidian-mcp-rest
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run tests:

```bash
npm test
```

## Dockerize

```bash
# to build the image
docker build -t mcp/obsidian:latest -f Dockerfile .

# run locally with enabled debug and injected API_KEY
DEBUG=* docker run --name mcp-obsidian -e DEBUG -e API_KEY --rm -i mcp/obsidian:latest
```

https://github.com/modelcontextprotocol/inspector

```bash
# build code first
yarn build

# convert obsidian root certificate to PEM format
openssl x509 -in obsidian-local-rest-api.crt -out rootCA.pem -outform PEM

# run under inspector (release version)
npx @modelcontextprotocol/inspector node dist/cli.js

# run under inspector (source version)
npx @modelcontextprotocol/inspector bun src/cli.ts
```

```json
{
  "mcpServers": {
    "mcp-obsidian": {
      "command": "docker",
      "args": ["run", "--name", "mcp-obsidian", "--rm", "-i", "mcp/obsidian:latest", "-e", "API_KEY", "-e", "DEBUG"],
      "env": {
        "API_KEY": "your-api-key-here",
        "DEBUG": "*"
      }
    },
    "mcp-obsidian-bun": {
      "command": "docker",
      "args": ["run", "--name", "mcp-obsidian-bun", "--rm", "-i", "mcp/obsidian:bun", "-e", "API_KEY", "-e", "DEBUG"],
      "env": {
        "API_KEY": "your-api-key-here",
        "DEBUG": "*"
      }
    }
  }
}
```

## Troubleshooting

### Verify that Obsidian REST API is running

```bash
# windows CMD, verify that port is listening (that rest api is running)
netstat -an | findstr 27124

# curl with --insecure to accept self-signed certificate
curl --insecure https://localhost:27124

# If using WSL with Obsidian REST API running on Windows host
curl --insecure https://host.docker.internal:27124

# Windows Defender Firewall / Inbound Rules. Press Win+R and type WF.msc or firewall.cpl
WF.msc
firewall.cpl # and then press 'Advanced settings'

# Add firewall rule to allow port 27124 (Run in Admin PowerShell)
New-NetFirewallRule -DisplayName "WSL2 Obsidian REST API" -Direction Inbound -LocalPort 27123,27124 -Protocol TCP -Action Allow

# check firewall rules (CMD) that manage 27124 port
netsh advfirewall firewall show rule name=all | findstr /C:"Rule Name" /C:"LocalPort" /C:"RemotePort" | findstr /C:"27124"

# display rules that has WSL2 keyword in own name
netsh advfirewall firewall show rule name=all | grep -A 13 WSL2

# display rule definition by port number (4 line after, 9 lines before)
netsh advfirewall firewall show rule name=all | grep -A 4 -B 9 27124

# Isssue: all those methods does not allow to find port if used range of ports, example: 20000-30000
# in this case those simple methods will not work.
```

### Using from WSL

If you're running this project in WSL but Obsidian with the REST API plugin is running on your Windows host, you need to use one of these approaches to connect:

1. **Use `host.docker.internal`** (Recommended)

   ```typescript
   const config = {
     apiKey: "YOUR_API_KEY",
     port: 27124,
     host: "https://host.docker.internal",
   };
   ```

2. **Find Windows host IP from WSL**

   ```bash
   # Get Windows host IP address (typically the first nameserver in resolv.conf)
   WINDOWS_HOST_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')

   # Get the gateway IP for default route
   WSL_GATEWAY_IP=$(ip route show | grep -i default | awk '{ print $3}')

   # Test connection
   curl --insecure https://$WSL_GATEWAY_IP:27124
   ```

   Then use the IP in your config:

   ```typescript
   const config = {
     apiKey: "YOUR_API_KEY",
     port: 27124,
     host: `https://${WSL_GATEWAY_IP}`,
   };
   ```

   ```shell
   # Add a firewall rule to allow inbound connections on port 27124
   New-NetFirewallRule -DisplayName "Allow Obsidian API For WSL2" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 27124
   ```

   Troubleshooting, disable/enable firewall for understanding is issue on firewall side or not.

   ```shell
   # Temporarily turn off firewall (for testing ONLY, not recommended for regular use)
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

   # Restore Firewall state
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
   ```

3. **Add a custom host entry** (Permanent solution)

```bash
# Add an entry to your /etc/hosts file
echo "$WSL_GATEWAY_IP windows-host" | sudo tee -a /etc/hosts
```

Then use the hostname in your config:

```typescript
const config = {
  apiKey: "YOUR_API_KEY",
  port: 27124,
  host: "https://windows-host",
};
```

### Installation Issues

If you encounter any installation issues, try these alternatives:

1. Clone and install locally:

```bash
git clone https://github.com/PublikPrinciple/obsidian-mcp-rest.git
cd obsidian-mcp-rest
npm install
npm run build
npm install -g .
```

2. If you see TypeScript-related errors, ensure TypeScript is installed globally:

```bash
npm install -g typescript
```

### Release and Versioning

```bash
# install globally tools
npm install commitizen -g
npm install --global cz-vinyl

# now you can do the releases
git add .
git cz

# when all commited, ask for release producing
yarn release
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License - see LICENSE file for details
