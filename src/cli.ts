#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import { ObsidianMCPServer, ServerConfig } from './server';

yargs(hideBin(process.argv))
  .command('$0', 'Start the Obsidian MCP server', (yargs) => {
    return yargs.option('config', {
      alias: 'c',
      type: 'string',
      description: 'Path to config file',
      demandOption: true
    });
  }, async (argv) => {
    try {
      const configContent = fs.readFileSync(argv.config, 'utf-8');
      const config = JSON.parse(configContent) as ServerConfig;
      
      const server = new ObsidianMCPServer(config);
      await server.start();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  })
  .help()
  .argv;