import {
  DEFAULT_REGISTRY_FILE,
  PACKAGE_NAME,
} from './constants.js'
import { RegistryBuilder } from './core/registry-builder.js'

const args = process.argv.slice(2)
const command = args[0]

function getOpt(prefix: string): string | undefined {
  const arg = args.find((a) => a.startsWith(prefix))
  return arg ? arg.split('=')[1] : undefined
}

if (command === 'generate') {
  const builder = new RegistryBuilder({
    cwd: process.cwd(),
    registryFile: getOpt('--registry-file='),
  })
  try {
    await builder.start()
  } finally {
    builder.stop()
  }
} else {
  console.log(`
  @dennation/${PACKAGE_NAME}

  Commands:
    generate    Scan source files for register() calls and write the registry gen file

  Options:
    --registry-file=PATH      Output path for registry file (default: ${DEFAULT_REGISTRY_FILE})

  Usage:
    npx @dennation/${PACKAGE_NAME} generate
`)
}
