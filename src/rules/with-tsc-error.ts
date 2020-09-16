import { ESLintUtils } from "@typescript-eslint/experimental-utils";
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
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    const { program } = ESLintUtils.getParserServices(context);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const emitResults = program.emit(undefined, () => {});
    const allDiagnostics = [
      ...ts.getPreEmitDiagnostics(program, program.getSourceFile(context.getFilename())),
      ...emitResults.diagnostics,
    ];

    return {
      "Program:exit": function () {
        allDiagnostics.forEach((diagnostic) => {
          if (diagnostic.file) {
            const { line: startLine, character: startCharacter } = diagnostic.file.getLineAndCharacterOfPosition(
              diagnostic.start!
            );
            const { line: endLine, character: endCharacter } = diagnostic.file.getLineAndCharacterOfPosition(
              diagnostic.start! + diagnostic.length!
            );
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            context.report({
              loc: {
                start: {
                  line: startLine,
                  column: startCharacter,
                },
                end: {
                  line: endLine,
                  column: endCharacter,
                },
              },
              messageId: "message",
              data: {
                message,
              },
              fix: (fixer) => {
                // TODO: select @ts-ignore or @ts-expect-error via option
                const comment = `
//  @ts-ignore with: ${message}
`;
                return fixer.insertTextBeforeRange(
                  [diagnostic.start!, diagnostic.start! + diagnostic.length!],
                  comment
                );
              },
            });
          }
        });
      },
    };
  },
});
