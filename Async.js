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
var ret = [];
app.get('/I/want/title', (req, res) => {
    var qdata = req.query.address;
    var f_addr;
    var ddata = [];
    if (!Array.isArray(qdata)) {         //checking if array or not
        var parse = url.parse(qdata, true);
        if (!parse.protocol) {
            f_addr = "https://" + qdata;
        }
        else {
            f_addr = qdata;
        }
        async function display() {            //using async 
            try {
                const result = await getdata(f_addr);   //wait for the response from promise
                ddata.push(qdata);
                res.render("result", { title: ddata, mesg: result });
            }
            catch (err) {
                console.log('Error', err.message);
            }
        }
        display();
    } 
    else {                     //if more than one address i.e. array
        f_addr = qdata; 
        var result;
        var iterator = 0;
        for (i = 0; i < f_addr.length; i++) {
            var temp = url.parse(f_addr[i], true);
            if (!temp.protocol) {
                f_addr[i] = "https://" + f_addr[i];
            }
            else {
                f_addr[i] = f_addr[i];
            }
            async function get_data() {   //calling async function for each address
                try {
                    result = await getdata(f_addr[i]);  //waiting for reponse from promise to proceed further
                    iterator++;
                    if (iterator == f_addr.length) {
                        res.render("result", { title: qdata, mesg: result });
                    }
                }
                catch (err) {
                    console.log('Error', err.message);
                }
            }
            get_data();
        }

    }
});

function getdata(f_addr) {
    return new Promise((resolve, reject) => {
        var mySubString;
        https.get(f_addr, (response) => {
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
                ret.push(mySubString);
                resolve(ret);
            });

        }).on("error", (err) => {
            const mesg = 'NO RESPONSE'
            ret.push(mesg);
            resolve(ret)
            //res.render("result", { y_data: ddata });
        });
    });
}

//res.send(qdata);


app.get('*', function (req, res) {
    res.status(404).send('404 PAGE NOT FOUND');
});
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))