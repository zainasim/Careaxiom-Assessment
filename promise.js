var app = require("express")();
const { rejects } = require("assert");
var bodyParser = require("body-parser");
const { Console } = require("console");
var https = require('https');
const { resolve } = require("path");
var url = require('url');
const { callbackify } = require("util");

//Set view engine to ejs
app.set("view engine", "ejs");

//Tell Express where we keep our index.ejs
app.set("views", __dirname + "/");

//Use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/I/want/title', (req, res) => {
    var qdata = req.query.address;
    var f_addr;
    var ddata = [];
    var results = [];
    if (!Array.isArray(qdata)) {      //checking if address is an array or not
        var parse = url.parse(qdata, true);
        if (!parse.protocol) {
            f_addr = "https://" + qdata;
        }
        else {
            f_addr = qdata;
        }
        getdata(f_addr)  //consuming promise
            .then(result => {
                ddata.push(qdata);
                results.push(result);
                res.render("result", { title: ddata, mesg: results });
            })
            .catch((e) => {
                console.log('Error: ' + e.message);
            });
    }
    else {  //if more than one address i.e. array
        f_addr = qdata;
        const promises = [];
        for (i = 0; i < f_addr.length; i++) {
            var temp = url.parse(f_addr[i], true);
            if (!temp.protocol) {
                f_addr[i] = "https://" + f_addr[i];
            }
            else {
                f_addr[i] = f_addr[i];
            }
            promises.push(getdata(f_addr[i]));
        }
        Promise.all(promises)         //checks if all promises has been either resolve or reject
            .then((result) => {
                //console.log("All done", results);
                //ddata = { title: qdata, mesg: results };
                res.render("result", { title: qdata, mesg: result });
            })
            .catch((e) => {
                // Handle errors here
                console.log('Error: ' + e.message);
            });
    }
});

function getdata(addr_list) {
    //var ret = [];
    return new Promise((resolve, reject) => {  //using promise
        var mySubString;
        https.get(addr_list, (response) => {
            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                mySubString = data.substring(
                    data.lastIndexOf("<title>") + 7,
                    data.lastIndexOf("</title>")
                );
                resolve(mySubString);
            });

        }).on("error", (err) => {
            var mesg = 'NO RESPONSE';
            resolve(mesg)
        });
    });

}

//res.send(qdata);


app.get('*', function (req, res) {
    res.status(404).send('404 PAGE NOT FOUND');
});
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))