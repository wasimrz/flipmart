const formidable = require("formidable");
const path = require("path");

const Boom = require("@hapi/boom");

//HELPER FUNCTIONS FOR CONTROLLERS
export const getFilesAndFieldsFromRequest = (req: any) => {
  require("events").EventEmitter.prototype._maxListeners = 100;
  return new Promise(function (resolve, reject) {
    const form = formidable({ multiples: true });

    //changing temp file location to server
    form.uploadDir = path.join(__dirname, "../../public/tmp/");

    form.on("file", function (name: string, file: any) {
      // // The following does not file type work on windows laptop as client.
      // // MS Excel changes 'txt/csv' to 'application/vnd.ms-excel'
      // if (file.mimetype != "text/csv") {
      //   return reject(new Error("Please upload a csv file."));
      // }
    });

    form.parse(req, async function (err: any, fields: any, files: any) {
      if (err) {
        console.log("err");
        return reject(err.message);
      }

      resolve({
        fields: fields,
        files: files,
      });
    });
  });
};
