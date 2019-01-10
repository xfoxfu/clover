import { sync as glob } from "globby";
import { join } from "path";

export const require_classes_sync = (base: string, ...patterns: string[]) =>
  glob(patterns.map(p => join(base, p)), {
    expandDirectories: ["*.js", "*.ts"],
  })
    .map(file => require(file))
    .map((e: object) =>
      Object.values(e).filter(
        o => typeof o === "function",
        // && Reflect.getMetadata(PATH_METADATA, o) !== undefined,
      ),
    )
    .reduce((pv, cv) => pv.concat(cv), []);
