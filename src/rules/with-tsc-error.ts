import {
  ESLintUtils
} from "@typescript-eslint/experimental-utils";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

export const withTscErrors = createRule({
  name: "with-tsc-errors",
  meta: {
    type: "suggestion",
    docs: {
      description: "show tsc error plugin.",
      category: "Best Practices",
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      // see: https://eslint.org/docs/developer-guide/working-with-rules#using-message-placeholders
      message: "{{ message }}",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const {
      program,
      tsNodeToESTreeNodeMap,
    } = ESLintUtils.getParserServices(context);
    const sourceFile = program.getSourceFile(context.getFilename());
    const emitResults = program.emit(undefined, () => { });
    const allDiagnostics = [
      ...ts.getPreEmitDiagnostics(program, program.getSourceFile(context.getFilename())),
      ...emitResults.diagnostics,
    ] as const;
    const errors = allDiagnostics.reduce<{
      [key: string]: string;
    }>((prev, curr) => {
      if (!curr.start || !curr.length) {
        return prev;
      }
      const message = ts.flattenDiagnosticMessageText(curr.messageText, "\n");
      const key = `${curr.start},${curr.start + curr.length}`;
      return {
        ...prev,
        [key]: message,
      };
    }, {});
    const errorNodes: {
      key: string;
      node: ts.Node;
      message: string;
    }[] = [];

    function visit(node: ts.Node) {
      const nodestart = node.pos;
      const nodeend = node.end;
      const key = `${nodestart},${nodeend}`;
      // FIXME: some case, this detect node logic is not correct.
      // Try such as example/src/index.ts with lint(without following && !errorNodes.some(e => e.key === key) logic)
      if (errors[key] && !errorNodes.some(e => e.key === key)) {
        errorNodes.push({
          key,
          node,
          message: errors[key],
        });
      }
      ts.forEachChild(node, visit);
    }
    if (sourceFile) {
      visit(sourceFile);
    }

    return {
      Program: function () {
        errorNodes.forEach((errorNode) => {
          const esNode = tsNodeToESTreeNodeMap.get(errorNode.node);
          context.report({
            node: esNode,
            messageId: "message",
            data: {
              message: errorNode.message,
            },
          });
        });
      },
    };
  },
});
