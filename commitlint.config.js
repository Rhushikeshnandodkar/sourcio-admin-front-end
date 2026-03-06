module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, missing semi-colons, etc.)
        "refactor", // Code refactoring
        "test", // Adding or updating tests
        "chore", // Maintenance tasks
        "revert", // Reverting previous commits
      ],
    ],
  },
};
