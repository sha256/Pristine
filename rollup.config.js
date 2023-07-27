import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";

const source = {
    input: 'src/pristine',
    output: {
        file: 'dist/pristine.js',
        format: 'umd',
        name: 'Pristine'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        })
    ]
};

const minified = {
    input: 'src/pristine',
    output: {
        file: 'dist/pristine.min.js',
        format: 'umd',
        name: 'Pristine'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
        terser()
    ]
};

export  default [source, minified];
