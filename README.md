# BlackRoad CLI

Official command-line interface for BlackRoad APIs.

## Installation

```bash
npm install -g blackroad
```

## Usage

```bash
# Check service status
blackroad status

# Get infrastructure stats
blackroad stats

# List agents
blackroad agents
blackroad agents --status online

# Deploy a service
blackroad deploy my-service --env production

# Manage webhooks
blackroad webhooks list
blackroad webhooks events
blackroad webhooks test wh_abc123

# Send emails
blackroad email templates
blackroad email send --to user@example.com --template welcome

# Execute GraphQL
blackroad query '{ infrastructureStats { repositories } }'

# Show config
blackroad config
```

## Commands

| Command | Description |
|---------|-------------|
| `status` | Check all service health |
| `stats` | Infrastructure statistics |
| `agents` | List active agents |
| `deploy` | Deploy a service |
| `webhooks` | Manage webhooks |
| `email` | Send emails |
| `query` | Execute GraphQL query |
| `config` | Show configuration |
| `login` | Authenticate |
| `version` | Show version |
| `help` | Show help |

## Aliases

Both `blackroad` and `br` work:

```bash
br status
br stats
br agents
```

## Authentication

Set your API key:

```bash
export BLACKROAD_API_KEY=your-api-key
```

## APIs

- **GraphQL**: https://blackroad-graphql-gateway.amundsonalexa.workers.dev
- **Webhooks**: https://blackroad-webhooks.amundsonalexa.workers.dev
- **Email**: https://blackroad-email.amundsonalexa.workers.dev
- **Status**: https://blackroad-status.amundsonalexa.workers.dev

## License

MIT - BlackRoad OS, Inc.
