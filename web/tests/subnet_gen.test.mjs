// node web/tests/subnet_gen.test.mjs — every generated problem must accept its own answer
// and reject an obviously wrong one, across thousands of random draws.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(new URL("../app/static/js/" + f, import.meta.url), "utf8");
const asUrl = (src) => "data:text/javascript," + encodeURIComponent(src);
// Browsers resolve "netlab/subnet-math" through the page's import map; here we inline it.
const mathUrl = asUrl(read("subnet-math.js"));
const { KINDS, generate } = await import(asUrl(read("subnet-gen.js").replace('"netlab/subnet-math"', JSON.stringify(mathUrl))));

let n = 0;
for (const kind of Object.keys(KINDS)) {
  for (const range of ["last", "any"]) {
    for (let i = 0; i < 1500; i++) {
      const p = generate(kind, range);
      assert.ok(p.prompt && p.work && p.fields.length, kind);
      assert.ok(!/undefined|NaN/.test(p.prompt + p.work), `${kind}: ${p.prompt}`);
      for (const f of p.fields) {
        const answer = f.sample ?? f.want;
        assert.ok(f.ok(answer), `${kind} rejects its own answer ${answer}: ${p.prompt}`);
        assert.ok(!f.ok("0.0.0.0/garbage"), `${kind} accepts garbage`);
        if (f.type === "yesno") assert.ok(!f.ok(answer === "yes" ? "no" : "yes"), kind);
      }
      n++;
    }
  }
}
console.log(`subnet-gen: ${n} generated problems all self-consistent`);
