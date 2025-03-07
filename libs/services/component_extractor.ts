import ts from "typescript";
import fs from "fs";
import path from "path";

export const extractComponents = (filePath: string) => {
  const code = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const components: { name: string; props: string[] }[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
      const name = node.getText(sourceFile);
      if (name && name[0] === name[0].toUpperCase()) {
        const props: string[] = [];
        ts.forEachChild(node, (child) => {
          if (ts.isParameter(child) && child.name.getText(sourceFile) === "props") {
            if (child.type && ts.isTypeLiteralNode(child.type)) {
              child.type.members.forEach((member) => {
                if (ts.isPropertySignature(member) && member.name) {
                  props.push(member.name.getText(sourceFile));
                }
              });
            }
          }
        });
        components.push({ name, props });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return components;
};

// Test the function
// const components = extractComponents(path.resolve("./pages/login/user/index.tsx"));
// console.log("Extracted Components:", components);
