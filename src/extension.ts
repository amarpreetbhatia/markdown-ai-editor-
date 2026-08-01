import * as vscode from 'vscode';
import { registerManagedEngine, showManagedEngineStatus, startManagedEngine, stopManagedEngine } from './managedEngine';

export async function activate(context: vscode.ExtensionContext) {
  registerManagedEngine(context);
  const statusDisposable = vscode.commands.registerCommand('markdownAi.showLocalModelStatus', () => showManagedEngineStatus(context));
  // Register Command: Fix Grammar
  const fixGrammarDisposable = vscode.commands.registerCommand('markdownAi.fixGrammar', async () => {
    await processSelectedText(
      context,
      'You are an expert editor. Fix all spelling, grammar, and typos in the text. Improve clarity while preserving the original meaning and markdown formatting. Return ONLY the revised text with no intro, outro, or conversational remarks.'
    );
  });

  // Register Command: Format Notes
  const formatNotesDisposable = vscode.commands.registerCommand('markdownAi.formatNotes', async () => {
    await processSelectedText(
      context,
      'You are a Markdown formatting assistant. Structure the raw notes using bullet points, bolding key concepts, and clear headers where appropriate. Return ONLY the formatted Markdown text with no explanations.'
    );
  });

  context.subscriptions.push(fixGrammarDisposable, formatNotesDisposable, statusDisposable);
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

/**
 * Executes AI API request on selected text and applies edits.
 */
async function processSelectedText(context: vscode.ExtensionContext, systemPrompt: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active text editor found.');
    return;
  }

  const selection = editor.selection;
  const targetText = editor.document.getText(selection.isEmpty ? undefined : selection);

  if (!targetText || targetText.trim().length === 0) {
    vscode.window.showInformationMessage('Please select text to process.');
    return;
  }

  const config = vscode.workspace.getConfiguration('markdownAi');
  const model = config.get<string>('model', 'llama-3.2-1b-instruct');

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Markdown AI: Processing text...',
      cancellable: true,
    },
    async (progress, token) => {
      try {
        const apiBaseUrl = await getApiBaseUrl(context);
        console.log(`Using API Base URL: ${apiBaseUrl}`);
        const controller = new AbortController();
        token.onCancellationRequested(() => controller.abort());

        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: targetText },
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

        const targetRange = selection.isEmpty
          ? new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(editor.document.getText().length)
            )
          : selection;

        await editor.edit((editBuilder) => {
          editBuilder.replace(targetRange, resultText);
        });

        vscode.window.setStatusBarMessage('✨ Text updated by local AI', 3000);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          vscode.window.showInformationMessage('Operation canceled.');
        } else {
          const msg = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Markdown AI Error: ${msg}`);
        }
      }
    }
  );
}

export function deactivate() {
  stopManagedEngine();
}
