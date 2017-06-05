# snog

Experimental hybrid of a [snapshot](http://facebook.github.io/jest/docs/en/snapshot-testing.html) and a log.

## How does it work?

First add it to your project with `npm install --save snog`

Then add a few snogs here and there in your code. Eg.

```js
const snog = require('snog')


// ... lots of code ...

snog({ a, b, c })

// ... more code ...

snog({ d, e })
```

Whenever this code runs, it will record a snapshot of whatever you give it (eg. `{ a, b, c}`).

Then boot up the `snog-diff` viewer to watch the log messages as your code runs:

```
npx snog-diff --watch
```

Now, whenever you run your code, we compare the new logs against the recorded ones. So you can make a change and see what changed!

For extra ✨ try running `snog-diff` in one terminal, and `nodemon yourscript.js` in another.

## Updating the reference

There are 2 sets of files, which are counterparts laid out like this:

```
__snog__/
├── latest
│   └── <srcdir>
│       └── <srcfile>.js
│           ├── <func>-<line>.txt
│           └── <func>-<line>.txt
└── ref
    └── <srcdir>
        └── <srcfile>.js
            ├── <func>-<line>.txt
            └── <func>-<line>.txt
```

The files in `__snog__/latest` represent the logs from the most recent run, and will be compared with the file of the same name in `__snog__/ref`.

When the `snog-diff` cli notifies you of a diff, it also asks whether you'd like to update the reference. This is your way of saying "I like what I see". So subsequent runs will be compared against the new reference.

## How does this relate to traditional snapshot tests or unit tests?

`snog` is intended for quick feedback in development. But it's quite easy to start with a `snog` and turn it into a test. For example, use the first snog to record the args being passed into a function, and the second one to record the result. Once it looks right in your snog-logs, paste it into your test suite.

## Does `snog` have any bugs?

Oh my word yes it does. And there's still heaps of improvements to make. If this project sounds interesting to you I'd love to hear your feedback!

## License

MIT
