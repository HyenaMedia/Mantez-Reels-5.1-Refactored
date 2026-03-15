// Note: CRACO's build uses CRA's BaseConfig which already registers eslint-plugin-react.
// To avoid "Plugin 'react' conflicted" error, this config does NOT extend plugin:react/*.
// CRA's BaseConfig handles React-specific rules. We only customize non-conflicting rules here.
//
// react-hooks plugin: CRA ships eslint-plugin-react-hooks transitively, so we can declare
// the plugin here without installing it separately. This enables exhaustive-deps warnings
// which catch stale-closure bugs like the useResizablePanel issue found in the audit.
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  // eslint-plugin-react-hooks is a CRA transitive dep — available without explicit install
  plugins: ['react-hooks'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-unused-vars': ['warn', {
      varsIgnorePattern: '^(_|React$)',
      argsIgnorePattern: '^_',
      caughtErrors: 'none',
    }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-case-declarations': 'error',
    'no-useless-catch': 'error',
    'no-useless-escape': 'warn',

    // ── React Hooks rules ──────────────────────────────────────────────────
    // Enforces Hook call rules (no conditional hooks, no loops, etc.)
    'react-hooks/rules-of-hooks': 'error',
    // Warns when useEffect/useCallback/useMemo deps arrays are missing values.
    // This would have caught the stale-closure bug in useResizablePanel (width dep)
    // and the FloatingInspector listener re-registration bug (size dep).
    // Set to 'warn' (not 'error') to avoid blocking builds on pre-existing code.
    'react-hooks/exhaustive-deps': ['warn', {
      // Allow refs and stable dispatcher functions to be omitted from deps
      additionalHooks: '(useCallback|useMemo|useEffect)',
    }],
  },
  ignorePatterns: ['build/', 'node_modules/', 'public/service-worker.js'],
};
