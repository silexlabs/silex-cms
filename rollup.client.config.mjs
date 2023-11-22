import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/client.ts',
  output: {
    file: 'dist/client.js',
    format: 'es',
    sourcemap: true,
  },
  external: ['@silexlabs/silex', 'grapesjs'],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.client.json',
    }),
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
    resolve({
      customResolveOptions: {
        moduleDirectories: [
          'node_modules',
        ],
      },
    }),
  ],
}
