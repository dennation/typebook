import {
	DEFAULT_REGISTRY_FILE,
	DEFAULT_SNIPPETS_FILE,
	PACKAGE_NAME,
} from "./constants.js";
import { TypebookBuilder } from "./core/builder.js";

const args = process.argv.slice(2);
const command = args[0];

function getOpt(prefix: string): string | undefined {
	const arg = args.find((a) => a.startsWith(prefix));
	return arg ? arg.split("=")[1] : undefined;
}

if (command === "generate") {
	const builder = new TypebookBuilder({
		cwd: process.cwd(),
		registryFile: getOpt("--registry-file="),
		snippetsFile: getOpt("--snippets-file="),
	});
	try {
		await builder.start();
	} finally {
		builder.stop();
	}
} else {
	console.log(`
  @dennation/${PACKAGE_NAME}

  Commands:
    generate    Scan source files for registerComponent() calls and <Snippet> blocks,
                then write the generated registry and snippet files

  Options:
    --registry-file=PATH      Output path for registry file (default: ${DEFAULT_REGISTRY_FILE})
    --snippets-file=PATH      Output path for snippet map (default: ${DEFAULT_SNIPPETS_FILE})

  Usage:
    npx @dennation/${PACKAGE_NAME} generate
`);
}
