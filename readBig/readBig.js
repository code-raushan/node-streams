const fs = require('node:fs/promises');

// (
//     async()=>{
//         const fileHandleRead = await fs.open('test.txt', 'r');
//         const fileHandleWrite = await fs.open('dest.txt', 'w');
//         const streamRead = fileHandleRead.createReadStream({highWaterMark: 64*1024});
//         const streamWrite = fileHandleWrite.createWriteStream();

//         console.time('readBig');
//         streamRead.on('data', (chunk)=>{
//             streamWrite.write(chunk)
//             // console.log(chunk.toString());
//             // console.log(typeof chunk); //object
//         })
//         console.timeEnd('readBig')
//     }
// )()

// optimised version
(
    async () => {
        const fileHandleRead = await fs.open('test.txt', 'r');
        const fileHandleWrite = await fs.open('dest.txt', 'w');

        const streamRead = fileHandleRead.createReadStream({
            highWaterMark: 64 * 1024,
        });
        const streamWrite = fileHandleWrite.createWriteStream();

        streamRead.on("data", (chunk) => {
            if (!streamWrite.write(chunk)) {
                streamRead.pause() // causes to stop emmiting 'data' event;
            }
            streamWrite.on("drain", () => {
                streamRead.resume(); //again resume emitting 'data' event;
            })
        })
    }
)();

