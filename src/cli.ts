#!/usr/bin/env node

// BlackRoad CLI - Official command-line interface
// Usage: blackroad <command> [options]

const VERSION = '1.0.0';
const API_BASE = 'https://blackroad-graphql-gateway.amundsonalexa.workers.dev';
const WEBHOOKS_BASE = 'https://blackroad-webhooks.amundsonalexa.workers.dev';
const EMAIL_BASE = 'https://blackroad-email.amundsonalexa.workers.dev';
const STATUS_BASE = 'https://blackroad-status.amundsonalexa.workers.dev';

// Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  pink: '\x1b[38;5;205m',
  amber: '\x1b[38;5;214m',
  blue: '\x1b[38;5;69m',
  violet: '\x1b[38;5;135m',
  green: '\x1b[38;5;82m',
  red: '\x1b[38;5;196m',
  gray: '\x1b[38;5;245m',
};

const c = colors;

function logo(): void {
  console.log(`
${c.amber}╔══════════════════════════════════════════════════════════╗${c.reset}
${c.amber}║${c.reset}  ${c.pink}█▄▄ █░░ ▄▀█ █▀▀ █▄▀ █▀█ █▀█ ▄▀█ █▀▄${c.reset}                    ${c.amber}║${c.reset}
${c.amber}║${c.reset}  ${c.pink}█▄█ █▄▄ █▀█ █▄▄ █░█ █▀▄ █▄█ █▀█ █▄▀${c.reset}  ${c.gray}CLI v${VERSION}${c.reset}        ${c.amber}║${c.reset}
${c.amber}╚══════════════════════════════════════════════════════════╝${c.reset}
`);
}

function help(): void {
  logo();
  console.log(`${c.bold}USAGE${c.reset}
  ${c.green}blackroad${c.reset} <command> [options]
  ${c.green}br${c.reset} <command> [options]

${c.bold}COMMANDS${c.reset}
  ${c.pink}status${c.reset}              Check service health
  ${c.pink}stats${c.reset}               Infrastructure statistics
  ${c.pink}agents${c.reset}              List active agents
  ${c.pink}deploy${c.reset} <service>    Deploy a service
  ${c.pink}webhooks${c.reset}            Manage webhooks
  ${c.pink}email${c.reset}               Send emails
  ${c.pink}query${c.reset} <graphql>     Execute GraphQL query
  ${c.pink}config${c.reset}              Manage configuration
  ${c.pink}login${c.reset}               Authenticate with API key
  ${c.pink}version${c.reset}             Show version
  ${c.pink}help${c.reset}                Show this help

${c.bold}EXAMPLES${c.reset}
  ${c.gray}# Check all services${c.reset}
  ${c.green}$${c.reset} blackroad status

  ${c.gray}# Get infrastructure stats${c.reset}
  ${c.green}$${c.reset} blackroad stats

  ${c.gray}# List online agents${c.reset}
  ${c.green}$${c.reset} blackroad agents --status online

  ${c.gray}# Deploy to production${c.reset}
  ${c.green}$${c.reset} blackroad deploy my-service --env production

  ${c.gray}# Send a test webhook${c.reset}
  ${c.green}$${c.reset} blackroad webhooks test wh_abc123

  ${c.gray}# Send welcome email${c.reset}
  ${c.green}$${c.reset} blackroad email send --to user@example.com --template welcome

${c.bold}DOCUMENTATION${c.reset}
  ${c.blue}https://blackroad-dev-portal.amundsonalexa.workers.dev${c.reset}

${c.bold}SUPPORT${c.reset}
  ${c.gray}GitHub:${c.reset}  ${c.blue}https://github.com/BlackRoad-OS${c.reset}
  ${c.gray}Status:${c.reset}  ${c.blue}https://blackroad-status.amundsonalexa.workers.dev${c.reset}
`);
}

async function fetchJSON(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("HTTP " + response.status + ": " + response.statusText);
  }
  return response.json();
}

async function status(): Promise<void> {
  console.log(c.pink + "Checking service status..." + c.reset + "\n");

  try {
    const data = await fetchJSON(STATUS_BASE + "/api/status");

    console.log(c.bold + "Overall: " + c.reset + (data.overall === "All Systems Operational"
      ? c.green + data.overall + c.reset
      : c.red + data.overall + c.reset));
    console.log();

    for (const service of data.services) {
      const statusColor = service.status === 'operational' ? c.green :
                          service.status === 'degraded' ? c.amber : c.red;
      const statusIcon = service.status === 'operational' ? '●' :
                         service.status === 'degraded' ? '◐' : '○';

      console.log("  " + statusColor + statusIcon + c.reset + " " + c.bold + service.name.padEnd(20) + c.reset +
                  c.gray + service.latency + "ms" + c.reset);
    }

    console.log("\n" + c.gray + "Last checked: " + data.lastChecked + c.reset);
  } catch (error: any) {
    console.error(c.red + "Error: " + error.message + c.reset);
  }
}

