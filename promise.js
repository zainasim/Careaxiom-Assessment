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
    var ddata;
    if (!Array.isArray(qdata)) {
        var parse = url.parse(qdata, true);
        if (!parse.protocol) {
            f_addr = "https://" + qdata;
        }
        else {
            f_addr = qdata;
        }
        getdata(f_addr)
            .then(result => {
                ddata = { title: qdata, mesg: result };
                res.render("result", { y_data: ddata });
            });
    }
    else {
        f_addr = qdata;
        for (i = 0; i < f_addr.length; i++) {
            var temp = url.parse(f_addr[i], true);
            if (!temp.protocol) {
                f_addr[i] = "https://" + f_addr[i];
            }
            else {
                f_addr[i] = f_addr[i];
            }   
            getdata(f_addr[i])
            .then(result => {
                ddata = { title: qdata, mesg: result };
            });
        }
        setTimeout(() =>{
            res.render("result", { y_data: ddata });
            //console.log(ddata);
        },3000);
        
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
            ddata = { title: f_addr, mesg: 'NO RESPONSE' }
            res.render("result", { y_data: ddata });
        });
    });
}

//res.send(qdata);


app.get('*', function (req, res) {
    res.status(404).send('404 PAGE NOT FOUND');
});
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))