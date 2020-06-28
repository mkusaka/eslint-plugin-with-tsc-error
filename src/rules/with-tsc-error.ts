import {
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/experimental-utils";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

export const withTscErrors = createRule({
  name: "with-tsc-errors",
  meta: {
    type: "suggestion",
    docs: {
      description: "",
      category: "Best Practices",
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      ArrowFunctionExpression:
        "Please annotate this parameter with the correct one. This parameter is inferred as any type.",
      FunctionExpression:
        "Please annotate this parameter with the correct one. This parameter is inferred as any type.",
      FunctionDeclaration:
        "Please annotate this parameter with the correct one. This parameter is inferred as any type.",
      ArrayPattern:
        "Please annotate this array with the correct one. This array is inferred as any type.",
      ClassProperty:
        "Please annotate this property with the correct one. This property is inferred as any type.",
      TSIndexSignature:
        "Please annotate this signature with the correct one. This signature is inferred as any type.",
      ObjectPattern:
        "Please annotate this object with the correct one. This object is inferred as any type.",
      TSPropertySignature:
        "Please annotate this property signature with the correct one. This property signature is inferred as any type.",
      VariableDeclarator:
        "Please annotate this variable with the correct one. This variable is inferred as any type.",
      VariableDeclaratorObject:
        "Please annotate this variable with the correct one. This variable is inferred as any type.",
      VariableDeclaratorArray:
        "Please annotate this variable with the correct one. This variable is inferred as any type.",
      AsWithAnyKeyword:
        "Please annotate this as assert with the correct one. This as assert is inferred as any type.",
      AnyReturnType:
        "Please annotate this function return type with the correct one. This function return type is inferred as any type.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const {
      program,
      esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap,
    } = ESLintUtils.getParserServices(context);
    // api book p25
    const sourceFile = program.getSourceFile(context.getFilename());
    // なんかいい感じにstartとendを元にtsのnodeを取り出し、それをesのnodeにしてそちらのstartとendを取り出す感じ
    // それの辞書型を作って、↓の探索のときにendとかで照合させる感じでやる
    const error = {
      start: 100,
      end: 200,
    };
    function visit(node: ts.Node) {
      const nodestart = node.pos;
      const nodeend = node.end;
      if (nodestart === error.start && nodeend === error.end) {
        console.log(node);
        const isThisIs = tsNodeToESTreeNodeMap.get(node);
        const hoge = [1.1];
        const [start, end] = isThisIs.range;
      }
      // ts.forEachChild のなかで再帰的にvisitを使う
      ts.forEachChild(node, visit);
    }
    if (sourceFile) {
      visit(sourceFile);
    }
    // ↓で対象一覧を取った後にvisitかけて辞書にぶっこむほうが良いかも
    const allDiagnostics = ts.getPreEmitDiagnostics(
      program,
      program.getSourceFile(context.getFilename())
    );
    // program.emit のエラーも出したほうが良い？
    program.getSyntacticDiagnostics().forEach((diagnostic) => {
      if (!diagnostic) {
        return;
      }

      if (!diagnostic.file || !diagnostic.start) {
        return;
      }

      const position = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      // エラーを検出した位置
      const line = position.line + 1;
      const character = position.character + 1;
      console.log(diagnostic.file.fileName);
      console.log(`ErrorPosition: ${line}, ${character}`); // 検出したエラー内容
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(`ErrorMessage: ${message}`);
    });
    allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
      if (!diagnostic) {
        return;
      }

      if (!diagnostic.file || !diagnostic.start) {
        return;
      }

      const position = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      // エラーを検出した位置
      const line = position.line + 1;
      const character = position.character + 1;
      console.log(diagnostic.file.fileName);
      console.log(`ErrorPosition: ${line}, ${character}`); // 検出したエラー内容
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(`ErrorMessage: ${message}`);
    });

    context.getSourceCode();
    function report(
      location: TSESTree.Node,
      message:
        | "ArrowFunctionExpression"
        | "FunctionExpression"
        | "FunctionDeclaration"
        | "ArrayPattern"
        | "ClassProperty"
        | "TSIndexSignature"
        | "ObjectPattern"
        | "TSPropertySignature"
        | "VariableDeclarator"
        | "VariableDeclaratorArray"
        | "VariableDeclaratorObject"
        | "AsWithAnyKeyword"
        | "AnyReturnType"
    ): void {
      // 適当にdataとってmessage表示する何かをする
      // optionによって対象のエラー出すか出さないかを選択できる
      // advancedとeasyなoptionに分ける
      // easyはtsc optionレベル、advancedはtscのエラー数値レベル。後者は正規表現で質できるようにする
      context.report({
        node: location,
        messageId: message,
      });
    }
    const starts = allDiagnostics.filter((e) => {
      return e && e.file && e.start;
    });
    const startExpressions = starts.reduce<{ [key: string]: string }>(
      (prev, next) => {
        const message = ts.flattenDiagnosticMessageText(next.messageText, "\n");
        return {
          ...prev,
          [`${next.start},${(next.start || 0) + (next.length || 0)}`]: message,
        };
      },
      {}
    );
    const checker = program.getTypeChecker();

    function isTypeAnyType({ flags }: ts.Type) {
      return flags === ts.TypeFlags.Any;
    }

    return {
      "Program": function (node) {
        // @ts-ignore
        console.dir(node.range);
        // @ts-ignore
        if (startExpressions[`${node.range[0]},${node.range[1]}`]) {
          // @ts-ignore
          // astの関係でずれることがある
          // ので、多分startをfallback先にすると良い
          report(
            node,
            startExpressions[`${node.range[0]},${node.range[1]}`] as any
          );
        }
      },
    };
  },
});
