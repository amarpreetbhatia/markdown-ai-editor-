import * as vscode from 'vscode';
import { registerManagedEngine, showManagedEngineStatus, startManagedEngine, stopManagedEngine } from './managedEngine';

export const TRANSFORMATION_PROMPTS = {
  fixGrammar: `You are an expert English editor working with Markdown. Correct spelling, grammar, punctuation, and clarity while preserving the author's meaning, source facts, and Markdown structure. Do not invent, remove, or alter factual information. Return only transformed Markdown with no introduction, explanation, or commentary outside the result.`,
  cleanMarkdown: `You are a Markdown formatting assistant. Transform the supplied content into clean, readable Markdown with sensible headings, lists, emphasis, spacing, and hierarchy while preserving its meaning, source facts, and existing Markdown structure where appropriate. Do not invent missing information or add commentary. Return only transformed Markdown with no introduction, explanation, or commentary outside the result.`,
  skill: `Create a standalone SKILL.md from the supplied content, following the VS Code skill format. Start with YAML frontmatter containing a concise name and description, then provide a reusable workflow with clear steps, decisions, and quality checks. Preserve source facts and do not invent missing details; express missing details as questions or assumptions when they are necessary. Return only transformed Markdown with no introduction, explanation, or commentary outside the result.`,
  prd: `Create a practical Markdown product requirements document from the supplied content. Include clearly labeled sections for problem statement, goals, non-goals, users, requirements, user stories, acceptance criteria, risks, and open questions. Preserve source facts, do not invent missing information, and use explicit assumptions or open questions where details are absent. Return only transformed Markdown with no introduction, explanation, or commentary outside the result.`,
} as const;

export async function activate(context: vscode.ExtensionContext) {
  registerManagedEngine(context);
  const statusDisposable = vscode.commands.registerCommand('markdownAi.showLocalModelStatus', () => showManagedEngineStatus(context));
  const fixGrammarDisposable = vscode.commands.registerCommand('markdownAi.fixGrammar', async () => {
    await processSelectedText(
      context,
      'Fix Grammar & Refine',
      TRANSFORMATION_PROMPTS.fixGrammar
    );
  });

  const formatNotesDisposable = vscode.commands.registerCommand('markdownAi.formatNotes', async () => {
    await processSelectedText(
      context,
      'Convert to Clean Markdown',
      TRANSFORMATION_PROMPTS.cleanMarkdown
    );
  });

  const structureMarkdownDisposable = vscode.commands.registerCommand('markdownAi.structureMarkdown', async () => {
    await processSelectedText(
      context,
      'Structure as Clean Markdown',
      TRANSFORMATION_PROMPTS.cleanMarkdown
    );
  });

  const makeSkillDisposable = vscode.commands.registerCommand('markdownAi.makeSkill', async () => {
    await processSelectedText(
      context,
      'Make a Skill',
      TRANSFORMATION_PROMPTS.skill
    );
  });

  const createPrdDisposable = vscode.commands.registerCommand('markdownAi.createPrd', async () => {
    await processSelectedText(
      context,
      'Create PRD',
      TRANSFORMATION_PROMPTS.prd
    );
  });

  context.subscriptions.push(
    fixGrammarDisposable,
    formatNotesDisposable,
    structureMarkdownDisposable,
    makeSkillDisposable,
    createPrdDisposable,
    statusDisposable
  );
}

/**
 * Resolves API URL based on user settings (Managed Engine vs Custom Endpoint).
 */
async function getApiBaseUrl(context: vscode.ExtensionContext): Promise<string> {
  const config = vscode.workspace.getConfiguration('markdownAi');
  const useManaged = config.get<boolean>('useManagedEngine', true); 

  if (useManaged) {
    return await startManagedEngine(context);
  } else {
    return config.get<string>('customApiBaseUrl', 'http://localhost:8080/v1');
  }
}

function throwIfCanceled(token: vscode.CancellationToken, controller: AbortController): void {
  if (!token.isCancellationRequested) {
    return;
  }

  controller.abort();
  const error = new Error('Operation canceled.');
  error.name = 'AbortError';
  throw error;
}

/**
 * Resolves the selected text, or confirms replacing the entire document.
 */
export async function getTargetText(editor: vscode.TextEditor): Promise<{ text: string; range: vscode.Range } | undefined> {
  const selection = editor.selection;
  if (!selection.isEmpty) {
    return { text: editor.document.getText(selection), range: selection };
  }

  const choice = await vscode.window.showWarningMessage(
    'No text is selected. Do you want to transform the entire document?',
    'Transform entire document',
    'Cancel'
  );

  if (choice !== 'Transform entire document') {
    return undefined;
  }

  const text = editor.document.getText();
  return {
    text,
    range: new vscode.Range(
      editor.document.positionAt(0),
      editor.document.positionAt(text.length)
    ),
  };
}

/**
 * Executes an AI API request for selected text and applies one replacement edit.
 */
export async function processSelectedText(
  context: vscode.ExtensionContext,
  title: string,
  systemPrompt: string
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active text editor found.');
    return;
  }

  const target = await getTargetText(editor);
  if (!target) {
    return;
  }

  if (!target.text || target.text.trim().length === 0) {
    vscode.window.showInformationMessage('Please select text to process.');
    return;
  }

  const config = vscode.workspace.getConfiguration('markdownAi');
  const model = config.get<string>('model', 'llama-3.2-1b-instruct');

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Markdown AI: ${title}`,
      cancellable: true,
    },
    async (progress, token) => {
      const controller = new AbortController();
      const cancellationDisposable = token.onCancellationRequested(() => controller.abort());

      try {
        const apiBaseUrl = await getApiBaseUrl(context);
        throwIfCanceled(token, controller);
        console.log(`Using API Base URL: ${apiBaseUrl}`);

        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: target.text },
            ],
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const resultText = data.choices?.[0]?.message?.content?.trim();
        if (!resultText) {
          throw new Error('Received empty response from local model.');
        }

        throwIfCanceled(token, controller);
        await editor.edit((editBuilder) => {
          editBuilder.replace(target.range, resultText);
        });

        vscode.window.setStatusBarMessage('✨ Text updated by local AI', 3000);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          vscode.window.showInformationMessage('Operation canceled.');
        } else {
          const msg = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Markdown AI Error: ${msg}`);
        }
      } finally {
        cancellationDisposable.dispose();
      }
    }
  );
}

export function deactivate() {
  stopManagedEngine();
}
