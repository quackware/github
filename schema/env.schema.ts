import { Type, TypeCompiler } from "../deps.ts";

export const EnvSchema = Type.Object({
  GITHUB_APP_ID: Type.String(),
  GITHUB_PRIVATE_KEY: Type.String(),
});

export const EnvSchemaChecker = TypeCompiler.Compile(EnvSchema);
