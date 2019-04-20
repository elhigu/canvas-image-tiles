import {
    CSSPlugin,
    FuseBox,
    Sparky,
    WebIndexPlugin,
} from "fuse-box"

Sparky.context(() => {
    return FuseBox.init({
        debug: true,

        globals: { default: "*" },

        homeDir: "src",
        output: "dist/$name.js",
        target: "browser@es6",

        plugins: [
            WebIndexPlugin({
                appendBundles: true,
                template: "src/index.html",
            }),
            CSSPlugin({
                bundle: "canvas-image-tiles.css",
            }),
        ],
    })
})

Sparky.task("default", context => {
    const fuse = context
    fuse.dev()
    fuse
        .bundle("canvas-image-tiles")
        .instructions(" > app.ts")
        .hmr({reload : true})
        .watch()
    fuse.run()
})

Sparky.task("clean", async context => {
    await Sparky.src("./dist")
        .clean("dist/")
        .exec();
})
