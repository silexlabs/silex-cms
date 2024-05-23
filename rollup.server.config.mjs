import typescript from '@rollup/plugin-typescript'
//import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

export default {
  input: 'src/server.ts',
  output: {
    file: 'dist/server.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['@silexlabs/silex'],
  plugins: [
    json(),
    typescript({
      tsconfig: 'tsconfig.server.json',
    }),
    //nodeResolve(), // Import modules from node_modules
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

