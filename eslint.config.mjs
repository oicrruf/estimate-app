import angular from 'angular-eslint';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.angular/**'] },
  ...angular.configs.tsRecommended.map(config => ({ ...config, files: ['**/*.ts'] })),
  { files: ['**/*.ts'], processor: angular.processInlineTemplates },
  ...[...angular.configs.templateRecommended, ...angular.configs.templateAccessibility].map(config => ({ ...config, files: ['**/*.html'] })),
];