async function stats(): Promise<void> {
  console.log(c.pink + "Fetching infrastructure stats..." + c.reset + "\n");

  try {
    const query = "query { infrastructureStats { repositories githubOrgs cloudflareProjects kvNamespaces activeAgents totalDeployments } }";
    const response = await fetch(API_BASE + "/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json() as any;
    const stats = data.data.infrastructureStats;

    console.log(c.bold + "Infrastructure Stats" + c.reset);
    console.log(c.gray + "─".repeat(40) + c.reset);
    console.log("  " + c.amber + "Repositories:     " + c.reset + c.bold + stats.repositories + c.reset);
    console.log("  " + c.amber + "GitHub Orgs:      " + c.reset + c.bold + stats.githubOrgs + c.reset);
    console.log("  " + c.amber + "Cloudflare:       " + c.reset + c.bold + stats.cloudflareProjects + " projects" + c.reset);
    console.log("  " + c.amber + "KV Namespaces:    " + c.reset + c.bold + stats.kvNamespaces + c.reset);
    console.log("  " + c.amber + "Active Agents:    " + c.reset + c.bold + stats.activeAgents + c.reset);
    console.log("  " + c.amber + "Deployments:      " + c.reset + c.bold + stats.totalDeployments + c.reset);
  } catch (error: any) {
    console.error(c.red + "Error: " + error.message + c.reset);
  }
}

async function agents(statusFilter?: string): Promise<void> {
  console.log(c.pink + "Fetching agents..." + c.reset + "\n");

  try {
    const statusArg = statusFilter ? "(status: " + statusFilter.toUpperCase() + ")" : "";
    const query = "query { agents" + statusArg + " { id name type status host lastSeen } }";
    const response = await fetch(API_BASE + "/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json() as any;
    const agents = data.data.agents;

    console.log(c.bold + "Agents (" + agents.length + ")" + c.reset);
    console.log(c.gray + "─".repeat(60) + c.reset);

    for (const agent of agents) {
      const statusColor = agent.status === 'ONLINE' ? c.green :
                          agent.status === 'BUSY' ? c.amber : c.red;
      const statusIcon = agent.status === 'ONLINE' ? '●' :
                         agent.status === 'BUSY' ? '◐' : '○';

      console.log("  " + statusColor + statusIcon + c.reset + " " + c.bold + agent.name.padEnd(25) + c.reset +
                  c.gray + agent.type.padEnd(12) + c.reset +
                  c.blue + agent.host + c.reset);
    }
  } catch (error: any) {
    console.error(c.red + "Error: " + error.message + c.reset);
  }
}

async function deploy(service: string, env: string = 'STAGING'): Promise<void> {
  console.log(c.pink + "Deploying " + service + " to " + env + "..." + c.reset + "\n");

  try {
    const mutation = "mutation { deploy(input: { service: \"" + service + "\", environment: " + env + " }) { id service status } }";
    const response = await fetch(API_BASE + "/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json() as any;
    const deployment = data.data.deploy;

    console.log(c.green + "✓" + c.reset + " Deployment created");
    console.log("  " + c.gray + "ID:" + c.reset + "      " + deployment.id);
    console.log("  " + c.gray + "Service:" + c.reset + " " + deployment.service);
    console.log("  " + c.gray + "Status:" + c.reset + "  " + c.amber + deployment.status + c.reset);
  } catch (error: any) {
    console.error(c.red + "Error: " + error.message + c.reset);
  }
}

async function webhooksCmd(action: string, arg?: string): Promise<void> {
  switch (action) {
    case 'list':
      console.log(c.pink + "Fetching webhooks..." + c.reset + "\n");
      const listResp = await fetchJSON(WEBHOOKS_BASE + "/api/webhooks");
      console.log(c.bold + "Webhooks (" + listResp.webhooks.length + ")" + c.reset);
      for (const wh of listResp.webhooks) {
        console.log("  " + c.green + "●" + c.reset + " " + wh.id + " → " + c.blue + wh.url + c.reset);
      }
      break;

    case 'events':
      console.log(c.pink + "Fetching event types..." + c.reset + "\n");
      const eventsResp = await fetchJSON(WEBHOOKS_BASE + "/api/events");
      console.log(c.bold + "Event Types (" + eventsResp.total + ")" + c.reset);
      for (const cat of eventsResp.categories) {
        console.log("\n  " + c.amber + cat.name + c.reset + " (" + cat.events.length + ")");
        for (const event of cat.events.slice(0, 5)) {
          console.log("    " + c.gray + "•" + c.reset + " " + event);
        }
        if (cat.events.length > 5) {
          console.log("    " + c.gray + "... and " + (cat.events.length - 5) + " more" + c.reset);
        }
      }
      break;

    case 'test':
      if (!arg) {
        console.log(c.red + "Usage: blackroad webhooks test <webhook-id>" + c.reset);
        return;
      }
      console.log(c.pink + "Testing webhook " + arg + "..." + c.reset);
      const testResp = await fetch(WEBHOOKS_BASE + "/api/webhooks/" + arg + "/test", { method: 'POST' });
      const testData = await testResp.json() as any;
      console.log(testData.success ? c.green + "✓ Test sent" + c.reset : c.red + "✗ Test failed" + c.reset);
      break;

    default:
      console.log("Usage: blackroad webhooks <list|events|test> [args]");
  }
}

async function emailCmd(action: string, args: string[]): Promise<void> {
  switch (action) {
    case 'templates':
      console.log(c.pink + "Fetching email templates..." + c.reset + "\n");
      const templatesResp = await fetchJSON(EMAIL_BASE + "/api/templates");
      console.log(c.bold + "Email Templates (" + templatesResp.templates.length + ")" + c.reset);
      for (const tmpl of templatesResp.templates) {
        console.log("  " + c.green + "●" + c.reset + " " + c.bold + tmpl.id.padEnd(25) + c.reset + c.gray + tmpl.description + c.reset);
      }
      break;

    case 'send':
      console.log(c.pink + "Sending email..." + c.reset);
      // Parse --to and --template from args
      const toIdx = args.indexOf('--to');
      const tmplIdx = args.indexOf('--template');
      if (toIdx === -1 || tmplIdx === -1) {
        console.log(c.red + "Usage: blackroad email send --to <email> --template <template>" + c.reset);
        return;
      }
      const to = args[toIdx + 1];
      const template = args[tmplIdx + 1];

      const sendResp = await fetch(EMAIL_BASE + "/api/send", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, template, data: { name: 'Developer' } }),
      });
      const sendData = await sendResp.json() as any;
      console.log(sendData.success ? c.green + "✓ Email sent to " + to + c.reset : c.red + "✗ Failed" + c.reset);
      break;

    default:
      console.log("Usage: blackroad email <templates|send> [args]");
  }
}

