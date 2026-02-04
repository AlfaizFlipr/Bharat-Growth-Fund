# React + TypeScript + Vite.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https:
- [@vitejs/plugin-react-swc](https:

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    
    ...tseslint.configs.recommendedTypeChecked,
    
    ...tseslint.configs.strictTypeChecked,
    
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https:

```js

import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    
    
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
