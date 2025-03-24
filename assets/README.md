# Assets

## OpenAPI definition

```bash
# download definition
curl https://coddingtonbear.github.io/obsidian-local-rest-api/openapi.yaml -o openapi-obsidian-local-rest-api.yaml

# download certificate
curl https://127.0.0.1:27124/obsidian-local-rest-api.crt -o obsidian-local-rest-api.crt
ln -s obsidian-local-rest-api.crt rootCA.crt

# convert certificate to PEM format
openssl x509 -in obsidian-local-rest-api.crt -out rootCA.pem -outform PEM

# install CA ROOT certificates from repo
CAROOT=$(pwd) mkcert -install

# generate Client code from OpenAPI definition
# ref: https://github.com/hey-api/openapi-ts
npx @hey-api/openapi-ts \
  -i https://coddingtonbear.github.io/obsidian-local-rest-api/openapi.yaml \
  -o src/client \
  -c @hey-api/client-fetch

# generate Server code from OpenAPI definition
# ref1: https://github.com/openapitools/openapi-generator
# ref2: https://openapi-generator.tech/docs/installation/
npx @openapitools/openapi-generator-cli generate -i openapi-obsidian-local-rest-api.yaml -o src/client -g typescript-axios
```

## Run MCP Debug

```bash
npx @modelcontextprotocol/inspector bun run src/cli.ts
```