async function query(graphql: string): Promise<void> {
  console.log(c.pink + "Executing query..." + c.reset + "\n");

  try {
    const response = await fetch(API_BASE + "/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: graphql }),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error(c.red + "Error: " + error.message + c.reset);
  }
}

function version(): void {
  console.log(c.pink + "blackroad" + c.reset + " v" + VERSION);
}

// Main
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    help();
    return;
  }

  switch (command) {
    case 'status':
      await status();
      break;

    case 'stats':
      await stats();
      break;

    case 'agents':
      const statusFlag = args.indexOf('--status');
      await agents(statusFlag !== -1 ? args[statusFlag + 1] : undefined);
      break;

    case 'deploy':
      const service = args[1];
      const envFlag = args.indexOf('--env');
      const env = envFlag !== -1 ? args[envFlag + 1] : 'STAGING';
      if (!service) {
        console.log(c.red + "Usage: blackroad deploy <service> [--env production|staging]" + c.reset);
        return;
      }
      await deploy(service, env.toUpperCase());
      break;

    case 'webhooks':
      await webhooksCmd(args[1], args[2]);
      break;

    case 'email':
      await emailCmd(args[1], args.slice(2));
      break;

    case 'query':
      if (!args[1]) {
        console.log(c.red + "Usage: blackroad query '<graphql>'" + c.reset);
        return;
      }
      await query(args.slice(1).join(' '));
      break;

    case 'version':
    case '--version':
    case '-v':
      version();
      break;

    case 'login':
      console.log(c.amber + "API key authentication coming soon!" + c.reset);
      console.log(c.gray + "For now, set BLACKROAD_API_KEY environment variable" + c.reset);
      break;

    case 'config':
      console.log(c.amber + "Configuration:" + c.reset);
      console.log("  " + c.gray + "API:" + c.reset + "      " + API_BASE);
      console.log("  " + c.gray + "Webhooks:" + c.reset + " " + WEBHOOKS_BASE);
      console.log("  " + c.gray + "Email:" + c.reset + "    " + EMAIL_BASE);
      console.log("  " + c.gray + "Status:" + c.reset + "   " + STATUS_BASE);
      break;

    default:
      console.log(c.red + "Unknown command: " + command + c.reset);
      console.log("Run " + c.green + "blackroad help" + c.reset + " for usage");
  }
}

main().catch(console.error);
