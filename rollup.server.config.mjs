import typescript from '@rollup/plugin-typescript';
import eslint from '@rollup/plugin-eslint'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/server.ts',
  output: {
    file: 'dist/server.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['@silexlabs/silex'],
  plugins: [
    typescript(), // Supports typescript
    nodeResolve(), // Import modules from node_modules
    eslint(), // Linting
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
  ],
};

