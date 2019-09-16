var NodeHelper = require("node_helper");
const http = require('http');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
var fs = require("fs");

module.exports = NodeHelper.create({

    start: function(){

        console.log("Starting stop fetcher for: " + this.name);

    },

    socketNotificationReceived: function(notification, payload){

        var self = this;

        switch (notification){

            case "EMT_LANGUAGE":
                var lFile = "./modules/MMM-EMTValencia/translations/" + payload + ".json";
                var lCont;

                if (fs.existsSync(lFile)){
                    lCont = fs.readFileSync("./modules/MMM-EMTValencia/translations/" + payload + ".json");
                } else {
                    lCont = fs.readFileSync("./modules/MMM-EMTValencia/translations/en.json");
                }

                this.langFile = JSON.parse(lCont);
                break;
            case "EMT_INIT":
                this.config = payload;
                setInterval(function(){
                    self.updateBusInfo();
                }, this.config.updateInterval * 1000);
                break;
            default:
                console.log(this.name + ": Unknown notification received (helper).");

        }

    },

    updateBusInfo: function(){

        console.log(this.name + ': Received request to update info.');

        var self = this;
        var url = "";

        if (this.config.stopLine == null){
            url = "http://servicios.emtvalencia.es/pre/estimaciones/estimacion.php?parada=" + this.config.stopNumber;
        } else {
            url = "http://servicios.emtvalencia.es/pre/estimaciones/estimacion.php?parada=" + this.config.stopNumber + "&linea=" + this.config.stopLine;
        }

        let req = http.get(url, function(res) {
            let data = '';
            res.on('data', function(stream) {
                data += stream;
            });
            res.on('end', function(){
                parser.parseString(data, function(error, result) {
                    if(error === null) {

                        var buses = []
                        p = result["estimacion"]["solo_parada"][0]["bus"]

                        for (var i=0; i<p.length; i++){
                            elem = p[i]
                            
                            // console.log(self.langFile)
                            // console.log(elem);

                            resp = elem["linea"] + " - " + elem["destino"] + " | ";
                            
                            if ("minutos" in elem && elem["minutos"][0].trim() != ""){
                                resp += elem["minutos"];
                            } else if ("horaLlegada" in elem && elem["horaLlegada"][0].trim() != ""){
                                resp += elem["horaLlegada"];
                            } else if ("error" in elem && elem["error"][0].trim() != ""){
                                if (elem["error"] == "SENSE ESTIMACIONS"){
                                    resp += self.langFile["NO_DATA"];
                                } else if (elem["error"] == "LÍNIA DESVIADA"){
                                    resp += self.langFile["DIVERTED_LINE"];
                                } else {
                                    resp += elem["error"];
                                }
                            } else {
                                resp += self.langFile["GENERIC_ERROR"];
                            }

                            buses.push(resp);
                        }

                        self.sendSocketNotification("BUS_INFO", {data: buses});

                    }
                    else {
                        console.log(error);
                    }
                });
            });
        });

    },


});