var app = require("express")();
var bodyParser = require("body-parser");
var https = require('https')
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
    var addr_list = []
    if (!Array.isArray(qdata)) {
        var parse = url.parse(qdata, true);
        if (!parse.protocol) {
            f_addr = "https://" + qdata;
        }
        else {
            f_addr = qdata;
        }
        addr_list.push(f_addr)
        getdata(addr_list, function (result) {
            ddata.push(qdata);
            res.render("result", { title: ddata, mesg: result });

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
            addr_list.push(f_addr[i])
        }
        getdata(addr_list, function (result) {
            res.render("result", { title: qdata, mesg: result });
        });
    }
});

function getdata(f_addr_list, callback) {
    var totaltasks = f_addr_list.length;
    var tasksfinished = 0;
    var ret = [];
    var i;
    // helper function
    var check = function () {
        if (totaltasks == tasksfinished) {
            callback(ret);
        }
    }
    for (i = 0; i < f_addr_list.length; i++) {
        var mySubString;
        https.get(f_addr_list[i], (response) => {
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
                tasksfinished++;
                check();

            });

        }).on("error", (err) => {
            var edata = 'NO RESPONSE';
            tasksfinished++;
            ret.push(edata)
            check();
        });
    }
}


app.get('*', function (req, res) {
    res.status(404).send('404 PAGE NOT FOUND');
});
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))