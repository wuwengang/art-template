const assert = require('assert');
const Compiler = require('../../src/compile/compiler');
const defaults = require('../../src/compile/defaults');
const tplTokens = require('../../src/compile/tpl-tokens');
const syntaxEval = require('../../src/compile/adapter/syntax.native');

const compress = ({ source }) => {
    return source
        .replace(/\s+/g, ` `)
        .replace(/<!--[\w\W]*?-->/g, ``);
};

describe('#compile/compiler', () => {

    describe('importContext', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = defaults.$extend(options);
                options.source = '';
                const compiler = new Compiler(options);
                compiler.importContext(code);
                result.$out = '""';
                assert.deepEqual(result, compiler.context);
            });
        };

        test('value', {
            value: '$data.value'
        });

        test('if', {});
        test('for', {});
        test('$data', {});
        test('$imports', {});

        test('print', { print: "function(){var text=''.concat.apply('',arguments);return $out+=text}" });
        test('include', { include: "function(src,data){return $out+=$imports.$include(src,data||$data,null,\"/\")}" })

        test('$escape', { $escape: '$imports.$escape' });
        test('$include', { $include: '$imports.$include' });

        it('imports', () => {
            const options = defaults.$extend({});
            options.imports.Math = Math;
            options.source = '';
            const compiler = new Compiler(options);
            compiler.importContext('Math');
            assert.deepEqual({
                $out: '""',
                Math: '$imports.Math'
            }, compiler.context);
        });

    });


    // describe('parseString', () => {
    //     const test = (code, result, options) => {
    //         it(code, () => {
    //             options = defaults.$extend(options);
    //             options.source = '';
    //             const compiler = new Compiler(options);
    //             const token = tplTokens.parser(code, [syntaxEval]);
    //             compiler.parseString(token[0]);
    //             assert.deepEqual(result, compiler.scripts.map(script => script.code));
    //         });
    //     };

    //     // raw
    //     test('hello', ['$out+="hello"']);
    //     test('\'hello\'', ['$out+="\'hello\'"']);
    //     test('"hello    world"', ['$out+="\\"hello    world\\""']);
    //     test('<div>hello</div>', ['$out+="<div>hello</div>"']);
    //     test('<div id="test">hello</div>', ['$out+="<div id=\\"test\\">hello</div>"']);

    //     // compress
    //     test('  hello  ', ['$out+=" hello "'], { compress });
    //     test('\n  hello  \n\n.', ['$out+=" hello ."'], { compress });
    //     test('"hello    world"', ['$out+="\\"hello world\\""'], { compress });
    //     test('\'hello    world\'', ['$out+="\'hello world\'"'], { compress });
    // });


    // describe('parseExpression', () => {
    //     const test = (code, result, options) => {
    //         it(code, () => {
    //             options = defaults.$extend(options);
    //             options.source = '';
    //             const token = tplTokens.parser(code, [syntaxEval]);
    //             const compiler = new Compiler(options);
    //             compiler.parseExpression(token[0]);
    //             assert.deepEqual(result, compiler.scripts.map(script => script.code));
    //         });
    //     };

    //     // v3 compat
    //     test('<%=value%>', ['$out+=$escape(value)']);
    //     test('<%=#value%>', ['$out+=value']);

    //     // v4
    //     test('<%-value%>', ['$out+=value']);
    //     test('<%- value %>', ['$out+= value']);

    //     test('<%=value%>', ['$out+=value'], { escape: false });
    //     test('<%-value%>', ['$out+=value'], { escape: false });

    //     test('<%if (value) {%>', ['if (value) {']);
    //     test('<% if (value) { %>', [' if (value) { ']);
    //     test('<%    if ( value ) {    %>', ['    if ( value ) {    '], {
    //         compress
    //     });


    //     describe('parseExpression', () => {
    //         test('<%@value%>', ['$out+=value'], {
    //             parseExpression: ({ source }) => {
    //                 return source.replace(/<%@(.*?)%>/, '$out+=$1');
    //             }
    //         });
    //     });


    //     describe('compileDebug', () => {
    //         test('<%-value%>', ['$line=[1,\"<%-value%>\"]', '$out+=value'], {
    //             compileDebug: true
    //         });
    //     });

    // });

    describe('addSource', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.scripts.map(script => script.code));
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%=value%>', ['$out+=$escape(value)']);

        test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

    });



    describe('checkExpression', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.checkExpression(code));
            });
        };

        test('if(a){', true);
        test('for(var i in d){', true);
        test('list.forEach(function(a,b){', true);
        test('list.forEach((a,b)=>{', true);
        test('}else if(a){', true);
        test('}else{', true);
        test('}', true);

        test('if(a){}', true);
        test('for(var i in d){}', true);
        test('list.forEach(function(a,b){})', true);
        test('list.forEach((a,b)=>{})', true);

        test('@if(a){', false);
        test('@for(var i in d){', false);
        test('@list.forEach(function(a,b){', false);
        test('@list.forEach((a,b)=>{', false);

    });



    describe('build', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = defaults.$extend(options);
                options.source = code;
                const compiler = new Compiler(options);
                compiler.build();
                assert.deepEqual(result, compiler.scripts.map(script => script.code));
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%=value%>', ['$out+=$escape(value)']);
        test('hello <%=value%>.', ['$out+="hello "', '$out+=$escape(value)', '$out+="."']);
        test('<%-value%>', ['$out+=value']);
        test('hello <%-value%>.', ['$out+="hello "', '$out+=value', '$out+="."']);

        test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

        describe('compileDebug', () => {
            test('<%-value%>', ['$line=[1,\"<%-value%>\"]', '$out+=value'], {
                compileDebug: true
            });
        });


        describe('CompileError`', () => {
            it('throw', () => {
                const options = Object.create(defaults);
                options.source = 'hello\n\n<% a b c d %>';
                const compiler = new Compiler(options);

                try {
                    compiler.build();
                } catch (e) {
                    assert.deepEqual('CompileError', e.name);
                    assert.deepEqual(3, e.line);
                }
            });
        });

    });




});