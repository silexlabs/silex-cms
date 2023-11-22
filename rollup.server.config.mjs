import typescript from '@rollup/plugin-typescript'
import eslint from '@rollup/plugin-eslint'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import tslint from 'rollup-plugin-tslint'

export default {
  input: 'src/server.ts',
  output: {
    file: 'dist/server.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['@silexlabs/silex'],
  plugins: [

    // FIXME: Linting doesn't work
    /*
    tslint({
      configuration: './tsconfig.server.json',
    }),
    */
    // Tried this too
    /*
    eslint({
      tsconfig: 'tsconfig.server.json',
    }),
    */

    typescript({
      tsconfig: 'tsconfig.server.json',
    }),
    nodeResolve(), // Import modules from node_modules
    commonjs(), // Convert CommonJS modules to ES6 when importing node_modules
  ],
}

