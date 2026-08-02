# Use the commands

Use the **Markdown AI** commands from the editor right-click menu or Command Palette in Markdown and plain-text editors. Select the exact text you want to transform. If nothing is selected, the extension asks whether to transform the entire document; choose **Transform entire document** or **Cancel** before any text is sent to the model.

Each command replaces the selected text in one editor edit. Review the result, especially names and facts, and press ++ctrl+z++ (or ++cmd+z++ on macOS) to undo it.

## Fix Grammar & Refine

Shortcut: ++ctrl+m++ then ++f++ (Windows/Linux), or ++cmd+m++ then ++f++ (macOS).

Corrects spelling, grammar, punctuation, and clarity while preserving the original meaning and Markdown.

```markdown
the releese notes is ready but it need one more review.
```

Becomes a polished version of the same sentence without changing its facts.

## Structure as Clean Markdown

Shortcut: ++ctrl+m++ then ++c++ (Windows/Linux), or ++cmd+m++ then ++c++ (macOS).

Turns rough notes into readable Markdown with useful headings, lists, emphasis, spacing, and hierarchy. It keeps the source meaning and does not fill in missing details.

```text
launch tasks update docs test installer tell support friday
```

The result is a structured Markdown draft you can refine to match your team's conventions.

## Make a Skill

Shortcut: ++ctrl+m++ then ++s++ (Windows/Linux), or ++cmd+m++ then ++s++ (macOS).

Creates a standalone `SKILL.md` from the selected process or guidance. It includes YAML frontmatter with `name` and `description`, followed by a reusable workflow, decisions, and quality checks. Missing details are kept as assumptions or questions instead of being fabricated.

For example, select notes describing how a team prepares release notes. The result can become a reusable skill with steps for gathering changes, drafting the notes, reviewing facts, and publishing.

## Create PRD

Shortcut: ++ctrl+m++ then ++p++ (Windows/Linux), or ++cmd+m++ then ++p++ (macOS).

Creates a practical Markdown product requirements document. It organizes the supplied content into a problem statement, goals, non-goals, users, requirements, user stories, acceptance criteria, risks, and open questions. Details not present in the source stay clearly labeled as assumptions or open questions.

For example, select a feature brainstorm about offline editing. The result is a PRD draft that gives the team a clear starting point without claiming unprovided decisions are final.

## Selection, cancellation, and undo

Selected text is transformed immediately. With no selection, choose **Transform entire document** to replace the document or **Cancel** to leave it unchanged. The progress notification can cancel the request before a result is applied. Once an edit is applied, use ++ctrl+z++ or ++cmd+z++ to restore the original text.
