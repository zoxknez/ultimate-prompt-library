// Preload for runner tests: any network call terminates the process with exit code 97.
globalThis.fetch = () => {
  process.stderr.write('NETWORK CALL ATTEMPTED\n');
  process.exit(97);
};
