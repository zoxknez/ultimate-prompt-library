# Security Policy

## Scope

This policy covers the **repository itself**: its scripts, GitHub Actions workflow, generated indexes and anything that runs when someone clones the repository and uses the tooling.

Ultimate Prompt Library consists of text prompts. The prompts do not run code on their own, but the tooling does.

## Reporting a vulnerability

If you find a security problem in the repository tooling or workflows:

1. **Do not open a public issue with exploit details.**
2. Use GitHub's **private vulnerability reporting** ("Security" tab → "Report a vulnerability") if it is enabled for this repository.
3. If it is not enabled, open a short public issue that asks the maintainers for a private contact channel, without including sensitive details.

Please include a description of the issue, steps to reproduce, the affected files and the potential impact. We will acknowledge the report and keep you informed about the fix.

## Using the security prompts

The cybersecurity prompts in this library are intended for **defensive review, authorized testing, secure development and threat modeling**.

- **Use security prompts only on systems you own or are explicitly authorized to test.**
- Follow the rules of engagement, scope and legal requirements that apply to your work.

## Limitations

- Prompts are **not a guarantee of security**. An AI-assisted review can miss issues or report false positives; results must be verified.
- Prompts **do not replace a professional security assessment**, penetration test or audit where one is required.
- Do not share secrets, credentials or sensitive personal data with AI systems unless you are allowed to and understand how that data is handled.
