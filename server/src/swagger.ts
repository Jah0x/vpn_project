import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { OpenAPIGenerator, SchemaRegistry } from "zod-to-openapi";
import { VpnModel, VpnCreate, VpnUpdate } from "./validators/vpn";

export const mountSwagger = (app: express.Express) => {
  if (process.env.NODE_ENV === "production") return;
  const spec = YAML.load(__dirname + "/../openapi.yaml");

  const registry = new SchemaRegistry();
  [VpnModel, VpnCreate, VpnUpdate].forEach((s) =>
    registry.register((s as any)._def.openapi.name, s),
  );
  const generator = new OpenAPIGenerator(registry.schemas);
  const schemas = generator.generate();
  spec.components = spec.components || {};
  spec.components.schemas = { ...spec.components.schemas, ...schemas };

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
};
