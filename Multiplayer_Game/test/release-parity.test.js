import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';

test('desktop and hosted copies ship identical shared gameplay modules',()=>{
  for(const name of readdirSync(new URL('../public/',import.meta.url)).filter(name=>name.endsWith('.js')&&name!=='app.js')){
    const read=root=>readFileSync(new URL(`../${root}/${name}`,import.meta.url),'utf8').replaceAll('\r\n','\n');
    assert.equal(read('public'),read('hosted/public'),name+' must match in both versions');
  }
});
