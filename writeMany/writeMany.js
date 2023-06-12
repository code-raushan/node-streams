const fs = require("node:fs/promises");

// general approach
// (
//     // heavily expensive operation
//     async()=>{
//         console.time('writeMany');
//         const fileHandle = await fs.open('test.txt', 'w');

//         for(let i=0; i<1000000; i++){
//             fileHandle.write(` ${i} `)
//         }
//         console.timeEnd('writeMany');
//     }
// )()

// streams approach - writable stream
// faster approach but utilises a lot of memory
// (async ()=>{
//     console.time('writeMany');
//     const fileHandle = await fs.open('test.txt', 'w');
//     const stream = fileHandle.createWriteStream() // creates a write stream
//     for(let i=0; i<1000000; i++){
//         const buff = Buffer.from(` ${i} `, 'utf-8');
//         stream.write(buff);
//     }
//     console.timeEnd('writeMany');
// })()

// optimising the streams approach

(async () => {
  console.time("writeMany");
  const fileHandle = await fs.open("test.txt", "w");
  const stream = fileHandle.createWriteStream(); //created the write stream
  // const buff = Buffer.from('hello')
  console.log(stream.writableHighWaterMark); //Return the value of highWaterMark passed when creating this Writable.

  // console.log(stream.writableLength)
  // stream.write(buff);
  // console.log(buff);
  // console.log(stream.writableLength);

  let i = 0;

  const writeMany = () => {
    while (i < 1000000) {
      const buff = Buffer.from(` ${i} `, "utf-8");
      if (i === 999999) {
        return stream.end(buff); //ending the stream
      }
      // good way
      if (!stream.write(buff)) break; // if stream.write(buff) exceeds the writableHighWaterMark, then break the operation and rest will be handled by the drain event
      i++;
    }
  };

  writeMany();

  // drain event
  // resume the loop once the stream's internal buffer is emptied.
  stream.on("drain", () => {
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
    fileHandle.close();
  });
})();
