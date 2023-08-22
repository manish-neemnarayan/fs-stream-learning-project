const { error } = require("console");
const fs = require("fs/promises");

// open(32) file descriptor
// read or write

(async () => {
  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  // command functions
  /**
   * Creates a file at the given filePath.
   *
   * @param {string} filePath - The path of the file to create.
   * @returns {Promise<void>} - A promise that resolves when the file is created.
   */
  const createFile = async (filePath) => {
    try {
      const existedFileHandle = await fs.open(filePath, "r");
      await existedFileHandle.close();
    } catch (error) {
      // error means file doesn't exist
      // create a file
      const newFileHandle = await fs.open(filePath, "w");
      console.log("File created" + filePath);
      await newFileHandle.close();
    }
  };

  /**
   * Deletes a file at the specified file path.
   *
   * @param {string} filePath - The path of the file to be deleted.
   * @return {Promise<void>} - A promise that resolves when the file is successfully deleted.
   */
  const deleteFile = async (filePath) => {
    try {
      await fs.unlink(filePath).then(() => {
        console.log("File deleted" + filePath);
      });
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Renames a file from the old path to the new path.
   *
   * @param {string} oldPath - The old path of the file.
   * @param {string} filePath - The new path of the file.
   * @return {Promise<void>} - A Promise that resolves when the file is renamed successfully.
   */
  const renameFile = async (oldPath, filePath) => {
    try {
      await fs.rename(oldPath, filePath).then(() => {
        console.log("File renamed" + filePath);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addToFile = async (filePath, content) => {
    try {
      console.log(filePath, content);
      const existedFileHandle = await fs.open(filePath, "a");

      if (existedFileHandle) {
        await fs.appendFile(filePath, content).then(() => {
          console.log("File added " + filePath);
        });

        await existedFileHandle.close();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // file handler for command file
  const commandFileHandler = await fs.open("./command.txt", "r");

  // emitting event of commandFileHandler coz all file handlers are just extension of event-emitter
  commandFileHandler.on("change", async () => {
    // reading the size of file handler
    const size = (await commandFileHandler.stat()).size;
    // allocate the size to buffer
    const buff = Buffer.alloc(size);
    // the location at which we want to start filling our buffer
    const offset = 0;
    // how many bytes we want to read
    const length = buff.byteLength;
    // the position at which we want to start reading from file
    const position = 0;

    // reading the whole file
    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf8");
    // decoder 01 => meanigful
    // enoder meanigful => 01

    // create a file
    // create a file <filpath>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      await createFile(filePath);
    }

    // delete a file
    // delete the file <filpath>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      await deleteFile(filePath);
    }

    //rename a file
    // rename the file <oldpath> <newpath>
    if (command.includes(RENAME_FILE)) {
      const filePath = command.substring(RENAME_FILE.length + 1).split(" ");
      console.log(filePath);
      await renameFile(filePath[0], filePath[1]);
    }

    // add to a file
    // add to the file <filpath> <content>
    if (command.includes(ADD_TO_FILE)) {
      const filePath = command.substring(ADD_TO_FILE.length + 1).split(" ");
      const content = command.substring(
        ADD_TO_FILE.length + 1 + filePath[0].length
      );
      await addToFile(filePath[0], content);
    }
  });

  // watching the file
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      await commandFileHandler.emit("change");
    }
  }
})();
