import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import { OpenAPIGenerator, SchemaRegistry } from 'zod-to-openapi';
import { VpnModel, VpnCreate, VpnUpdate } from '../src/validators/vpn';

const specPath = path.resolve(__dirname, '../openapi.yaml');
const spec = YAML.load(specPath);

const registry = new SchemaRegistry();
[VpnModel, VpnCreate, VpnUpdate].forEach((schema: any) => {
  registry.register(schema._def.openapi.name, schema);
});
const generator = new OpenAPIGenerator(registry.schemas);
const schemas = generator.generate();

spec.components = spec.components || {};
spec.components.schemas = {
  ...(spec.components.schemas || {}),
  ...schemas,
};

fs.writeFileSync(specPath, YAML.stringify(spec, 4));
