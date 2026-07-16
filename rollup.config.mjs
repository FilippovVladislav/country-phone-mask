import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import url from 'rollup-plugin-url';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: false,
            exports: 'named',
            plugins: [
                terser()
            ]
        },
        {
            file: 'dist/index.esm.js',
            format: 'es',
            sourcemap: false,
            exports: 'named',
            plugins: [
                terser()
            ]
        }
    ],
    plugins: [
        postcss({
            extract: true,
            minimize: true,
            sourceMap: false
        }),
        url({
            include: ['**/*.svg'],
            exclude: ['src/icons/sprite.svg'],
            limit: 0,
            fileName: '[name].[hash][extname]',
            destDir: 'dist/icons'
        }),
        typescript({
            tsconfig: './tsconfig.json',
            clean: true
        }),
        copy({
            targets: [
                { src: 'src/icons/sprite.svg', dest: 'dist/icons' }
            ]
        })
    ]
};
