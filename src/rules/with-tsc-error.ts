import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

type SchemaType = {
  tsCommentType: "ts-ignore" | "ts-expect-error";
};

const defaultOptions: SchemaType = {
  tsCommentType: "ts-ignore",
};

export const withTscErrors = createRule<[SchemaType], "message">({
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
    schema: [
      {
        type: "object",
        properties: {
          tsCommentType: {
            type: "string",
            enum: ["ts-ignore", "ts-expect-error"],
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: "code",
  },
  defaultOptions: [defaultOptions],
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
            const firstOfLineToken = diagnostic.file.getPositionOfLineAndCharacter(startLine, 0);
            const messageForComment = ts.flattenDiagnosticMessageText(diagnostic.messageText, "; ");
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
                const { tsCommentType } = context.options[0];
                const comment = `// @${tsCommentType} with: ${messageForComment}
`;
                return fixer.insertTextBeforeRange([firstOfLineToken, firstOfLineToken], comment);
              },
            });
          }
        });
      },
    };
  },
});
